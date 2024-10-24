import { configStore } from "../config";
import { providerFactory } from "./providers";
import { Subject } from "rxjs";

const FIX_GRAMMAR_SYSTEM_PROMPT = `
Fix the grammar in the following text and only return the corrected text. Here are some examples:

ORIGINAL:
I'm going to the store and I will buy some milk.

FIXED:
I'm going to the store to buy some milk.

ORIGINAL:
The cat jumped over the wall and ran away.

FIXED:
The cat jumped over the wall and ran away.

ORIGINAL:
I hope life has been doing well with you and your family. This text have some grammar issues as you can see.

FIXED:
I hope life has been treating you and your family well. This text has some grammar issues, as you can see.
`;

class Enhancer {
    private enhancementObservable = new Subject<string>();
    private errorObservable = new Subject<string>();

    get onEnhancement() {
        return this.enhancementObservable.asObservable();
    }

    get onError() {
        return this.errorObservable.asObservable();
    }

    async fixGrammar(text: string, stream: boolean = false): Promise<string> {
        try {
            const providerConfig = await configStore.providerConfig.get();
            const provider = providerFactory.getProvider(providerConfig);

            if (stream) {
                let enhancedText = '';
                await provider.streamTextCompletion(
                    {
                        systemPrompt: FIX_GRAMMAR_SYSTEM_PROMPT,
                        userPrompt: `ORIGINAL:\n${text}\n\nFIXED:`,
                        stream: true
                    },
                    {
                        onChunk: (chunk) => {
                            enhancedText += chunk;
                            this.enhancementObservable.next(enhancedText);
                        },
                        onError: (error) => {
                            this.errorObservable.next(error);
                        },
                        onComplete: () => {
                            // Final update with complete text
                            this.enhancementObservable.next(enhancedText);
                        }
                    }
                );
                return enhancedText;
            } else {
                const result = await provider.completeText({
                    systemPrompt: FIX_GRAMMAR_SYSTEM_PROMPT,
                    userPrompt: `ORIGINAL:\n${text}\n\nFIXED:`,
                    stream: false
                });

                if (result.error) {
                    this.errorObservable.next(result.error);
                    return text; // Return original text on error
                }

                return result.text;
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'An error occurred during enhancement';
            this.errorObservable.next(errorMessage);
            return text; // Return original text on error
        }
    }
}

export const enhancer = new Enhancer();
