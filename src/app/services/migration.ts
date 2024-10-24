import { configStore } from '../config';
import { ProviderConfig } from '../types';
import { Subject } from 'rxjs';

interface MigrationResult {
    success: boolean;
    message: string;
    details?: {
        migratedData?: string[];
        warnings?: string[];
    };
}

class MigrationService {
    private migrationProgressSubject = new Subject<string>();
    private migrationResultSubject = new Subject<MigrationResult>();

    get onProgress() {
        return this.migrationProgressSubject.asObservable();
    }

    get onResult() {
        return this.migrationResultSubject.asObservable();
    }

    async checkMigrationNeeded(): Promise<boolean> {
        const [legacyToken, providerConfig] = await Promise.all([
            configStore.token.get(),
            configStore.providerConfig.get()
        ]);

        return !!legacyToken && !providerConfig.providers.openai?.token;
    }

    async migrate(): Promise<MigrationResult> {
        try {
            this.migrationProgressSubject.next('Starting migration...');

            // Get all legacy configuration
            const [legacyToken, legacyPrompt, legacyTranslation] = await Promise.all([
                configStore.token.get(),
                configStore.prompt.get(),
                configStore.enableTranslation.get()
            ]);

            if (!legacyToken) {
                return {
                    success: true,
                    message: 'No legacy configuration found, migration not needed'
                };
            }

            this.migrationProgressSubject.next('Retrieved legacy configuration');

            // Get current provider configuration
            const currentConfig = await configStore.providerConfig.get();

            // Create backup
            const backup = {
                timestamp: Date.now(),
                legacyToken,
                legacyPrompt,
                legacyTranslation,
                currentConfig
            };

            await chrome.storage.local.set({ migration_backup: backup });
            this.migrationProgressSubject.next('Created configuration backup');

            // Update provider configuration
            const newConfig: ProviderConfig = {
                selectedProvider: 'openai',
                providers: {
                    ...currentConfig.providers,
                    openai: {
                        token: legacyToken,
                        settings: {
                            prompt: legacyPrompt
                        }
                    }
                }
            };

            await configStore.providerConfig.set(newConfig);
            this.migrationProgressSubject.next('Updated provider configuration');

            // Clear legacy configuration
            await Promise.all([
                configStore.token.set(''),
                configStore.prompt.set('')
            ]);
            this.migrationProgressSubject.next('Cleared legacy configuration');

            // Keep translation setting as it's still used globally
            const result: MigrationResult = {
                success: true,
                message: 'Migration completed successfully',
                details: {
                    migratedData: [
                        'OpenAI API token',
                        'Prompt template',
                        'Translation setting'
                    ]
                }
            };

            this.migrationResultSubject.next(result);
            return result;

        } catch (error) {
            const result: MigrationResult = {
                success: false,
                message: `Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
                details: {
                    warnings: ['Automatic migration failed, manual configuration may be required']
                }
            };

            this.migrationResultSubject.next(result);
            return result;
        }
    }

    async rollback(): Promise<boolean> {
        try {
            const backup = await chrome.storage.local.get('migration_backup');
            if (!backup.migration_backup) {
                throw new Error('No backup found');
            }

            const {
                legacyToken,
                legacyPrompt,
                legacyTranslation,
                currentConfig
            } = backup.migration_backup;

            // Restore legacy configuration
            await Promise.all([
                configStore.token.set(legacyToken),
                configStore.prompt.set(legacyPrompt),
                configStore.enableTranslation.set(legacyTranslation),
                configStore.providerConfig.set(currentConfig)
            ]);

            return true;
        } catch (error) {
            console.error('Rollback failed:', error);
            return false;
        }
    }

    async validateConfiguration(config: ProviderConfig): Promise<string[]> {
        const errors: string[] = [];

        if (!config.selectedProvider) {
            errors.push('No provider selected');
        }

        const selectedProvider = config.providers[config.selectedProvider];
        if (!selectedProvider) {
            errors.push('Selected provider configuration not found');
        } else {
            if (!selectedProvider.token) {
                errors.push('API token not configured');
            }
        }

        return errors;
    }

    async cleanup(): Promise<void> {
        await chrome.storage.local.remove('migration_backup');
    }
}

export const migrationService = new MigrationService();
