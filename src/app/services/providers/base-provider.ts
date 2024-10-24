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

export interface TextCompletionOptions {
    systemPrompt: string;
    userPrompt: string;
    maxTokens?: number;
    stream?: boolean;
    jsonMode?: boolean;
}

export interface TextCompletionResult {
    text: string;
    error?: string;
}

export interface StreamCallbacks {
    onChunk: (chunk: string) => void;
    onError: (error: string) => void;
    onComplete: () => void;
}

export abstract class BaseProvider {
    constructor(
        protected provider: ApiProvider,
        protected settings: ProviderSettings
    ) {}

    abstract transcribe(options: TranscriptionOptions): Promise<TranscriptionResult>;

    async completeText(options: TextCompletionOptions): Promise<TextCompletionResult> {
        if (!this.provider.capabilities.textCompletion) {
            return {
                text: '',
                error: `Text completion not supported by ${this.provider.name}`
            };
        }

        if (options.stream) {
            return {
                text: '',
                error: 'Use streamTextCompletion for streaming responses'
            };
        }

        return this.handleTextCompletion(options);
    }

    async streamTextCompletion(
        options: TextCompletionOptions,
        callbacks: StreamCallbacks
    ): Promise<void> {
        if (!this.provider.capabilities.textCompletion) {
            callbacks.onError(`Text completion not supported by ${this.provider.name}`);
            return;
        }

        if (!options.stream) {
            callbacks.onError('Stream option must be true for streaming responses');
            return;
        }

        await this.handleStreamingTextCompletion(options, callbacks);
    }

    protected abstract handleTextCompletion(options: TextCompletionOptions): Promise<TextCompletionResult>;

    protected abstract handleStreamingTextCompletion(
        options: TextCompletionOptions,
        callbacks: StreamCallbacks
    ): Promise<void>;

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
        return error?.message || 'An error occurred during processing';
    }
}
