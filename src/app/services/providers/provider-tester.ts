import { BaseProvider, TextCompletionResult } from './base-provider';
import { Subject } from 'rxjs';

export interface TestResult {
    success: boolean;
    message: string;
    details?: {
        latency?: number;
        tokensUsed?: number;
        model?: string;
        capabilities?: string[];
    };
}

export class ProviderTester {
    private testProgressObservable = new Subject<string>();
    private testResultObservable = new Subject<TestResult>();

    get onProgress() {
        return this.testProgressObservable.asObservable();
    }

    get onResult() {
        return this.testResultObservable.asObservable();
    }

    async testProvider(provider: BaseProvider): Promise<TestResult> {
        this.testProgressObservable.next('Starting provider test...');

        try {
            // Test text completion capability
            this.testProgressObservable.next('Testing text completion...');
            const startTime = Date.now();
            
            const result = await provider.completeText({
                systemPrompt: 'You are a helpful assistant.',
                userPrompt: 'Explain the importance of fast language models in one sentence.',
                maxTokens: 100
            });

            if (result.error) {
                throw new Error(`Text completion failed: ${result.error}`);
            }

            const latency = Date.now() - startTime;

            // Test streaming capability
            this.testProgressObservable.next('Testing streaming capability...');
            let streamingWorks = false;
            let streamedContent = '';

            await provider.streamTextCompletion(
                {
                    systemPrompt: 'You are a helpful assistant.',
                    userPrompt: 'Count from 1 to 5.',
                    maxTokens: 50,
                    stream: true
                },
                {
                    onChunk: (chunk) => {
                        streamingWorks = true;
                        streamedContent += chunk;
                        this.testProgressObservable.next(`Received streaming chunk: ${chunk}`);
                    },
                    onError: (error) => {
                        this.testProgressObservable.next(`Streaming error: ${error}`);
                    },
                    onComplete: () => {
                        this.testProgressObservable.next('Streaming test completed');
                    }
                }
            );

            // Test JSON mode
            this.testProgressObservable.next('Testing JSON mode...');
            const jsonResult = await provider.completeText({
                systemPrompt: 'You are a JSON generator.',
                userPrompt: 'Generate a JSON object with a "test" field containing "success".',
                jsonMode: true
            });

            const jsonCapability = !jsonResult.error && 
                                 jsonResult.text.includes('"test"') && 
                                 jsonResult.text.includes('"success"');

            const testResult: TestResult = {
                success: true,
                message: 'All provider tests completed successfully',
                details: {
                    latency,
                    capabilities: [
                        'Text Completion',
                        streamingWorks ? 'Streaming' : null,
                        jsonCapability ? 'JSON Mode' : null
                    ].filter(Boolean) as string[]
                }
            };

            this.testResultObservable.next(testResult);
            return testResult;

        } catch (error) {
            const failedResult: TestResult = {
                success: false,
                message: `Provider test failed: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
            this.testResultObservable.next(failedResult);
            return failedResult;
        }
    }
}

export const providerTester = new ProviderTester();
