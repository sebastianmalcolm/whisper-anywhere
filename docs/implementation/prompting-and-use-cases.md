# Prompting Guidelines and Use Cases

This document details the prompting guidelines and supported use cases for speech-to-text providers in the Whisper Anywhere Chrome extension.

## Prompting Guidelines

### Token Limits
- Maximum 224 tokens for prompt parameter
- Designed for stylistic guidance and context
- Not for command execution or instruction following

### Best Practices

1. Contextual Information:
   ```typescript
   interface AudioContext {
     type: 'conversation' | 'presentation' | 'interview';
     topic?: string;
     speakers?: {
       count: number;
       roles?: string[];
     };
   }

   function generateContextPrompt(context: AudioContext): string {
     const parts = [];
     parts.push(`Content type: ${context.type}`);
     if (context.topic) {
       parts.push(`Topic: ${context.topic}`);
     }
     if (context.speakers) {
       parts.push(`Speakers: ${context.speakers.count}`);
       if (context.speakers.roles) {
         parts.push(`Roles: ${context.speakers.roles.join(', ')}`);
       }
     }
     return parts.join('. ');
   }
   ```

2. Language Matching:
   ```typescript
   function generateLanguagePrompt(
     audioLanguage: string,
     spellings?: Record<string, string>
   ): string {
     const parts = [`Audio language: ${audioLanguage}`];
     if (spellings) {
       const spellingGuide = Object.entries(spellings)
         .map(([word, spelling]) => `${word} (${spelling})`)
         .join(', ');
       parts.push(`Special spellings: ${spellingGuide}`);
     }
     return parts.join('. ');
   }
   ```

3. Style Guidance:
   ```typescript
   interface StyleGuide {
     tone?: 'formal' | 'casual' | 'technical';
     format?: 'paragraphs' | 'bullet-points' | 'verbatim';
     specialTerms?: string[];
   }

   function generateStylePrompt(style: StyleGuide): string {
     const parts = [];
     if (style.tone) {
       parts.push(`Use ${style.tone} tone`);
     }
     if (style.format) {
       parts.push(`Format as ${style.format}`);
     }
     if (style.specialTerms?.length) {
       parts.push(`Special terms: ${style.specialTerms.join(', ')}`);
     }
     return parts.join('. ');
   }
   ```

### What Not to Do

1. Avoid Command-Like Instructions:
   ```typescript
   function validatePrompt(prompt: string): boolean {
     const commandPatterns = [
       /^(run|execute|perform)\s/i,
       /^(please|kindly)\s+(do|make|create)/i,
       /^(start|begin|initiate)\s+process/i
     ];
     
     return !commandPatterns.some(pattern => pattern.test(prompt));
   }
   ```

2. Keep Focused on Style:
   ```typescript
   const PROMPT_CATEGORIES = {
     ALLOWED: [
       'context',
       'style',
       'spelling',
       'formatting'
     ],
     FORBIDDEN: [
       'commands',
       'instructions',
       'actions',
       'processing steps'
     ]
   };
   ```

## Use Cases

### 1. Audio Translation
```typescript
interface TranslationConfig {
  sourceLanguage: string;
  targetLanguage: string;
  preserveStyle: boolean;
  preserveSpeakerIdentity: boolean;
}

class AudioTranslator {
  async translate(
    audio: Blob,
    config: TranslationConfig
  ): Promise<string> {
    const provider = await this.getProvider();
    
    // Validate provider capabilities
    if (!provider.translation?.sourceLanguages.includes(config.sourceLanguage)) {
      throw new Error('Source language not supported');
    }
    
    // Generate appropriate prompt
    const prompt = this.generateTranslationPrompt(config);
    
    // Process translation
    const result = await this.processTranslation(audio, prompt);
    return result;
  }
}
```

### 2. Customer Service Integration
```typescript
interface ServiceConfig {
  environment: 'call-center' | 'chat-support' | 'email-response';
  realTimeProcessing: boolean;
  confidentialityLevel: 'public' | 'internal' | 'confidential';
}

class CustomerServiceProcessor {
  async processInteraction(
    audio: Blob,
    config: ServiceConfig
  ): Promise<{
    transcript: string;
    metadata: {
      duration: number;
      speakers: number;
      confidence: number;
    };
  }> {
    // Implementation for customer service processing
  }
}
```

### 3. Automated Documentation
```typescript
interface DocumentationConfig {
  industry: 'healthcare' | 'finance' | 'education';
  complianceLevel: 'standard' | 'hipaa' | 'sox';
  retentionPeriod: number;
}

class ComplianceDocumenter {
  async documentAudio(
    audio: Blob,
    config: DocumentationConfig
  ): Promise<{
    transcript: string;
    complianceMetadata: {
      timestamp: number;
      checksums: string[];
      signatures: string[];
    };
  }> {
    // Implementation for compliant documentation
  }
}
```

### 4. Voice-Controlled Interfaces
```typescript
interface VoiceControlConfig {
  device: 'smart-home' | 'car' | 'mobile';
  latencyRequirement: number;
  noiseReduction: boolean;
}

class VoiceController {
  async processCommand(
    audio: Blob,
    config: VoiceControlConfig
  ): Promise<{
    command: string;
    confidence: number;
    latency: number;
  }> {
    // Implementation for voice control processing
  }
}
```

## Integration Examples

### Browser Extension Integration
```typescript
class WhisperAnywhereIntegration {
  private async determineUseCase(
    context: {
      inputType: string;
      targetElement: HTMLElement;
      userPreferences: UserPreferences;
    }
  ): Promise<string> {
    if (context.targetElement.getAttribute('role') === 'textbox') {
      return 'general-transcription';
    }
    if (context.targetElement.closest('form')) {
      return 'form-filling';
    }
    return 'text-input';
  }

  async processAudio(
    audio: Blob,
    context: AudioContext
  ): Promise<string> {
    const useCase = await this.determineUseCase(context);
    const processor = this.getProcessor(useCase);
    return processor.process(audio, context);
  }
}
