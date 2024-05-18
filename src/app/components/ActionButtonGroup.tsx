import React from 'react';
import styled from 'styled-components';
import ActionButton from './ActionButton';
import AIIcon from '../assets/ai-icon.svg';
import CopyIcon from '../assets/copy-icon.svg';
import CancelIcon from '../assets/cancel-icon.svg';

const StyledButtonGroup = styled.div`
    display: flex;
    gap: 0.25rem;
    position: absolute;
    top: -2.1rem;
    left: 0;
    width: 100%;
`;

const ButtonGroupSpacer = styled.div`
    flex-grow: 1;
`;

interface ButtonGroupProps {
    clearTranscription: () => void;
}

const ButtonGroup: React.FC<ButtonGroupProps> = ({ clearTranscription }) => (
    <StyledButtonGroup>
        <ActionButton icon={AIIcon} action={clearTranscription} hotkey="a" />
        <ActionButton icon={CopyIcon} action={clearTranscription} hotkey="c" />
        <ButtonGroupSpacer />
        <ActionButton icon={CancelIcon} action={clearTranscription} hotkey="x" />
    </StyledButtonGroup>
);

export default ButtonGroup;