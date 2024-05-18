import { Subject } from 'rxjs';
import { configStore } from "./store";

const TRANSCRIPTION_URL = 'https://api.openai.com/v1/audio/transcriptions';
const TRANSLATION_URL = 'https://api.openai.com/v1/audio/translations';

class Recorder {
    private _isRecording = false;
    mediaRecorder: MediaRecorder | null = null;
    altPressTimeout: NodeJS.Timeout | null = null;
    transcription = '';
    hotkeyHold = false;
    audioContext: AudioContext | null = null;
    analyser: AnalyserNode | null = null;
    dataArray: Uint8Array | null = null;
    audioSource: MediaStreamAudioSourceNode | null = null;

    hotkeySubject = new Subject<boolean>();
    transcriptionSubject = new Subject<string>();
    volumeSubject = new Subject<number>();
    isRecordingSubject = new Subject<boolean>();

    get isRecording() {
        return this._isRecording;
    }

    set isRecording(value) {
        this._isRecording = value;
        this.isRecordingSubject.next(value);
    }

    async init() {
        window.addEventListener('keydown', (event) => this.handleKeyDown(event));
        window.addEventListener('keyup', (event) => this.handleKeyUp(event));
    }

    handleKeyDown(event: KeyboardEvent) {
        if (event.key === 'Alt' && !this.isRecording) {
            this.hotkeyHold = true;
            this.hotkeySubject.next(this.hotkeyHold);
            if (this.altPressTimeout) {
                clearTimeout(this.altPressTimeout);
            }
            this.altPressTimeout = setTimeout(() => this.startRecording(), 1000);
        }
    }

    handleKeyUp(event: KeyboardEvent) {
        if (event.key === 'Alt') {
            this.hotkeyHold = false;
            this.hotkeySubject.next(this.hotkeyHold);
            if (this.altPressTimeout) {
                clearTimeout(this.altPressTimeout);
                this.altPressTimeout = null;
            }

            if (this.isRecording) this.stopRecording();
        }
    }

    async startRecording() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.audioContext = new window.AudioContext();
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 2048;
            this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);

            this.audioSource = this.audioContext.createMediaStreamSource(stream);
            this.audioSource.connect(this.analyser);

            const processVolume = () => {
                if (this.analyser && this.dataArray) {
                    this.analyser.getByteFrequencyData(this.dataArray);
                    const sum = this.dataArray.reduce((acc, value) => acc + value, 0);
                    const average = sum / this.dataArray.length;
                    const normalizedVolume = average / 255;
                    this.volumeSubject.next(normalizedVolume);
                }
            
                requestAnimationFrame(processVolume);
            };

            processVolume();

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
            this.transcriptionSubject.next(this.transcription);
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
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
            this.analyser = null;
            this.dataArray = null;
            this.audioSource = null;
        }
        this.isRecording = false;
    }
}

const recorder = new Recorder();
export const hotkeySubject = recorder.hotkeySubject;
export const transcriptionSubject = recorder.transcriptionSubject;
export const volumeSubject = recorder.volumeSubject;
export const isRecordingSubject = recorder.isRecordingSubject;

export default recorder;