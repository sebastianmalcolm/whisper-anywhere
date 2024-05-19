import React, { useEffect } from 'react';
import styled from 'styled-components';
import Icon from './common/Icon';
import { ButtonGroupAction } from '../types';

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

type ActionButtonProps = Omit<ButtonGroupAction, 'type'>;

const ActionButton: React.FC<ActionButtonProps> = ({ icon, action, hotkey }) => {
    return (
        <StyledActionButton onClick={action}>
            <Icon icon={icon} />
        </StyledActionButton>
    );
};

export default ActionButton;