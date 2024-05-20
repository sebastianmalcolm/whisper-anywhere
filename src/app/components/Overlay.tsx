import React, { useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import RedRecordingCircle from './RedRecordingCircle';
import ActionButtonGroup from './ActionButtonGroup';
import useTranscriber from '../hooks/useTranscriber';
import useMainHotkey from '../hooks/useMainHotkey';
import { constants } from '../config';
import { ButtonGroupElement } from '../types';

import AiIcon from '../assets/ai-icon.svg'
import { enhancer } from '../services/enhancer';

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
    const showingTranscriptionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const { transcription, setTranscription } = useTranscriber();
    const [showTranscription, setShowTranscription] = useState(false);

    const actionElements = useMemo(() => {
        const elements: ButtonGroupElement[] = [
            {
                type: 'button-group-action',
                icon: AiIcon,
                action: async () => {
                    const answer = await enhancer.fixGrammar(transcription)
                    setTranscription(answer)
                },
                hotkey: 'a'
            }
        ];

        return elements;
    }, [transcription]);

    useEffect(() => {
        clearTimeout(showingTranscriptionTimeoutRef.current!);
        showingTranscriptionTimeoutRef.current = null;

        setShowTranscription(!!transcription);

        if (transcription) {
            showingTranscriptionTimeoutRef.current = setTimeout(() => {
                setShowTranscription(false);
                showingTranscriptionTimeoutRef.current = null;
            }, transcription.length * 80);
        }
    }, [transcription]);

    return (
        <div>
            <RedRecordingCircle />
            <OverlayContainer isVisible={showTranscription}>
                <ActionButtonGroup elements={actionElements} acceptHotkeys={false} />
                <OverlayTranscription>{transcription}</OverlayTranscription>
            </OverlayContainer>
        </div>
    );
};

export default Overlay;