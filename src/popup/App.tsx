import React, { useEffect, useState } from 'react';
import { ProviderConfig } from '../app/types';
import { configStore } from '../app/config';
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

    // Retrieve stored data
    useEffect(() => {
        const retrieveState = async () => {
            const [config, translation] = await Promise.all([
                configStore.providerConfig.get(),
                configStore.enableTranslation.get()
            ]);

            setProviderConfig(config);
            setTranslationEnabled(translation);

            // Handle legacy configuration if needed
            const legacyToken = await configStore.token.get();
            const legacyPrompt = await configStore.prompt.get();

            if (legacyToken && !config.providers.openai?.token) {
                setProviderConfig(prev => ({
                    ...prev,
                    providers: {
                        ...prev.providers,
                        openai: {
                            token: legacyToken,
                            settings: {
                                prompt: legacyPrompt
                            }
                        }
                    }
                }));
            }
        };

        retrieveState();
    }, []);

    const handleProviderChange = (providerId: string) => {
        setProviderConfig(prev => ({
            ...prev,
            selectedProvider: providerId
        }));
        configStore.providerConfig.set({
            ...providerConfig,
            selectedProvider: providerId
        });
    };

    const handleSettingsChange = (settings: any) => {
        setProviderConfig(prev => ({
            ...prev,
            providers: {
                ...prev.providers,
                [prev.selectedProvider]: settings
            }
        }));
        configStore.providerConfig.set({
            ...providerConfig,
            providers: {
                ...providerConfig.providers,
                [providerConfig.selectedProvider]: settings
            }
        });
    };

    const handleToggleTranslation = (event: React.ChangeEvent<HTMLInputElement>) => {
        setTranslationEnabled(event.target.checked);
        configStore.enableTranslation.set(event.target.checked);
    };

    return (
        <div className="container">
            <div className="box">
                <h2>Provider Configuration</h2>
                
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
            </div>
        </div>
    );
}

export default App;
