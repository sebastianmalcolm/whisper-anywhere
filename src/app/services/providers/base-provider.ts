import { ApiProvider, ProviderSettings } from '../../types';

export interface TranscriptionOptions {
    file: Blob;
    prompt?: string;
    translate?: boolean;
}

export interface TranscriptionResult {
    text: string;
    error?: string;
}

export abstract class BaseProvider {
    constructor(
        protected provider: ApiProvider,
        protected settings: ProviderSettings
    ) {}

    abstract transcribe(options: TranscriptionOptions): Promise<TranscriptionResult>;

    protected async validateAudioFile(file: Blob): Promise<string | null> {
        if (file.size > this.provider.limitations.maxFileSize) {
            return `File size exceeds ${this.provider.limitations.maxFileSize / (1024 * 1024)}MB limit`;
        }

        const fileType = file.type.split('/')[1];
        if (!this.provider.limitations.supportedFileTypes.includes(fileType)) {
            return `Unsupported file type: ${fileType}. Supported types: ${this.provider.limitations.supportedFileTypes.join(', ')}`;
        }

        return null;
    }

    protected getDefaultModel(): string {
        return this.provider.models.transcription[0].id;
    }

    protected async handleApiError(error: any): Promise<string> {
        console.error(`${this.provider.name} API Error:`, error);
        return error?.message || 'An error occurred during transcription';
    }
}
