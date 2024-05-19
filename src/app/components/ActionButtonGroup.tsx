import React, { useEffect, useMemo, useRef } from 'react';
import styled from 'styled-components';
import ActionButton from './ActionButton';
import { ButtonGroupAction, ButtonGroupElement } from '../types';

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
    elements: ButtonGroupElement[];
    acceptHotkeys: boolean;
}

const ButtonGroup: React.FC<ButtonGroupProps> = ({ elements, acceptHotkeys }) => {
    const acceptHotkeysRef = useRef(acceptHotkeys);

    // updating acceptHotkeysRef
    useEffect(() => {
        acceptHotkeysRef.current = acceptHotkeys;
    }, [acceptHotkeys]);

    // creating items
    const items = useMemo(() => elements.map((element, index) => {
        if (element.type === 'button-group-action') {
            return <ActionButton key={index} icon={element.icon} action={element.action} hotkey={element.hotkey} />
        } else if (element.type === 'button-group-spacer') {
            return <ButtonGroupSpacer key={index} />
        } else {
            throw new Error('Invalid element type');
        }
    }), [elements]);

    // setting hotkeys
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            const element = elements.find((element) => element.type === 'button-group-action' && element.hotkey === event.key);
            if (element && acceptHotkeysRef.current) {
                event.preventDefault();
                event.stopPropagation();
                (element as ButtonGroupAction).action();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [elements]);

    return (
        <StyledButtonGroup>
            {items}
        </StyledButtonGroup>
    )
}

export default ButtonGroup;