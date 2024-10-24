# Migration Strategy

This document details the migration strategy for transitioning from the current OpenAI-specific configuration to the new multi-provider configuration in the Whisper Anywhere Chrome extension.

## Migration Process

### 1. Configuration Migration
```typescript
async function migrateConfiguration(): Promise<void> {
  // Get existing configuration
  const oldToken = await configStore.token.get();
  const oldPrompt = await configStore.prompt.get();
  const oldEnableTranslation = await configStore.enableTranslation.get();

  if (!oldToken) {
    // No existing configuration to migrate
    return;
  }

  // Create new provider configuration
  const newConfig: ProviderConfig = {
    selectedProvider: 'openai',
    providers: {
      openai: {
        token: oldToken,
        model: 'whisper-1',
        settings: {
          prompt: oldPrompt,
          response_format: 'json'
        }
      }
    }
  };

  // Store new configuration
  await configStore.providerConfig.set(newConfig);

  // Preserve translation setting
  await configStore.enableTranslation.set(oldEnableTranslation);

  // Clear old configuration
  await configStore.token.set('');
  await configStore.prompt.set('');
}
```

### 2. Data Preservation
```typescript
interface MigrationBackup {
  timestamp: number;
  oldConfig: {
    token: string;
    prompt: string;
    enableTranslation: boolean;
  };
  newConfig: ProviderConfig;
}

async function backupConfiguration(): Promise<void> {
  const backup: MigrationBackup = {
    timestamp: Date.now(),
    oldConfig: {
      token: await configStore.token.get(),
      prompt: await configStore.prompt.get(),
      enableTranslation: await configStore.enableTranslation.get()
    },
    newConfig: await configStore.providerConfig.get()
  };

  await chrome.storage.local.set({
    'config_backup': backup
  });
}

async function restoreFromBackup(): Promise<void> {
  const result = await chrome.storage.local.get('config_backup');
  const backup: MigrationBackup = result.config_backup;

  if (!backup) {
    throw new Error('No backup found');
  }

  // Restore old configuration
  await configStore.token.set(backup.oldConfig.token);
  await configStore.prompt.set(backup.oldConfig.prompt);
  await configStore.enableTranslation.set(backup.oldConfig.enableTranslation);

  // Clear new configuration
  await configStore.providerConfig.set({
    selectedProvider: 'openai',
    providers: {}
  });
}
```

### 3. Migration Verification
```typescript
interface MigrationVerification {
  success: boolean;
  errors: string[];
  warnings: string[];
}

async function verifyMigration(): Promise<MigrationVerification> {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Get new configuration
  const newConfig = await configStore.providerConfig.get();

  // Verify OpenAI configuration
  const openaiConfig = newConfig.providers.openai;
  if (!openaiConfig) {
    errors.push('Missing OpenAI configuration');
  } else {
    if (!openaiConfig.token) {
      errors.push('Missing OpenAI token');
    }
    if (!openaiConfig.settings) {
      warnings.push('Missing OpenAI settings');
    }
  }

  // Verify selected provider
  if (!newConfig.selectedProvider) {
    errors.push('No provider selected');
  }

  // Check for old configuration
  const oldToken = await configStore.token.get();
  if (oldToken) {
    warnings.push('Old token configuration still present');
  }

  return {
    success: errors.length === 0,
    errors,
    warnings
  };
}
```

## Migration Execution

### 1. Pre-migration Checks
```typescript
async function canMigrate(): Promise<boolean> {
  // Check if already migrated
  const newConfig = await configStore.providerConfig.get();
  if (newConfig.providers.openai?.token) {
    return false;
  }

  // Check if old configuration exists
  const oldToken = await configStore.token.get();
  return !!oldToken;
}
```

### 2. Migration Execution
```typescript
async function executeMigration(): Promise<void> {
  if (!await canMigrate()) {
    console.log('Migration not needed or already completed');
    return;
  }

  try {
    // Backup existing configuration
    await backupConfiguration();

    // Perform migration
    await migrateConfiguration();

    // Verify migration
    const verification = await verifyMigration();
    if (!verification.success) {
      throw new Error(
        `Migration failed: ${verification.errors.join(', ')}`
      );
    }

    if (verification.warnings.length > 0) {
      console.warn(
        'Migration warnings:',
        verification.warnings.join(', ')
      );
    }
  } catch (error) {
    // Restore from backup on failure
    await restoreFromBackup();
    throw error;
  }
}
```

### 3. Post-migration Cleanup
```typescript
async function cleanupMigration(): Promise<void> {
  // Remove backup after successful migration
  await chrome.storage.local.remove('config_backup');

  // Clear any remaining old configuration
  await configStore.token.set('');
  await configStore.prompt.set('');
}
```

## Rollback Strategy

### 1. Automatic Rollback
```typescript
async function autoRollback(): Promise<void> {
  try {
    await restoreFromBackup();
    console.log('Successfully rolled back configuration');
  } catch (error) {
    console.error('Failed to roll back:', error);
    throw new Error('Unable to restore configuration');
  }
}
```

### 2. Manual Recovery Steps
```typescript
async function manualRecovery(): Promise<void> {
  // Reset all configuration
  await chrome.storage.sync.clear();
  
  // Reinitialize with defaults
  await configStore.providerConfig.set({
    selectedProvider: 'openai',
    providers: {}
  });
}
