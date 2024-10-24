# Configuration Structures

This document details the configuration structures and management for API providers in the Whisper Anywhere Chrome extension.

## Provider Configuration

### Core Types
```typescript
interface ProviderConfig {
  selectedProvider: string;
  providers: {
    [key: string]: {
      token: string;
      model?: string;
      settings: {
        temperature?: number;
        language?: string;
        prompt?: string;
        response_format?: 'json' | 'verbose_json' | 'text';
      };
    };
  };
}
```

### Configuration Store
```typescript
// Extended version of src/app/config.ts
const configStore = {
  // Legacy config (for migration)
  token: createChromeStorageItem('openai_token', ''),
  enableTranslation: createChromeStorageItem('config_enable_translation', false),
  prompt: createChromeStorageItem('openai_prompt', ''),
  
  // New provider config
  providerConfig: createChromeStorageItem<ProviderConfig>('provider_config', {
    selectedProvider: 'openai',
    providers: {}
  }),
  
  // Provider-specific settings
  providerSettings: {
    groq: createChromeStorageItem('groq_settings', {
      preferredModel: 'whisper-large-v3-turbo',
      autoPreprocess: true
    }),
    openai: createChromeStorageItem('openai_settings', {
      preferredModel: 'whisper-1',
      autoPreprocess: false
    })
  }
};
```

## Configuration Management

### Provider Settings Manager
```typescript
class ProviderSettingsManager {
  async getProviderConfig(providerName: string): Promise<ProviderConfig['providers'][string]> {
    const config = await configStore.providerConfig.get();
    return config.providers[providerName] || {
      token: '',
      settings: {}
    };
  }

  async updateProviderConfig(
    providerName: string,
    updates: Partial<ProviderConfig['providers'][string]>
  ): Promise<void> {
    const config = await configStore.providerConfig.get();
    config.providers[providerName] = {
      ...config.providers[providerName],
      ...updates
    };
    await configStore.providerConfig.set(config);
  }

  async setSelectedProvider(providerName: string): Promise<void> {
    const config = await configStore.providerConfig.get();
    config.selectedProvider = providerName;
    await configStore.providerConfig.set(config);
  }

  async getProviderSettings<T extends keyof typeof configStore.providerSettings>(
    provider: T
  ): Promise<typeof configStore.providerSettings[T] extends {
    get: () => Promise<infer U>;
  }
    ? U
    : never> {
    return configStore.providerSettings[provider].get();
  }
}
```

### Configuration Validation
```typescript
interface ValidationResult {
  valid: boolean;
  errors: string[];
}

class ConfigValidator {
  validateProviderConfig(
    config: ProviderConfig,
    provider: ApiProvider
  ): ValidationResult {
    const errors: string[] = [];
    const providerConfig = config.providers[provider.name];

    if (!providerConfig?.token) {
      errors.push(`Missing API token for ${provider.name}`);
    }

    if (providerConfig?.model && !provider.models.transcription.find(
      m => m.id === providerConfig.model
    )) {
      errors.push(`Invalid model selected for ${provider.name}`);
    }

    if (providerConfig?.settings.language && 
        provider.translation?.sourceLanguages !== '*' &&
        !provider.translation?.sourceLanguages.includes(
          providerConfig.settings.language
        )) {
      errors.push(`Unsupported language for ${provider.name}`);
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}
```

## Usage Examples

### Setting Up a New Provider
```typescript
async function setupProvider(
  provider: ApiProvider,
  token: string,
  settings: ProviderConfig['providers'][string]['settings']
): Promise<void> {
  const manager = new ProviderSettingsManager();
  await manager.updateProviderConfig(provider.name, {
    token,
    settings
  });
}
```

### Switching Providers
```typescript
async function switchProvider(newProvider: string): Promise<void> {
  const manager = new ProviderSettingsManager();
  const validator = new ConfigValidator();
  
  // Get provider implementation
  const provider = providerRegistry.get(newProvider);
  
  // Validate configuration
  const config = await configStore.providerConfig.get();
  const validation = validator.validateProviderConfig(config, provider);
  
  if (!validation.valid) {
    throw new Error(
      `Invalid configuration for ${newProvider}: ${validation.errors.join(', ')}`
    );
  }
  
  // Update selected provider
  await manager.setSelectedProvider(newProvider);
}
