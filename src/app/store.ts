class PersistentItem<T> {
    constructor(private key: string) {}

    async get(): Promise<T> {
        return await chrome.storage.sync.get(this.key) as T;
    }

    async set(value: T): Promise<void> {
        return await chrome.storage.sync.set({ [this.key]: value });
    }
}

// Persistent configuration store for the extension
export const configStore = {
    token: new PersistentItem<string>('openai_token'),
    enableTranslation: new PersistentItem<boolean>('config_enable_translation'),
    prompt: new PersistentItem<string>('openai_prompt'),
}
