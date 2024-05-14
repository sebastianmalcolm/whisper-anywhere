import { configStore } from "./store";

/* global chrome */
const TRANSCRIPTION_URL = 'https://api.openai.com/v1/audio/transcriptions';
const TRANSLATION_URL = 'https://api.openai.com/v1/audio/translations';

class Recorder {
    isRecording = false;
    mediaRecorder: MediaRecorder | null = null;
    altPressTimeout: NodeJS.Timeout | null = null;
    transcription = '';

    async init() {
        window.addEventListener('keydown', (event) => this.handleKeyDown(event));
        window.addEventListener('keyup', (event) => this.handleKeyUp(event));
    }

    handleKeyDown(event: KeyboardEvent) {
        if (event.key === 'Alt' && !this.isRecording) {
            if (this.altPressTimeout) {
                clearTimeout(this.altPressTimeout);
            }
            this.altPressTimeout = setTimeout(() => this.startRecording(), 500);
        }
    }

    handleKeyUp(event: KeyboardEvent) {
        if (event.key === 'Alt' && this.isRecording) {
            if (this.altPressTimeout) {
                clearTimeout(this.altPressTimeout);
                this.altPressTimeout = null;
            }
            this.stopRecording();
        }
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
        const token = await configStore.token.get();
        const prompt = await configStore.prompt.get();

        const headers = new Headers({ Authorization: `Bearer ${token}` });
        const formData = new FormData();
        formData.append('file', audioBlob, 'recording.webm');
        formData.append('model', 'whisper-1');
        if (prompt) {
            formData.append('prompt', prompt);
        }

        const requestUrl = (await configStore.enableTranslation.get()) ? TRANSLATION_URL : TRANSCRIPTION_URL;
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
}

async function init() {
    const recorder = new Recorder();
    await recorder.init();
}

init();
