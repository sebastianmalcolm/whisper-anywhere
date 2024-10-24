import { ApiProvider, ProviderSettings } from '../../types';
import { BaseProvider, TranscriptionOptions, TranscriptionResult, TextCompletionOptions, TextCompletionResult, StreamCallbacks } from './base-provider';
import Groq from 'groq-sdk';

export class GroqProvider extends BaseProvider {
    private groqClient: Groq;

    constructor(provider: ApiProvider, settings: ProviderSettings) {
        super(provider, settings);
        this.groqClient = new Groq({
            apiKey: settings.token
        });
    }

    async transcribe(options: TranscriptionOptions): Promise<TranscriptionResult> {
        try {
            const validationError = await this.validateAudioFile(options.file);
            if (validationError) {
                return { text: '', error: validationError };
            }

            // Determine if translation is supported for the selected model
            if (options.translate) {
                const model = this.settings.model || this.getDefaultModel();
                if (!this.provider.translation?.modelSupport[model]) {
                    return {
                        text: '',
                        error: `Translation not supported for model: ${model}`
                    };
                }
            }

            const requestUrl = options.translate
                ? this.provider.endpoints.translation!
                : this.provider.endpoints.transcription!;

            const formData = new FormData();
            formData.append('file', options.file, 'recording.webm');
            formData.append('model', this.settings.model || this.getDefaultModel());
            
            if (options.prompt || this.settings.settings?.prompt) {
                const prompt = options.prompt || this.settings.settings?.prompt || '';
                if (prompt.length > this.provider.promptGuidelines.maxTokens) {
                    return {
                        text: '',
                        error: `Prompt exceeds maximum length of ${this.provider.promptGuidelines.maxTokens} tokens`
                    };
                }
                formData.append('prompt', prompt);
            }

            // Add response format preference if specified
            // Note: Groq doesn't support vtt or srt formats
            if (this.settings.settings?.response_format) {
                const format = this.settings.settings.response_format;
                if (!this.provider.limitations.supportedResponseFormats.includes(format)) {
                    return {
                        text: '',
                        error: `Unsupported response format: ${format}`
                    };
                }
                formData.append('response_format', format);
            }

            const response = await fetch(requestUrl, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${this.settings.token}`
                },
                body: formData
            });

            if (!response.ok) {
                const error = await response.text();
                throw new Error(error);
            }

            const result = await response.json();
            return { text: result.text };
        } catch (error) {
            const errorMessage = await this.handleApiError(error);
            return { text: '', error: errorMessage };
        }
    }

    protected async handleTextCompletion(options: TextCompletionOptions): Promise<TextCompletionResult> {
        try {
            const isJsonMode = options.jsonMode || 
                             options.systemPrompt.includes('JSON') || 
                             options.systemPrompt.includes('json_object') ||
                             options.userPrompt.toLowerCase().includes('json');

            const completion = await this.groqClient.chat.completions.create({
                messages: [
                    {
                        role: 'system',
                        content: options.systemPrompt
                    },
                    {
                        role: 'user',
                        content: options.userPrompt
                    }
                ],
                model: 'mixtral-8x7b-32768', // Using Mixtral as recommended for JSON generation
                temperature: isJsonMode ? 0 : 0.5, // Use 0 temperature for JSON mode
                max_tokens: options.maxTokens || 1024,
                top_p: 1,
                stream: false,
                ...(isJsonMode && {
                    response_format: { type: 'json_object' }
                })
            });

            return {
                text: completion.choices[0]?.message?.content || ''
            };
        } catch (error) {
            const errorMessage = await this.handleApiError(error);
            return { text: '', error: errorMessage };
        }
    }

    protected async handleStreamingTextCompletion(
        options: TextCompletionOptions,
        callbacks: StreamCallbacks
    ): Promise<void> {
        try {
            const stream = await this.groqClient.chat.completions.create({
                messages: [
                    {
                        role: 'system',
                        content: options.systemPrompt
                    },
                    {
                        role: 'user',
                        content: options.userPrompt
                    }
                ],
                model: 'mixtral-8x7b-32768',
                temperature: 0.5,
                max_tokens: options.maxTokens || 1024,
                top_p: 1,
                stream: true
            });

            for await (const chunk of stream) {
                const content = chunk.choices[0]?.delta?.content || '';
                if (content) {
                    callbacks.onChunk(content);
                }
            }
            callbacks.onComplete();
        } catch (error) {
            const errorMessage = await this.handleApiError(error);
            callbacks.onError(errorMessage);
        }
    }

    protected getDefaultModel(): string {
        // Prefer the fastest model with lowest error rate
        return this.provider.models.transcription
            .sort((a, b) => {
                // First, compare error rates
                if (a.errorRate !== b.errorRate) {
                    return a.errorRate - b.errorRate;
                }
                // If error rates are equal, compare speed factors
                return b.speedFactor - a.speedFactor;
            })[0].id;
    }
}
