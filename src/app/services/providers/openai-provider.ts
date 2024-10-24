import { ApiProvider, ProviderSettings } from '../../types';
import { BaseProvider, TranscriptionOptions, TranscriptionResult, TextCompletionOptions, TextCompletionResult, StreamCallbacks } from './base-provider';

export class OpenAIProvider extends BaseProvider {
    constructor(provider: ApiProvider, settings: ProviderSettings) {
        super(provider, settings);
    }

    async transcribe(options: TranscriptionOptions): Promise<TranscriptionResult> {
        try {
            const validationError = await this.validateAudioFile(options.file);
            if (validationError) {
                return { text: '', error: validationError };
            }

            const requestUrl = options.translate
                ? this.provider.endpoints.translation!
                : this.provider.endpoints.transcription!;

            const formData = new FormData();
            formData.append('file', options.file, 'recording.webm');
            formData.append('model', this.settings.model || this.getDefaultModel());
            
            if (options.prompt || this.settings.settings?.prompt) {
                formData.append('prompt', options.prompt || this.settings.settings?.prompt || '');
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
            if (!this.provider.endpoints.textCompletion) {
                return {
                    text: '',
                    error: 'Text completion endpoint not configured'
                };
            }

            const response = await fetch(this.provider.endpoints.textCompletion, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.settings.token}`
                },
                body: JSON.stringify({
                    model: 'gpt-4',
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
                    max_tokens: options.maxTokens || 100,
                    ...(options.jsonMode && {
                        response_format: { type: 'json_object' }
                    })
                })
            });

            if (!response.ok) {
                const error = await response.text();
                throw new Error(error);
            }

            const result = await response.json();
            return { text: result.choices[0].message.content };
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
            if (!this.provider.endpoints.textCompletion) {
                callbacks.onError('Text completion endpoint not configured');
                return;
            }

            const response = await fetch(this.provider.endpoints.textCompletion, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.settings.token}`
                },
                body: JSON.stringify({
                    model: 'gpt-4',
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
                    max_tokens: options.maxTokens || 100,
                    stream: true,
                    ...(options.jsonMode && {
                        response_format: { type: 'json_object' }
                    })
                })
            });

            if (!response.ok) {
                const error = await response.text();
                throw new Error(error);
            }

            const reader = response.body?.getReader();
            if (!reader) {
                throw new Error('Response body is not readable');
            }

            const decoder = new TextDecoder();
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split('\n').filter(line => line.trim() !== '');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6);
                        if (data === '[DONE]') continue;

                        try {
                            const parsed = JSON.parse(data);
                            const content = parsed.choices[0]?.delta?.content;
                            if (content) {
                                callbacks.onChunk(content);
                            }
                        } catch (e) {
                            console.warn('Failed to parse chunk:', e);
                        }
                    }
                }
            }

            callbacks.onComplete();
        } catch (error) {
            const errorMessage = await this.handleApiError(error);
            callbacks.onError(errorMessage);
        }
    }
}
