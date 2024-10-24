import { Subject } from 'rxjs';
import { configStore } from '../config';
import { providerFactory, TranscriptionResult } from './providers';

class Transcriber {
    private _transcription = '';
    mediaRecorder: MediaRecorder | null = null;
    audioContext: AudioContext | null = null;
    analyser: AnalyserNode | null = null;
    dataArray: Uint8Array | null = null;
    audioSource: MediaStreamAudioSourceNode | null = null;

    transcriptionObservable = new Subject<string>();
    volumeObservable = new Subject<number>();
    isRecordingObservable = new Subject<boolean>();
    errorObservable = new Subject<string>();

    get transcription() {
        return this._transcription;
    }

    set transcription(value: string) {
        this._transcription = value;
        this.transcriptionObservable.next(value);
        if (value) navigator.clipboard.writeText(value);
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
            this.isRecordingObservable.next(true);
        } catch (error) {
            console.error('Error starting recording:', error);
            this.errorObservable.next('Failed to start recording: ' + (error as Error).message);
        }
    }

    async handleRecordingStop(chunks: Blob[], stream: MediaStream) {
        try {
            const audioBlob = new Blob(chunks, { type: 'audio/webm' });
            
            // Get current provider configuration
            const providerConfig = await configStore.providerConfig.get();
            const provider = providerFactory.getProvider(providerConfig);
            
            // Get legacy prompt if it exists (for backward compatibility)
            const legacyPrompt = await configStore.prompt.get();
            const prompt = legacyPrompt || providerConfig.providers[providerConfig.selectedProvider]?.settings?.prompt;

            // Get translation preference
            const enableTranslation = await configStore.enableTranslation.get();

            // Process transcription using selected provider
            const result: TranscriptionResult = await provider.transcribe({
                file: audioBlob,
                prompt,
                translate: enableTranslation
            });

            if (result.error) {
                this.errorObservable.next(result.error);
                return;
            }

            this.transcription = result.text;
        } catch (error) {
            console.error('Error during transcription:', error);
            this.errorObservable.next('Transcription failed: ' + (error as Error).message);
        } finally {
            this.isRecordingObservable.next(false);
            stream.getTracks().forEach((track) => track.stop());
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
    }

    resetTranscription() {
        this.transcription = '';
    }
}

const recorder = new Transcriber();

export default recorder;
