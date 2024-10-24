import React, { ChangeEvent } from 'react';
import { ApiProvider, ProviderSettings as IProviderSettings } from '../../app/types';
import { providers } from '../../app/config';

interface ProviderSettingsComponentProps {
    providerId: string;
    settings: IProviderSettings;
    onSettingsChange: (settings: IProviderSettings) => void;
}

export const ProviderSettings: React.FC<ProviderSettingsComponentProps> = ({
    providerId,
    settings,
    onSettingsChange
}) => {
    const provider = providers[providerId];

    const handleTokenChange = (event: ChangeEvent<HTMLInputElement>) => {
        onSettingsChange({
            ...settings,
            token: event.target.value
        });
    };

    const handleModelChange = (event: ChangeEvent<HTMLSelectElement>) => {
        onSettingsChange({
            ...settings,
            model: event.target.value
        });
    };

    const handlePromptChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
        onSettingsChange({
            ...settings,
            settings: {
                ...settings.settings,
                prompt: event.target.value
            }
        });
    };

    const handleResponseFormatChange = (event: ChangeEvent<HTMLSelectElement>) => {
        onSettingsChange({
            ...settings,
            settings: {
                ...settings.settings,
                response_format: event.target.value
            }
        });
    };

    return (
        <div className="provider-settings">
            <div className="setting-group">
                <label className="label">API Token</label>
                <input
                    type={settings.token ? 'password' : 'text'}
                    value={settings.token || ''}
                    onChange={handleTokenChange}
                    className="input"
                    placeholder={`Enter your ${provider.name} API token`}
                />
            </div>

            <div className="setting-group">
                <label className="label">Model</label>
                <select
                    value={settings.model || provider.models.transcription[0].id}
                    onChange={handleModelChange}
                    className="select"
                >
                    {provider.models.transcription.map(model => (
                        <option key={model.id} value={model.id}>
                            {model.name} - ${model.costPerHour.toFixed(3)}/hr
                        </option>
                    ))}
                </select>
            </div>

            <div className="setting-group">
                <label className="label">Prompt Template</label>
                <textarea
                    value={settings.settings?.prompt || ''}
                    onChange={handlePromptChange}
                    className="textarea"
                    rows={4}
                    placeholder="Enter a prompt template..."
                />
                <div className="prompt-guidelines">
                    <h4>Guidelines:</h4>
                    <ul>
                        {provider.promptGuidelines.bestPractices.map((practice, index) => (
                            <li key={index}>{practice}</li>
                        ))}
                    </ul>
                </div>
            </div>

            {provider.limitations.supportedResponseFormats.length > 1 && (
                <div className="setting-group">
                    <label className="label">Response Format</label>
                    <select
                        value={settings.settings?.response_format || provider.limitations.supportedResponseFormats[0]}
                        onChange={handleResponseFormatChange}
                        className="select"
                    >
                        {provider.limitations.supportedResponseFormats.map(format => (
                            <option key={format} value={format}>
                                {format}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            <div className="provider-limitations">
                <h4>Limitations:</h4>
                <ul>
                    <li>Max file size: {(provider.limitations.maxFileSize / (1024 * 1024)).toFixed(1)} MB</li>
                    <li>Supported formats: {provider.limitations.supportedFileTypes.join(', ')}</li>
                    {provider.limitations.minBilledLength > 0 && (
                        <li>Minimum billed duration: {provider.limitations.minBilledLength}s</li>
                    )}
                </ul>
            </div>
        </div>
    );
};
