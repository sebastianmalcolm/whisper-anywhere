import { useCallback, useEffect, useState } from 'react';
import transcriber from '../services/transcriber';
import { Subscription } from 'rxjs';

const useTranscriber = () => {
    const [isRecording, setIsRecording] = useState(false);
    const [volume, setVolume] = useState(0);
    const [transcription, setTranscription] = useState('');

    useEffect(() => {
        const volumeSub: Subscription = transcriber.volumeObservable.subscribe(setVolume);
        const transcriptionSub: Subscription = transcriber.transcriptionObservable.subscribe(setTranscription);

        return () => {
            volumeSub.unsubscribe();
            transcriptionSub.unsubscribe();
        };
    }, []);

    const startRecording = useCallback(() => {
        try {
            transcriber.startRecording();
            setIsRecording(true);
        } catch (error) {
            console.error('Error starting recording:', error);
        }
    }, []);

    const stopRecording = useCallback(() => {
        try {
            transcriber.stopRecording();
            setIsRecording(false);
        } catch (error) {
            console.error('Error stopping recording:', error);
        }
    }, []);

    const clearTranscription = useCallback(() => transcriber.resetTranscription(), []);

    return {
        isRecording,
        volume,
        transcription,
        startRecording,
        stopRecording,
        clearTranscription
    };
};

export default useTranscriber;
