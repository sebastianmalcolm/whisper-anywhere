import React from 'react';
import styled from 'styled-components';

interface IconProps {
  icon: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  color?: string;
  size?: string;
}

const StyledIcon = styled.svg<Omit<IconProps, 'icon'>>`
  fill: ${({ color }) => color || '#fff'};
  width: ${({ size }) => size || '1rem'};
  height: ${({ size }) => size || '1rem'};
`;

const Icon: React.FC<IconProps> = ({ icon: Icon, color, size }) => (
  <StyledIcon as={Icon} color={color} size={size} />
);

export default Icon;