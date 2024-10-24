import React, { useEffect, useState } from 'react';
import { ProviderConfig } from '../app/types';
import { configStore } from '../app/config';
import { migrationService } from '../app/services/migration';
import { ProviderSelector } from './components/ProviderSelector';
import { ProviderSettings } from './components/ProviderSettings';
import { ProviderTester } from './components/ProviderTester';
import './App.css';

function App() {
    const [providerConfig, setProviderConfig] = useState<ProviderConfig>({
        selectedProvider: 'openai',
        providers: {}
    });
    const [translationEnabled, setTranslationEnabled] = useState(false);
    const [migrationStatus, setMigrationStatus] = useState<{
        inProgress: boolean;
        message?: string;
        error?: string;
    }>({ inProgress: false });

    // Handle migration and configuration loading
    useEffect(() => {
        const initializeApp = async () => {
            try {
                // Check if migration is needed
                const needsMigration = await migrationService.checkMigrationNeeded();
                
                if (needsMigration) {
                    setMigrationStatus({ inProgress: true, message: 'Starting migration...' });
                    
                    // Subscribe to migration progress
                    const progressSubscription = migrationService.onProgress.subscribe(message => {
                        setMigrationStatus(prev => ({ ...prev, message }));
                    });

                    // Perform migration
                    const result = await migrationService.migrate();
                    
                    if (result.success) {
                        // Load the migrated configuration
                        const migratedConfig = await configStore.providerConfig.get();
                        setProviderConfig(migratedConfig);
                        setMigrationStatus({
                            inProgress: false,
                            message: 'Migration completed successfully'
                        });
                    } else {
                        setMigrationStatus({
                            inProgress: false,
                            error: result.message
                        });
                    }

                    progressSubscription.unsubscribe();
                } else {
                    // Just load the current configuration
                    const [config, translation] = await Promise.all([
                        configStore.providerConfig.get(),
                        configStore.enableTranslation.get()
                    ]);

                    setProviderConfig(config);
                    setTranslationEnabled(translation);
                }
            } catch (error) {
                setMigrationStatus({
                    inProgress: false,
                    error: error instanceof Error ? error.message : 'Failed to initialize'
                });
            }
        };

        initializeApp();
    }, []);

    const handleProviderChange = async (providerId: string) => {
        const newConfig = {
            ...providerConfig,
            selectedProvider: providerId
        };

        // Validate the configuration
        const errors = await migrationService.validateConfiguration(newConfig);
        if (errors.length > 0) {
            setMigrationStatus({
                inProgress: false,
                error: `Invalid configuration: ${errors.join(', ')}`
            });
            return;
        }

        setProviderConfig(newConfig);
        await configStore.providerConfig.set(newConfig);
    };

    const handleSettingsChange = async (settings: any) => {
        const newConfig = {
            ...providerConfig,
            providers: {
                ...providerConfig.providers,
                [providerConfig.selectedProvider]: settings
            }
        };

        // Validate the configuration
        const errors = await migrationService.validateConfiguration(newConfig);
        if (errors.length > 0) {
            setMigrationStatus({
                inProgress: false,
                error: `Invalid configuration: ${errors.join(', ')}`
            });
            return;
        }

        setProviderConfig(newConfig);
        await configStore.providerConfig.set(newConfig);
    };

    const handleToggleTranslation = (event: React.ChangeEvent<HTMLInputElement>) => {
        setTranslationEnabled(event.target.checked);
        configStore.enableTranslation.set(event.target.checked);
    };

    if (migrationStatus.inProgress) {
        return (
            <div className="container">
                <div className="box migration-status">
                    <h2>Migrating Configuration</h2>
                    <div className="migration-progress">
                        <div className="spinner"></div>
                        <p>{migrationStatus.message}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container">
            <div className="box">
                <h2>Provider Configuration</h2>

                {migrationStatus.error && (
                    <div className="error-message">
                        {migrationStatus.error}
                    </div>
                )}
                
                <ProviderSelector
                    selectedProvider={providerConfig.selectedProvider}
                    onProviderChange={handleProviderChange}
                />

                <div className="divider" />

                <ProviderSettings
                    providerId={providerConfig.selectedProvider}
                    settings={providerConfig.providers[providerConfig.selectedProvider] || {
                        token: '',
                        settings: {}
                    }}
                    onSettingsChange={handleSettingsChange}
                />

                <div className="divider" />

                <div className="global-settings">
                    <label className="checkbox-label">
                        <input
                            type="checkbox"
                            checked={translationEnabled}
                            onChange={handleToggleTranslation}
                        />
                        Enable Translation
                    </label>
                </div>

                <div className="divider" />

                <ProviderTester providerConfig={providerConfig} />

                {migrationStatus.message && !migrationStatus.error && (
                    <div className="success-message">
                        {migrationStatus.message}
                    </div>
                )}
            </div>
        </div>
    );
}

export default App;
