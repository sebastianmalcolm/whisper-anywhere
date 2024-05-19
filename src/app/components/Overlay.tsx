import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import RedRecordingCircle from './RedRecordingCircle';
import ActionButtonGroup from './ActionButtonGroup';
import useTranscriber from '../hooks/useTranscriber';
import useMainHotkey from '../hooks/useMainHotkey';
import { constants } from '../config';

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
    useMainHotkey(constants.HOTKEY);
    const { transcription } = useTranscriber();

    return (
        <div>
            <RedRecordingCircle />
            <OverlayContainer isVisible={!!transcription}>
                <ActionButtonGroup elements={[]} acceptHotkeys={false} />
                <OverlayTranscription>{transcription}</OverlayTranscription>
            </OverlayContainer>
        </div>
    );
};

export default Overlay;