import React, { useState } from 'react';
import { providerFactory, providerTester, TestResult } from '../../app/services/providers';
import { ProviderConfig } from '../../app/types';

interface ProviderTesterProps {
    providerConfig: ProviderConfig;
}

export const ProviderTester: React.FC<ProviderTesterProps> = ({
    providerConfig
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<TestResult | null>(null);
    const [progress, setProgress] = useState<string[]>([]);

    const handleTest = async () => {
        setIsLoading(true);
        setResult(null);
        setProgress([]);

        try {
            const provider = providerFactory.getProvider(providerConfig);

            // Subscribe to progress updates
            const subscription = providerTester.onProgress.subscribe(message => {
                setProgress(prev => [...prev, message]);
            });

            // Run the test
            const testResult = await providerTester.testProvider(provider);
            setResult(testResult);

            // Cleanup subscription
            subscription.unsubscribe();
        } catch (error) {
            setResult({
                success: false,
                message: error instanceof Error ? error.message : 'Test failed'
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="provider-tester">
            <button
                className={`test-button ${isLoading ? 'loading' : ''}`}
                onClick={handleTest}
                disabled={isLoading}
            >
                {isLoading ? 'Testing...' : 'Test Connection'}
            </button>

            {progress.length > 0 && (
                <div className="test-progress">
                    <h4>Test Progress:</h4>
                    <ul>
                        {progress.map((message, index) => (
                            <li key={index} className="progress-item">
                                {message}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {result && (
                <div className={`test-result ${result.success ? 'success' : 'error'}`}>
                    <h4>{result.success ? 'Test Passed' : 'Test Failed'}</h4>
                    <p>{result.message}</p>
                    
                    {result.success && result.details && (
                        <div className="test-details">
                            {result.details.latency && (
                                <div className="metric">
                                    <span>Latency:</span>
                                    <span>{result.details.latency}ms</span>
                                </div>
                            )}
                            {result.details.capabilities && (
                                <div className="capabilities">
                                    <span>Verified Capabilities:</span>
                                    <ul>
                                        {result.details.capabilities.map((cap, index) => (
                                            <li key={index}>{cap}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
