import { ApiProvider, ProviderSettings } from '../../types';
import { BaseProvider, TranscriptionOptions, TranscriptionResult } from './base-provider';

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
}
