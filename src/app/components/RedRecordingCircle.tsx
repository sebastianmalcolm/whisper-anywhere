import React from "react";
import styled from "styled-components";
import useTranscriber from "../hooks/useTranscriber";

const Circle = styled.div<{ visible: boolean, size: number }>`
    width: ${({ size }) => size}px;
    height: ${({ size }) => size}px;
    position: fixed;
    bottom: 40px;
    left: 50%;
    background: red;
    border-radius: 50%;
    transition: opacity 0.2s, transform 0.2s;
    opacity: ${({ visible }) => (visible ? 1 : 0)};
    transform: translateX(-50%) translateY(50%) translateY(${({ visible }) => (visible ? 0 : 30)}px);
`;

const Recorder = ({ isRecording }: { isRecording: boolean }) => {
    const { volume } = useTranscriber();

    const size = volume * 100 + 10;

    return <Circle size={size} visible={isRecording} />;
};

export default Recorder;