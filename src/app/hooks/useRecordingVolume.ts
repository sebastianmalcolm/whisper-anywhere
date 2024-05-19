import { useCallback, useEffect, useState } from 'react';
import transcriber from '../services/transcriber';
import { Subscription } from 'rxjs';

const useRecordingVolume = () => {
    const [volume, setVolume] = useState(0);

    useEffect(() => {
        const volumeSub: Subscription = transcriber.volumeObservable.subscribe(setVolume);
        
        return () => {
            volumeSub.unsubscribe();
        };
    }, []);

    return {
        volume
    };
};

export default useRecordingVolume;