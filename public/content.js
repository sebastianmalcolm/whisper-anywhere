/* global chrome */
const SVG_MIC_HTML = `
<svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 512 512" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4 mr-1" height="1.2em" width="1.2em" style="margin-left:0.2em;" xmlns="http://www.w3.org/2000/svg"> 
    <line x1="192" y1="448" x2="320" y2="448" style="fill:none;stroke:#8e8ea0;stroke-linecap:square;stroke-miterlimit:10;stroke-width:48px"></line> 
    <path d="M384,208v32c0,70.4-57.6,128-128,128h0c-70.4,0-128-57.6-128-128V208" style="fill:none;stroke:#8e8ea0;stroke-linecap:square;stroke-miterlimit:10;stroke-width:48px"></path> 
    <line x1="256" y1="368" x2="256" y2="448" style="fill:none;stroke:#8e8ea0;stroke-linecap:square;stroke-miterlimit:10;stroke-width:48px"></line> 
    <path d="M256,320a78.83,78.83,0,0,1-56.55-24.1A80.89,80.89,0,0,1,176,239V128a79.69,79.69,0,0,1,80-80c44.86,0,80,35.14,80,80V239C336,283.66,300.11,320,256,320Z" style="fill:none;stroke:#8e8ea0;stroke-linecap:square;stroke-miterlimit:10;stroke-width:48px"></path>
</svg>`;

const SVG_MIC_SPINNING_HTML = `
<svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 512 512" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4 mr-1" height="1.2em" width="1.2em" style="margin-left:0.2em;" xmlns="http://www.w3.org/2000/svg">
    <style>.spinnerMic{transform-origin:center;animation:spinner_svv2 .75s infinite linear}@keyframes spinner_svv2{100%{transform:rotate(360deg)}}</style>
    <line x1="192" y1="448" x2="320" y2="448" style="fill:none;stroke:#8e8ea0;stroke-linecap:square;stroke-miterlimit:10;stroke-width:48px" class="spinnerMic"></line> 
    <path d="M384,208v32c0,70.4-57.6,128-128,128h0c-70.4,0-128-57.6-128-128V208" style="fill:none;stroke:#8e8ea0;stroke-linecap:square;stroke-miterlimit:10;stroke-width:48px" class="spinnerMic"></path> 
    <line x1="256" y1="368" x2="256" y2="448" style="fill:none;stroke:#8e8ea0;stroke-linecap:square;stroke-miterlimit:10;stroke-width:48px" class="spinnerMic"></line> 
    <path d="M256,320a78.83,78.83,0,0,1-56.55-24.1A80.89,80.89,0,0,1,176,239V128a79.69,79.69,0,0,1,80-80c44.86,0,80,35.14,80,80V239C336,283.66,300.11,320,256,320Z" style="fill:none;stroke:#8e8ea0;stroke-linecap:square;stroke-miterlimit:10;stroke-width:48px" class="spinnerMic"></path>
</svg>`;

const SVG_SPINNER_HTML = `
<div style="position:relative;width:24px;height:16px;"> 
    <svg viewBox="0 0 24 24" style="position:absolute;top:0;left:0;width:100%;height:100%;"> 
        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" stroke-dasharray="15 85" transform="rotate(0)"> 
            <animateTransform attributeName="transform" attributeType="XML" type="rotate" from="0 12 12" to="360 12 12" dur="0.75s" repeatCount="indefinite"/> 
        </circle> 
    </svg>
</div>`;

const TRANSCRIPTION_URL = 'https://api.openai.com/v1/audio/transcriptions';
const TRANSLATION_URL = 'https://api.openai.com/v1/audio/translations';
const MICROPHONE_BUTTON_CLASSES = 'absolute p-1 rounded-md text-gray-500 bottom-1.5 right-1 md:bottom-2.5 md:right-2 hover:bg-gray-100 dark:hover:text-gray-400 dark:hover:bg-gray-900';

async function retrieveFromStorage(key) {
    return new Promise((resolve) => {
        chrome.storage.sync.get(key, (result) => {
            resolve(result[key]);
        });
    });
}

class AudioRecorder {
    constructor() {
        this.recording = false;
        this.mediaRecorder = null;
        this.textarea = null;
        this.micButton = null;
        this.token = null;
        this.snippetButtons = [];
        this.gTranscription = '';  // Add this line
    }

