import { useEffect, useRef } from "react";
import useTranscriber from "./useTranscriber";

const useMainHotkey = (key: string) => {
    const { startRecording, stopRecording } = useTranscriber();
    const recordingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === key) {
                recordingTimeoutRef.current = setTimeout(() => {
                    startRecording();
                }, 1000);
            }
        };

        const handleKeyUp = (event: KeyboardEvent) => {
            if (event.key === key) {
                if (recordingTimeoutRef.current) {
                    clearTimeout(recordingTimeoutRef.current);
                    recordingTimeoutRef.current = null;
                }
                stopRecording();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [startRecording, stopRecording]);
}

export default useMainHotkey;
