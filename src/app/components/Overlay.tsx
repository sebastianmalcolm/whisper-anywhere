import React, { useEffect, useState } from 'react';
import { Subscription } from 'rxjs';
import styled from 'styled-components';
import { isRecordingSubject, transcriptionSubject } from '../recorder';
import RedRecordingCircle from './RedRecordingCircle';
import ActionButtonGroup from './ActionButtonGroup';

const OverlayContainer = styled.div<{ isVisible: boolean }>`
    position: fixed;
    z-index: 99999999999;
    bottom: 50px;
    left: 50%;
    background: rgba(0, 0, 0, 0.8);
    color: white;
    border-radius: 10px;
    padding: 1rem;
    gap: 1rem;
    min-width: 300px;
    transition-duration: 0.2s;
    transition-delay: ${({ isVisible }) => (isVisible ? 0.8 : 0)}s;
    transform: translateY(${({ isVisible }) => (isVisible ? 0 : 10)}px) translateX(-50%);
    opacity: ${({ isVisible }) => (isVisible ? 1 : 0)};
    display: flex;
`;

const OverlayTranscription = styled.p`
    margin: 0;
    flex-grow: 1;
    font-size: 0.85rem;
    line-height: 1.3rem;
`;

const Overlay: React.FC = () => {
    const [isRecording, setIsRecording] = useState(false);
    const [transcription, setTranscription] = useState('');

    useEffect(() => {
        const isRecordingSub: Subscription = isRecordingSubject.subscribe(setIsRecording);
        const transcriptionSub: Subscription = transcriptionSubject.subscribe(setTranscription);

        return () => {
            isRecordingSub.unsubscribe();
            transcriptionSub.unsubscribe();
        };
    }, []);

    const clearTranscription = () => setTranscription('');

    return (
        <div>
            <RedRecordingCircle isRecording={isRecording} />
            <OverlayContainer isVisible={!!transcription}>
                <ActionButtonGroup clearTranscription={clearTranscription} />
                <OverlayTranscription>{transcription}</OverlayTranscription>
            </OverlayContainer>
        </div>
    );
};

export default Overlay;