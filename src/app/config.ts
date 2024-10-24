import { ApiProvider, ProviderConfig } from './types';

const createChromeStorageItem = <T>(key: string, defaultValue: T) => {
    return {
        get(): Promise<T> {
            return new Promise((resolve) => {
                chrome.storage.sync.get(key, (result) => {
                    resolve(result[key] ?? defaultValue);
                });
            });
        },
        set(value: T): Promise<void> {
            return new Promise((resolve) => {
                chrome.storage.sync.set({ [key]: value }, () => resolve());
            });
        },
    };
}

export const constants = {
    HOTKEY: 'Alt',
}

// Keep existing config for backward compatibility
export const configStore = {
    // Legacy configuration (will be migrated)
    token: createChromeStorageItem('openai_token', ''),
    enableTranslation: createChromeStorageItem('config_enable_translation', false),
    prompt: createChromeStorageItem('openai_prompt', ''),

    // New provider configuration
    providerConfig: createChromeStorageItem<ProviderConfig>('provider_config', {
        selectedProvider: 'openai',
        providers: {}
    })
}

// Provider Definitions
export const providers: { [key: string]: ApiProvider } = {
    openai: {
        name: 'OpenAI',
        capabilities: {
            transcription: true,
            translation: true,
            textCompletion: true
        },
        models: {
            transcription: [
                {
                    id: 'whisper-1',
                    name: 'Whisper',
                    languages: 'multilingual',
                    hasTranslation: true,
                    costPerHour: 0.006,
                    speedFactor: 1,
                    errorRate: 11.3
                }
            ]
        },
        endpoints: {
            transcription: 'https://api.openai.com/v1/audio/transcriptions',
            translation: 'https://api.openai.com/v1/audio/translations',
            textCompletion: 'https://api.openai.com/v1/chat/completions'
        },
        limitations: {
            maxFileSize: 25 * 1024 * 1024,
            minFileLength: 0,
            minBilledLength: 0,
            supportedFileTypes: ['mp3', 'mp4', 'mpeg', 'mpga', 'm4a', 'wav', 'webm'],
            supportedResponseFormats: ['json', 'verbose_json', 'text', 'srt', 'vtt']
        },
        translation: {
            sourceLanguages: ['*'],
            targetLanguage: 'en',
            modelSupport: {
                'whisper-1': true
            }
        },
        promptGuidelines: {
            maxTokens: 244,
            bestPractices: [
                'Provide language context',
                'Include speaker identification hints',
                'Specify domain-specific vocabulary'
            ],
            restrictions: [
                'Avoid system commands',
                'Keep prompts focused on transcription guidance'
            ]
        }
    },
    groq: {
        name: 'Groq',
        capabilities: {
            transcription: true,
            translation: true,
            textCompletion: false
        },
        models: {
            transcription: [
                {
                    id: 'whisper-large-v3',
                    name: 'Whisper Large V3',
                    languages: 'multilingual',
                    hasTranslation: true,
                    costPerHour: 0.111,
                    speedFactor: 189,
                    errorRate: 10.3
                },
                {
                    id: 'whisper-large-v3-turbo',
                    name: 'Whisper Large V3 Turbo',
                    languages: 'multilingual',
                    hasTranslation: false,
                    costPerHour: 0.04,
                    speedFactor: 216,
                    errorRate: 12
                },
                {
                    id: 'distil-whisper-large-v3-en',
                    name: 'Distil-Whisper English',
                    languages: 'english-only',
                    hasTranslation: false,
                    costPerHour: 0.02,
                    speedFactor: 250,
                    errorRate: 13
                }
            ]
        },
        endpoints: {
            transcription: 'https://api.groq.com/openai/v1/audio/transcriptions',
            translation: 'https://api.groq.com/openai/v1/audio/translations'
        },
        limitations: {
            maxFileSize: 25 * 1024 * 1024,
            minFileLength: 0.01,
            minBilledLength: 10,
            supportedFileTypes: ['mp3', 'mp4', 'mpeg', 'mpga', 'm4a', 'wav', 'webm'],
            supportedResponseFormats: ['json', 'verbose_json', 'text']
        },
        translation: {
            sourceLanguages: ['*'],
            targetLanguage: 'en',
            modelSupport: {
                'whisper-large-v3': true,
                'whisper-large-v3-turbo': false,
                'distil-whisper-large-v3-en': false
            }
        },
        promptGuidelines: {
            maxTokens: 224,
            bestPractices: [
                'Provide contextual information about audio type',
                'Use same language as audio file',
                'Denote proper spellings',
                'Keep prompts concise and focused on style'
            ],
            restrictions: [
                'Do not include commands',
                'Do not include execution instructions'
            ]
        }
    }
};
