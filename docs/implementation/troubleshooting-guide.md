# Troubleshooting Guide

This document provides detailed technical information for debugging and resolving issues with the Voice-to-Text Chrome extension.

## Provider Integration Issues

### OpenAI

#### API Authentication
```typescript
// Check for correct authorization header format
const headers = new Headers({
    'Authorization': `Bearer ${token}` // Must include 'Bearer '
});
```

Common Errors:
- 401: Invalid API key
- 403: API key lacks permissions
- 429: Rate limit exceeded

#### Model Selection
```typescript
// Supported models
const SUPPORTED_MODELS = {
    WHISPER: 'whisper-1'
};

// Model validation
if (!SUPPORTED_MODELS[selectedModel]) {
    throw new Error('Unsupported model');
}
```

### Groq

#### SDK Integration
```typescript
// Correct SDK initialization
import Groq from 'groq-sdk';
const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

// Common initialization issues
try {
    const client = new Groq();
} catch (error) {
    if (error.message.includes('apiKey')) {
        console.error('API key not provided');
    }
}
```

#### Known Limitations
- No support for `logprobs`
- No support for `logit_bias`
- No support for `top_logprobs`
- No support for `messages[].name`
- N must equal 1 if supplied

## Audio Processing

### Recording Issues

#### Permission Handling
```typescript
async function requestMicrophoneAccess() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        return stream;
    } catch (error) {
        if (error.name === 'NotAllowedError') {
            throw new Error('Microphone permission denied');
        }
        if (error.name === 'NotFoundError') {
            throw new Error('No microphone found');
        }
        throw error;
    }
}
```

#### Audio Format Validation
```typescript
function validateAudioFormat(blob: Blob): boolean {
    const validTypes = ['audio/webm', 'audio/mp3', 'audio/wav'];
    return validTypes.includes(blob.type);
}

function validateFileSize(blob: Blob): boolean {
    const MAX_SIZE = 25 * 1024 * 1024; // 25MB
    return blob.size <= MAX_SIZE;
}
```

## Configuration Issues

### Migration Problems

#### Legacy Config Detection
```typescript
async function detectLegacyConfig() {
    const legacyToken = await chrome.storage.sync.get('openai_token');
    return !!legacyToken;
}
```

#### Migration Failure Recovery
```typescript
async function recoverFromFailedMigration() {
    // 1. Check for backup
    const backup = await chrome.storage.local.get('migration_backup');
    if (!backup) return false;

    // 2. Restore from backup
    await chrome.storage.sync.set(backup);
    
    // 3. Clear backup
    await chrome.storage.local.remove('migration_backup');
    
    return true;
}
```

### Storage Issues

#### Chrome Storage Limits
- `chrome.storage.sync`: 8KB per item, 100KB total
- `chrome.storage.local`: 10MB per extension

```typescript
// Check storage usage
async function checkStorageUsage() {
    const usage = await chrome.storage.sync.getBytesInUse();
    const limit = chrome.storage.sync.QUOTA_BYTES;
    return usage < limit;
}
```

## UI Issues

### Component Rendering

#### Provider Selection
```typescript
// Verify provider configuration
function validateProviderConfig(config: ProviderConfig): string[] {
    const errors = [];
    if (!config.selectedProvider) {
        errors.push('No provider selected');
    }
    if (!config.providers[config.selectedProvider]?.token) {
        errors.push('Provider token not configured');
    }
    return errors;
}
```

#### Settings Updates
```typescript
// Handle settings update failures
async function updateSettings(settings: ProviderSettings) {
    try {
        await chrome.storage.sync.set({ provider_settings: settings });
    } catch (error) {
        if (error.message.includes('QUOTA_BYTES')) {
            // Handle storage limit exceeded
            console.error('Storage quota exceeded');
        }
    }
}
```

## Performance Optimization

### Memory Management

#### Stream Cleanup
```typescript
function cleanupStream(stream: MediaStream) {
    stream.getTracks().forEach(track => {
        track.stop();
        stream.removeTrack(track);
    });
}
```

#### Resource Release
```typescript
function releaseResources() {
    if (audioContext) {
        audioContext.close();
        audioContext = null;
    }
    if (analyser) {
        analyser.disconnect();
        analyser = null;
    }
}
```

### Error Handling Best Practices

#### Graceful Degradation
```typescript
async function handleProviderFailure(error: Error) {
    // 1. Log error for debugging
    console.error('Provider error:', error);

    // 2. Check if fallback is available
    const fallbackProvider = await getFallbackProvider();
    if (fallbackProvider) {
        return useFallbackProvider(fallbackProvider);
    }

    // 3. Show user-friendly error
    throw new UserFacingError(
        'Service temporarily unavailable',
        error.message
    );
}
```

## Testing

### Provider Testing

#### Connection Test
```typescript
async function testProviderConnection(provider: BaseProvider): Promise<boolean> {
    try {
        const result = await provider.completeText({
            systemPrompt: 'Test connection',
            userPrompt: 'Hello',
            maxTokens: 1
        });
        return !result.error;
    } catch {
        return false;
    }
}
```

#### Performance Test
```typescript
async function testProviderPerformance(provider: BaseProvider): Promise<number> {
    const start = performance.now();
    await provider.transcribe({
        file: testAudioBlob,
        translate: false
    });
    return performance.now() - start;
}
```

## Common Solutions

1. **API Connection Issues**
   - Verify network connectivity
   - Check API key format
   - Validate request headers
   - Monitor rate limits

2. **Audio Processing Problems**
   - Verify microphone permissions
   - Check audio format compatibility
   - Monitor memory usage
   - Clean up resources properly

3. **Configuration Errors**
   - Validate provider settings
   - Check storage limits
   - Handle migration failures
   - Maintain configuration backups

4. **Performance Issues**
   - Implement proper cleanup
   - Monitor memory leaks
   - Use appropriate error handling
   - Implement fallback mechanisms
