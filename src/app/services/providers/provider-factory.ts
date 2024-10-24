import { ApiProvider, ProviderConfig } from '../../types';
import { providers } from '../../config';
import { BaseProvider } from './base-provider';
import { OpenAIProvider } from './openai-provider';
import { GroqProvider } from './groq-provider';

export class ProviderFactory {
    private static instance: ProviderFactory;
    private providerInstances: Map<string, BaseProvider> = new Map();

    private constructor() {}

    static getInstance(): ProviderFactory {
        if (!ProviderFactory.instance) {
            ProviderFactory.instance = new ProviderFactory();
        }
        return ProviderFactory.instance;
    }

    getProvider(config: ProviderConfig): BaseProvider {
        const providerId = config.selectedProvider;
        
        // Check if we already have an instance for this provider
        const existingProvider = this.providerInstances.get(providerId);
        if (existingProvider) {
            return existingProvider;
        }

        // Get provider definition
        const providerDef = providers[providerId];
        if (!providerDef) {
            throw new Error(`Unknown provider: ${providerId}`);
        }

        // Get provider settings
        const settings = config.providers[providerId];
        if (!settings?.token) {
            throw new Error(`No token configured for provider: ${providerId}`);
        }

        // Create new provider instance
        const provider = this.createProvider(providerDef, settings);
        this.providerInstances.set(providerId, provider);
        
        return provider;
    }

    private createProvider(provider: ApiProvider, settings: any): BaseProvider {
        switch (provider.name.toLowerCase()) {
            case 'openai':
                return new OpenAIProvider(provider, settings);
            case 'groq':
                return new GroqProvider(provider, settings);
            default:
                throw new Error(`Unsupported provider: ${provider.name}`);
        }
    }

    clearProviders(): void {
        this.providerInstances.clear();
    }
}

// Export singleton instance
export const providerFactory = ProviderFactory.getInstance();