    async listenForKeyboardShortcut() {
        if (await this.shortcutEnabled()) {
            const shortcutFirstKey = await retrieveFromStorage('config_shortcut_first_key');
            const shortcutFirstModifier = await retrieveFromStorage('config_shortcut_first_modifier');
            const shortcutSecondModifier = await retrieveFromStorage('config_shortcut_second_modifier');

            window.addEventListener('keydown', (event) => {
                if (event.code === `Key${shortcutFirstKey.toUpperCase()}`) {
                    if (shortcutFirstModifier && !event[shortcutFirstModifier]) return;
                    if (shortcutSecondModifier && !event[shortcutSecondModifier]) return;

                    event.preventDefault();
                    this.toggleRecording();
                }
            }, true);
        }
    }

    createMicButton(inputType) {
        this.micButton = document.createElement('button');
        this.micButton.className = `microphone_button ${MICROPHONE_BUTTON_CLASSES}`;
        this.micButton.style.marginRight = inputType === 'main' ? '2.2rem' : '26.5rem';
        this.micButton.innerHTML = SVG_MIC_HTML;
        this.micButton.addEventListener('click', (e) => {
            e.preventDefault();
            this.toggleRecording();
        });
    }

    async createSnippetButtons() {
        const snippets = await retrieveFromStorage('snippets');
        if (!snippets) return;

        const numberOfRows = Math.ceil(snippets.length / 9);
        snippets.forEach((snippet, index) => {
            if (!snippet) return;
            const button = document.createElement('button');
            button.textContent = index + 1;
            button.className = `snippet_button ${MICROPHONE_BUTTON_CLASSES}`;
            const y = -0.6 - numberOfRows * 2.2 + Math.floor(index / 9) * 2.2;
            const x = -45.7 + (index % 9) * 2;
            button.style.transform = `translate(${x}rem, ${y}rem)`;

            button.addEventListener('click', (e) => {
                e.preventDefault();
                this.insertTextResult(snippet);
            });
            this.textarea.parentNode.insertBefore(button, this.textarea.nextSibling);
            this.snippetButtons.push({ button, x, y, initialY: y });
        });
    }

    updateButtonGridPosition() {
        const textareaRows = this.textarea.clientHeight / 24;
        this.snippetButtons.forEach((buttonObj) => {
            buttonObj.y = buttonObj.initialY - (textareaRows - 1) * 1.5;
            buttonObj.button.style.transform = `translate(${buttonObj.x}rem, ${buttonObj.y}rem)`;
        });
    }

    observeTextareaResize() {
        this.resizeObserver = new ResizeObserver(() => {
            this.updateButtonGridPosition();
        });
        this.resizeObserver.observe(this.textarea);
    }

    async downloadEnabled() {
        return await retrieveFromStorage('config_enable_download');
    }

    async translationEnabled() {
        return await retrieveFromStorage('config_enable_translation');
    }

    async snippetsEnabled() {
        return await retrieveFromStorage('config_enable_snippets');
    }

    async shortcutEnabled() {
        const shortcutEnabled = await retrieveFromStorage('config_enable_shortcut');
        const shortcutFirstKey = await retrieveFromStorage('config_shortcut_first_key');
        const shortcutFirstModifier = await retrieveFromStorage('config_shortcut_first_modifier');
        const shortcutSecondModifier = await retrieveFromStorage('config_shortcut_second_modifier');

        if (!shortcutFirstKey && !shortcutFirstModifier && !shortcutSecondModifier) {
            const platform = navigator.userAgentData.platform.toLowerCase();
            if (platform.indexOf('mac') > -1) {
                await chrome.storage.sync.set({
                    config_shortcut_first_modifier: 'ctrlKey',
                    config_shortcut_first_key: 'r',
                });
            } else if (platform.indexOf('win') > -1) {
                await chrome.storage.sync.set({
                    config_shortcut_first_modifier: 'shiftKey',
                    config_shortcut_second_modifier: 'altKey',
                    config_shortcut_first_key: 'r',
                });
            }
        }

        return shortcutEnabled;
    }

    async retrieveToken() {
        return await retrieveFromStorage('openai_token');
    }

