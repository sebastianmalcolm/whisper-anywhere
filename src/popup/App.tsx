/* global chrome */
import React, { ChangeEvent, useEffect, useState } from 'react';
import './App.css';

function App() { 
    const [token, setToken] = useState('');
    const [prompt, setPrompt] = useState('');
    const [translationEnabled, setTranslationEnabled] = useState(false);

    // Retrieve stored data
    useEffect(() => {
        const retrieveState = async () => {
            await chrome.storage?.sync.get(['openai_token', 'openai_prompt', 'config_enable_translation'], (result) => {
                console.log('Config retrieved:', { ...result, openai_token: result.openai_token ? '***' : '' });
                if (result.openai_token) {
                    setToken(result.openai_token);
                }
                if (result.openai_prompt) {
                    setPrompt(result.openai_prompt);
                }
                if (result.config_enable_translation) {
                    setTranslationEnabled(result.config_enable_translation);
                }
            });
        };
        retrieveState();
    }, []);

    const handleTokenChange = (event: ChangeEvent<HTMLInputElement>) => {
        setToken(event.target.value);
        chrome.storage?.sync.set({ openai_token: event.target.value }, () => {
            console.log('Config stored:', { openai_token: event.target.value });
        });
    };

    const handlePromptChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
        setPrompt(event.target.value);
        chrome.storage?.sync.set({ openai_prompt: event.target.value }, () => {
            console.log('Config stored:', { openai_prompt: event.target.value });
        });
    };

    const handleToggleTranslation = (event: ChangeEvent<HTMLInputElement>) => {
        setTranslationEnabled(event.target.checked);
        chrome.storage?.sync.set({ config_enable_translation: event.target.checked }, () => {
            console.log('Config stored:', { config_enable_translation: event.target.checked });
        });
    };

    return (
        <div className="container">
            <div className="box">
                <div className="inputGroup">
                    <label htmlFor="token" className="label">OpenAI API Token</label>
                    <input
                        type={token.length > 0 ? 'password' : 'text'}
                        id="token"
                        value={token}
                        onChange={handleTokenChange}
                        className="input"
                        placeholder="sk-..."
                    />
                </div>
                <div className="inputGroup">
                    <label htmlFor="prompt" className="label">Prompt</label>
                    <textarea
                        id="prompt"
                        value={prompt}
                        onChange={handlePromptChange}
                        className="textarea"
                        rows={4}
                        placeholder="Enter your prompt..."
                    />
                </div>
            </div>
        </div>
    );
}

export default App;
