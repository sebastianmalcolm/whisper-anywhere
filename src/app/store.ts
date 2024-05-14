class PersistentItem<T> {
    constructor(private key: string) {}

    get(): Promise<T> {
        return new Promise((resolve) => {
            chrome.storage.sync.get(this.key, (result) => {
                resolve(result[this.key]);
            });
        });
    }

    set(value: T): Promise<void> {
        return new Promise((resolve) => {
            chrome.storage.sync.set({ [this.key]: value }, () => resolve());
        });
    }
}

// Persistent configuration store for the extension
export const configStore = {
    token: new PersistentItem<string>('openai_token'),
    enableTranslation: new PersistentItem<boolean>('config_enable_translation'),
    prompt: new PersistentItem<string>('openai_prompt'),
}
