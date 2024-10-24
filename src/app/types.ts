export interface ButtonGroupAction {
    type: 'button-group-action';
    icon: React.FC;
    action: () => void;
    hotkey: string;
}

interface ButtonGroupSpacer {
    type: 'button-group-spacer';
}

export type ButtonGroupElement = ButtonGroupAction | ButtonGroupSpacer;

// Provider Types
export interface ApiProviderCapabilities {
    transcription: boolean;
    translation: boolean;
    textCompletion: boolean;
}

export interface ApiProviderModel {
    id: string;
    name: string;
    languages: 'multilingual' | 'english-only';
    hasTranslation: boolean;
    costPerHour: number;
    speedFactor: number;
    errorRate: number;
}

export interface ApiProviderLimitations {
    maxFileSize: number;
    minFileLength: number;
    minBilledLength: number;
    supportedFileTypes: string[];
    supportedResponseFormats: string[];
}

export interface ApiProviderTranslation {
    sourceLanguages: string[];
    targetLanguage: string;
    modelSupport: {
        [modelId: string]: boolean;
    };
}

export interface ApiProviderPromptGuidelines {
    maxTokens: number;
    bestPractices: string[];
    restrictions: string[];
}

export interface ApiProvider {
    name: string;
    capabilities: ApiProviderCapabilities;
    models: {
        transcription: ApiProviderModel[];
    };
    endpoints: {
        transcription?: string;
        translation?: string;
        textCompletion?: string;
    };
    limitations: ApiProviderLimitations;
    translation?: ApiProviderTranslation;
    promptGuidelines: ApiProviderPromptGuidelines;
}

// Provider Configuration Types
export interface ProviderSettings {
    token: string;
    model?: string;
    settings?: {
        prompt?: string;
        response_format?: string;
        [key: string]: any;
    };
}

export interface ProviderConfig {
    selectedProvider: string;
    providers: {
        [provider: string]: ProviderSettings;
    };
}
