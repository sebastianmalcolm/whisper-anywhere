import { configStore } from "../config";

const TEXT_COMPLETION_MODEL_URL = 'https://api.openai.com/v1/chat/completions';
const MODEL_NAME = 'gpt-4o';

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
    async fixGrammar(text: string): Promise<string> {
        const token = await configStore.token.get();

        const response = await fetch(TEXT_COMPLETION_MODEL_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                model: MODEL_NAME,
                messages: [
                    {
                        role: 'system',
                        content: FIX_GRAMMAR_SYSTEM_PROMPT,
                    },
                    {
                        role: 'user',
                        content: `ORIGINAL:\n${text}\n\nFIXED:`,
                    }
                ],
                max_tokens: 100
            })
        });

        const data = await response.json();
        return data.choices[0].message.content;
    }
}

export const enhancer = new Enhancer();