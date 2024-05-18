import React, { useEffect } from 'react';
import styled from 'styled-components';
import Icon from '../common/Icon';

const StyledActionButton = styled.div`
    width: 1.8rem;
    height: 1.8rem;
    background: #666;
    border-radius: 5px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
        background: #888;
    }
`;

interface ActionButtonProps {
    icon: React.FC;
    action: () => void;
    hotkey: string;
}

const ActionButton: React.FC<ActionButtonProps> = ({ icon, action, hotkey }) => {
    useEffect(() => {
        const handleKeyPress = (event: KeyboardEvent) => {
            if (event.key === hotkey) {
                action();
            }
        };
        window.addEventListener('keydown', handleKeyPress);
        return () => {
            window.removeEventListener('keydown', handleKeyPress);
        };
    }, [hotkey, action]);

    return (
        <StyledActionButton onClick={action}>
            <Icon icon={icon} />
        </StyledActionButton>
    );
};

export default ActionButton;