    async getSelectedPrompt() {
        const selectedPrompt = await retrieveFromStorage('openai_selected_prompt');
        const prompts = await retrieveFromStorage('openai_prompts');
        if (!prompts || selectedPrompt === undefined) {
            const previousVersionPrompt = await retrieveFromStorage('openai_prompt');
            const initialPrompt = {
                title: 'Initial prompt',
                content: previousVersionPrompt || 'The transcript is about OpenAI which makes technology like DALL·E, GPT-3, and ChatGPT with the hope of one day building an AGI system that benefits all of humanity.',
            };
            await chrome.storage.sync.set({
                openai_prompts: [initialPrompt],
                openai_selected_prompt: 0,
            });
            return initialPrompt;
        } else {
            return prompts[selectedPrompt];
        }
    }

    pasteAtCaret() {
        const activeElement = document.activeElement;
        if (activeElement.isContentEditable || ['TEXTAREA', 'INPUT'].includes(activeElement.tagName)) {
            const startPos = activeElement.selectionStart;
            const endPos = activeElement.selectionEnd;
            const value = activeElement.value;
    
            activeElement.value = value.slice(0, startPos) + this.gTranscription + value.slice(endPos);
            activeElement.selectionStart = startPos + this.gTranscription.length;
            activeElement.selectionEnd = startPos + this.gTranscription.length;
        } else if (document.getSelection) {
            const sel = document.getSelection();
            if (sel.rangeCount) {
                const range = sel.getRangeAt(0);
                range.deleteContents();
                const textNode = document.createTextNode(this.gTranscription);
                range.insertNode(textNode);
                range.setStartAfter(textNode);
                sel.removeAllRanges();
                sel.addRange(range);
            }
        } else {
            console.error('The active element must be a textarea or a content-editable element');
        }
    }
    
    async startRecording() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.mediaRecorder = new MediaRecorder(stream);
            const chunks = [];
            this.mediaRecorder.addEventListener('dataavailable', (event) => chunks.push(event.data));
            this.mediaRecorder.addEventListener('stop', async () => {
                const audioBlob = new Blob(chunks, { type: 'audio/webm' });
                const storedToken = await this.retrieveToken();
                const storedPrompt = await this.getSelectedPrompt();
    
                const headers = new Headers({ Authorization: `Bearer ${storedToken}` });
                const formData = new FormData();
                formData.append('file', audioBlob, 'recording.webm');
                formData.append('model', 'whisper-1');
                formData.append('prompt', storedPrompt.content);
    
                const requestOptions = {
                    method: 'POST',
                    headers,
                    body: formData,
                };
    
                const requestUrl = (await this.translationEnabled()) ? TRANSLATION_URL : TRANSCRIPTION_URL;
                const response = await fetch(requestUrl, requestOptions);
    
                if (response.status === 200) {
                    const result = await response.json();
                    this.gTranscription = result.text;  // Change this line
                    this.pasteAtCaret();
                } else {
                    this.insertTextResult('ERROR! API key not provided or OpenAI Server Error!');
                }
    
                this.recording = false;
                stream.getTracks().forEach((track) => track.stop());
            });
    
            this.mediaRecorder.start();
            this.recording = true;
        } catch (error) {
            console.error(error);
        }
    }

    stopRecording() {
        this.mediaRecorder.stop();
        this.recording = false;
    }

    toggleRecording() {
        if (this.recording) {
            this.stopRecording();
        } else {
            this.startRecording();
        }
    }

    insertTextResult(resultText) {
        const startPos = this.textarea.selectionStart;
        const endPos = this.textarea.selectionEnd;
        this.textarea.value = this.textarea.value.substring(0, startPos) + resultText + this.textarea.value.substring(endPos);
        this.textarea.selectionStart = startPos + resultText.length;
        this.textarea.selectionEnd = this.textarea.selectionStart;
        this.textarea.dispatchEvent(new Event('input', { bubbles: true }));
    }

    setButtonState(state) {
        const hoverClasses = ['hover:bg-gray-100', 'dark:hover:text-gray-400', 'dark:hover:bg-gray-900'];
        switch (state) {
            case 'recording':
                this.micButton.disabled = false;
                this.micButton.innerHTML = SVG_MIC_SPINNING_HTML;
                break;
            case 'loading':
                this.micButton.disabled = true;
                this.micButton.innerHTML = SVG_SPINNER_HTML;
                this.micButton.classList.remove(...hoverClasses);
                break;
            default:
                this.micButton.disabled = false;
                this.micButton.innerHTML = SVG_MIC_HTML;
                this.micButton.classList.add(...hoverClasses);
                break;
        }
    }
}

async function init() {
    const recorder = new AudioRecorder();
    await recorder.listenForKeyboardShortcut();
}

init();
