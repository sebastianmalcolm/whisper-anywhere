import { ApiProvider, ProviderSettings } from '../../types';
import { BaseProvider, TranscriptionOptions, TranscriptionResult } from './base-provider';

export class GroqProvider extends BaseProvider {
    constructor(provider: ApiProvider, settings: ProviderSettings) {
        super(provider, settings);
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
            if (this.settings.settings?.response_format) {
                formData.append('response_format', this.settings.settings.response_format);
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
