import React from 'react';
import { providers } from '../../app/config';
import { ApiProvider } from '../../app/types';

interface ProviderSelectorProps {
    selectedProvider: string;
    onProviderChange: (providerId: string) => void;
}

export const ProviderSelector: React.FC<ProviderSelectorProps> = ({
    selectedProvider,
    onProviderChange
}) => {
    const providerList = Object.entries(providers).map(([id, provider]) => ({
        id,
        ...provider
    }));

    const getProviderCapabilities = (provider: ApiProvider) => {
        const capabilities: string[] = [];
        if (provider.capabilities.transcription) capabilities.push('Transcription');
        if (provider.capabilities.translation) capabilities.push('Translation');
        if (provider.capabilities.textCompletion) capabilities.push('Text Completion');
        return capabilities;
    };

    return (
        <div className="provider-selector">
            <label className="label">Select Provider</label>
            <div className="provider-list">
                {providerList.map(provider => (
                    <div
                        key={provider.id}
                        className={`provider-option ${selectedProvider === provider.id ? 'selected' : ''}`}
                        onClick={() => onProviderChange(provider.id)}
                    >
                        <div className="provider-header">
                            <h3>{provider.name}</h3>
                            <div className="provider-capabilities">
                                {getProviderCapabilities(provider).map(capability => (
                                    <span key={capability} className="capability-badge">
                                        {capability}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div className="provider-details">
                            <div className="model-info">
                                <strong>Available Models:</strong>
                                <ul>
                                    {provider.models.transcription.map(model => (
                                        <li key={model.id}>
                                            {model.name}
                                            {model.hasTranslation && ' (Translation Support)'}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="provider-metrics">
                                <div className="metric">
                                    <span>Cost/Hour:</span>
                                    <span>${provider.models.transcription[0].costPerHour.toFixed(3)}</span>
                                </div>
                                <div className="metric">
                                    <span>Speed Factor:</span>
                                    <span>{provider.models.transcription[0].speedFactor}x</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
