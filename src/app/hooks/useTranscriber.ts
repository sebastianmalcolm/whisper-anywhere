import { useCallback, useEffect, useState } from 'react';
import transcriber from '../services/transcriber';
import { Subscription } from 'rxjs';

const useTranscriber = () => {
    const [isRecording, setIsRecording] = useState(false);
    const [transcription, setTranscription] = useState('');

    useEffect(() => {
        const transcriptionSub: Subscription = transcriber.transcriptionObservable.subscribe(setTranscription);
        const isRecordingSub: Subscription = transcriber.isRecordingObservable.subscribe(setIsRecording);

        return () => {
            transcriptionSub.unsubscribe();
            isRecordingSub.unsubscribe();
        };
    }, []);

    const startRecording = useCallback(() => {
        try {
            transcriber.startRecording();
        } catch (error) {
            console.error('Error starting recording:', error);
        }
    }, []);

    const stopRecording = useCallback(() => {
        try {
            transcriber.stopRecording();
        } catch (error) {
            console.error('Error stopping recording:', error);
        }
    }, []);

    const setTranscriptionFn = useCallback((value: string) => transcriber.transcription = value, []);

    const clearTranscription = useCallback(() => transcriber.resetTranscription(), []);

    return {
        isRecording,
        transcription,
        setTranscription: setTranscriptionFn,
        startRecording,
        stopRecording,
        clearTranscription
    };
};

export default useTranscriber;
