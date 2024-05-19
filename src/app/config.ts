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
    TRANSCRIPTION_URL: 'https://api.openai.com/v1/audio/transcriptions',
    TRANSLATION_URL: 'https://api.openai.com/v1/audio/translations',
    HOTKEY: 'Alt',
}

export const configStore = {
    token: createChromeStorageItem('openai_token', ''),
    enableTranslation: createChromeStorageItem('config_enable_translation', false),
    prompt: createChromeStorageItem('openai_prompt', ''),
}
