# Testing & Security Considerations

This document outlines the testing strategy and security considerations for the API provider choice feature in the Whisper Anywhere Chrome extension.

## Testing Strategy

### 1. Unit Tests

#### Provider Interface Tests
```typescript
describe('Provider Interface', () => {
  test('validates provider implementation', () => {
    const provider: ApiProvider = {
      // ... provider implementation
    };
    
    expect(validateProvider(provider)).toBeTruthy();
  });

  test('validates model support', () => {
    const provider = getProvider('groq');
    const model = 'whisper-large-v3';
    
    expect(provider.models.transcription)
      .toContainEqual(expect.objectContaining({ id: model }));
  });
});
```

#### Configuration Tests
```typescript
describe('Provider Configuration', () => {
  test('stores and retrieves provider config', async () => {
    const config: ProviderConfig = {
      selectedProvider: 'groq',
      providers: {
        groq: {
          token: 'test-token',
          settings: {}
        }
      }
    };
    
    await configStore.providerConfig.set(config);
    const stored = await configStore.providerConfig.get();
    
    expect(stored).toEqual(config);
  });
});
```

#### Migration Tests
```typescript
describe('Configuration Migration', () => {
  beforeEach(async () => {
    await configStore.token.set('old-token');
    await configStore.prompt.set('old-prompt');
  });

  test('migrates existing configuration', async () => {
    await migrateConfiguration();
    
    const newConfig = await configStore.providerConfig.get();
    expect(newConfig.providers.openai.token).toBe('old-token');
    expect(newConfig.providers.openai.settings.prompt).toBe('old-prompt');
  });
});
```

### 2. Integration Tests

#### Audio Processing Tests
```typescript
describe('Audio Processing', () => {
  test('preprocesses audio correctly', async () => {
    const audioBlob = new Blob([/* audio data */]);
    const processed = await audioProcessor.preprocessAudio(audioBlob);
    
    expect(processed.size).toBeLessThanOrEqual(25 * 1024 * 1024);
    expect(processed.type).toBe('audio/wav');
  });
});
```

#### API Integration Tests
```typescript
describe('API Integration', () => {
  test('transcribes audio with selected provider', async () => {
    const provider = getProvider('groq');
    const audio = new Blob([/* audio data */]);
    
    const result = await transcriber.transcribe(audio);
    expect(result).toHaveProperty('text');
  });
});
```

### 3. E2E Tests

#### Provider Switching Tests
```typescript
describe('Provider Switching', () => {
  test('switches providers and maintains functionality', async () => {
    // Set up providers
    await setupProviders();
    
    // Switch provider
    await switchProvider('groq');
    
    // Verify transcription still works
    const audio = new Blob([/* audio data */]);
    const result = await transcriber.transcribe(audio);
    expect(result).toHaveProperty('text');
  });
});
```

## Security Considerations

### 1. Token Storage

#### Secure Storage Implementation
```typescript
class SecureStorage {
  private async encrypt(value: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(value);
    
    const key = await crypto.subtle.generateKey(
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );
    
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      data
    );
    
    return JSON.stringify({
      key: await crypto.subtle.exportKey('jwk', key),
      iv: Array.from(iv),
      data: Array.from(new Uint8Array(encrypted))
    });
  }

  async storeToken(provider: string, token: string): Promise<void> {
    const encrypted = await this.encrypt(token);
    await chrome.storage.sync.set({
      [`${provider}_token`]: encrypted
    });
  }
}
```

### 2. Request Validation

#### Request Sanitization
```typescript
class RequestValidator {
  validateAudioRequest(
    blob: Blob,
    provider: ApiProvider
  ): Promise<ValidationResult> {
    return new Promise(async (resolve) => {
      // Check file size
      if (blob.size > provider.limitations.maxFileSize) {
        resolve({
          valid: false,
          error: 'File too large'
        });
        return;
      }

      // Check file type
      const fileType = blob.type.split('/')[1];
      if (!provider.limitations.supportedFileTypes.includes(fileType)) {
        resolve({
          valid: false,
          error: 'Unsupported file type'
        });
        return;
      }

      // Additional checks...
      resolve({ valid: true });
    });
  }

  sanitizePrompt(prompt: string): string {
    // Remove potential XSS
    return prompt.replace(/<[^>]*>/g, '');
  }
}
```

### 3. Rate Limiting

#### Rate Limiter Implementation
```typescript
class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  
  async checkLimit(
    provider: string,
    limit: number,
    window: number
  ): Promise<boolean> {
    const now = Date.now();
    const timestamps = this.requests.get(provider) || [];
    
    // Remove old timestamps
    const recent = timestamps.filter(
      time => now - time < window
    );
    
    if (recent.length >= limit) {
      return false;
    }
    
    recent.push(now);
    this.requests.set(provider, recent);
    return true;
  }
}
```

### 4. Error Handling

#### Secure Error Handler
```typescript
class ErrorHandler {
  private sanitizeError(error: any): string {
    // Remove sensitive information
    const message = error?.message || 'An error occurred';
    return message.replace(/Bearer [a-zA-Z0-9\-._~+/]+=*/g, '[REDACTED]');
  }

  handleApiError(error: any): void {
    const sanitized = this.sanitizeError(error);
    
    // Log sanitized error
    console.error('API Error:', sanitized);
    
    // Notify user
    chrome.notifications.create({
      type: 'basic',
      title: 'Error',
      message: sanitized,
      iconUrl: 'icons/icon128.png'
    });
  }
}
```

## Performance Monitoring

### 1. Usage Metrics
```typescript
class MetricsCollector {
  private metrics: Map<string, number> = new Map();
  
  trackApiCall(provider: string, duration: number): void {
    const current = this.metrics.get(provider) || 0;
    this.metrics.set(provider, current + 1);
    
    // Log performance
    console.debug(`${provider} API call: ${duration}ms`);
  }
}
```

### 2. Error Tracking
```typescript
class ErrorTracker {
  private errors: Map<string, Error[]> = new Map();
  
  trackError(provider: string, error: Error): void {
    const current = this.errors.get(provider) || [];
    current.push(error);
    this.errors.set(provider, current);
    
    // Alert if error rate is high
    if (this.getErrorRate(provider) > 0.1) {
      console.warn(`High error rate for ${provider}`);
    }
  }
}
