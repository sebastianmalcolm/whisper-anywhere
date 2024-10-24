# Provider Interfaces

This document details the TypeScript interfaces and implementations for API providers in the Whisper Anywhere Chrome extension.

## Core Interfaces

### ApiProvider Interface
```typescript
interface ApiProvider {
  name: string;
  capabilities: {
    transcription: boolean;
    translation: boolean;
    textCompletion: boolean;
  };
  models: {
    transcription: {
      id: string;
      name: string;
      languages: 'multilingual' | 'english-only';
      hasTranslation: boolean;
      costPerHour: number;
      speedFactor: number;
      errorRate: number;
    }[];
  };
  endpoints: {
    transcription?: string;
    translation?: string;
    textCompletion?: string;
  };
  limitations: {
    maxFileSize: number;
    minFileLength: number;
    minBilledLength: number;
    supportedFileTypes: string[];
    supportedResponseFormats: string[];
  };
  translation?: TranslationCapability;
  promptGuidelines: PromptGuidelines;
}

interface TranslationCapability {
  sourceLanguages: string[];
  targetLanguage: string;
  modelSupport: {
    [modelId: string]: boolean;
  };
}

interface PromptGuidelines {
  maxTokens: number;
  bestPractices: string[];
  restrictions: string[];
}
```

## Provider Implementations

### Groq Provider
```typescript
const groqProvider: ApiProvider = {
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
    maxFileSize: 25 * 1024 * 1024, // 25 MB
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
};
```

### OpenAI Provider
```typescript
const openaiProvider: ApiProvider = {
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
};
