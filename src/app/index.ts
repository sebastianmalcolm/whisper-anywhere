/// <reference types="chrome"/>

/* global chrome */
const TRANSCRIPTION_URL = 'https://api.openai.com/v1/audio/transcriptions';
const TRANSLATION_URL = 'https://api.openai.com/v1/audio/translations';

async function getFromStorage(key: string) {
    return new Promise((resolve) => {
        chrome.storage.sync.get(key, (result) => {
            resolve(result[key]);
        });
    });
}

class Recorder {
    isRecording = false;
    mediaRecorder: MediaRecorder | null = null;
    altPressCount = 0;
    altTimeout: NodeJS.Timeout | null = null;
    transcription = '';

    async init() {
        window.addEventListener('keydown', (event) => this.handleKeyPress(event));
    }

    async handleKeyPress(event: KeyboardEvent) {
        if (event.key === 'Alt') {
            this.altPressCount++;
            if (this.altPressCount === 2) {
                this.altTimeout && clearTimeout(this.altTimeout);
                this.toggleRecording();
            } else {
                this.altTimeout = setTimeout(() => {
                    this.altPressCount = 0;
                }, 300);
            }
        }
    }

    async getToken(): Promise<string> {
        return await getFromStorage('openai_token') as string || '';
    }

    async isTranslationEnabled(): Promise<boolean> {
        return await getFromStorage('config_enable_translation') as boolean || false;
    }

    async getPrompt(): Promise<string | null> {
        return await getFromStorage('openai_prompt') as string || null;
    }

    async startRecording() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.mediaRecorder = new MediaRecorder(stream);
            const chunks: Blob[] = [];
            this.mediaRecorder.addEventListener('dataavailable', (event) => chunks.push(event.data));
            this.mediaRecorder.addEventListener('stop', async () => this.handleRecordingStop(chunks, stream));

            this.mediaRecorder.start();
            this.isRecording = true;
        } catch (error) {
            console.error('Error starting recording:', error);
        }
    }

    async handleRecordingStop(chunks: Blob[], stream: MediaStream) {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        const token = await this.getToken();
        const prompt = await this.getPrompt();

        const headers = new Headers({ Authorization: `Bearer ${token}` });
        const formData = new FormData();
        formData.append('file', audioBlob, 'recording.webm');
        formData.append('model', 'whisper-1');
        if (prompt) {
            formData.append('prompt', prompt);
        }

        const requestUrl = (await this.isTranslationEnabled()) ? TRANSLATION_URL : TRANSCRIPTION_URL;
        const response = await fetch(requestUrl, { method: 'POST', headers, body: formData });

        if (response.ok) {
            const result = await response.json();
            this.transcription = result.text;
            await this.copyToClipboard(this.transcription);
        } else {
            console.error('Error during transcription:', response.statusText);
        }

        this.isRecording = false;
        stream.getTracks().forEach((track) => track.stop());
    }

    async copyToClipboard(text: string) {
        try {
            await navigator.clipboard.writeText(text);
            console.log('Transcription copied to clipboard:', text);
        } catch (error) {
            console.error('Error copying to clipboard:', error);
        }
    }

    stopRecording() {
        this.mediaRecorder?.stop();
        this.isRecording = false;
    }

    toggleRecording() {
        if (this.isRecording) {
            this.stopRecording();
        } else {
            this.startRecording();
        }
        this.altPressCount = 0;
        this.altTimeout && clearTimeout(this.altTimeout);
    }
}

async function init() {
    const recorder = new Recorder();
    await recorder.init();
}

init();
