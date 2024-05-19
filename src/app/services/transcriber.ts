import { Subject } from 'rxjs';
import { configStore } from "../store";

const TRANSCRIPTION_URL = 'https://api.openai.com/v1/audio/transcriptions';
const TRANSLATION_URL = 'https://api.openai.com/v1/audio/translations';

class Transcriber {
    mediaRecorder: MediaRecorder | null = null;
    transcription = '';
    audioContext: AudioContext | null = null;
    analyser: AnalyserNode | null = null;
    dataArray: Uint8Array | null = null;
    audioSource: MediaStreamAudioSourceNode | null = null;

    transcriptionObservable = new Subject<string>();
    volumeObservable = new Subject<number>();

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
                    this.volumeObservable.next(normalizedVolume);
                }
                requestAnimationFrame(processVolume);
            };

            processVolume();

            this.mediaRecorder = new MediaRecorder(stream);
            const chunks: Blob[] = [];
            this.mediaRecorder.addEventListener('dataavailable', (event) => chunks.push(event.data));
            this.mediaRecorder.addEventListener('stop', async () => this.handleRecordingStop(chunks, stream));

            this.mediaRecorder.start();
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
            this.transcriptionObservable.next(this.transcription);
        } else {
            console.error('Error during transcription:', response.statusText);
        }

        stream.getTracks().forEach((track) => track.stop());
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
    }

    resetTranscription() {
        this.transcription = '';
        this.transcriptionObservable.next(this.transcription);
    }
}

const recorder = new Transcriber();

export default recorder;
