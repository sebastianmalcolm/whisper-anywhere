import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import Overlay from './components/Overlay';
import recorder from './recorder';

export const createOverlay = (): void => {
    const rootElement: HTMLElement = document.createElement('div');
    rootElement.id = 'whisper-anywhere-overlay-root';
    document.body.appendChild(rootElement);
    const root: Root = createRoot(rootElement);
    root.render(React.createElement(Overlay));
}

async function init(): Promise<void> {
    createOverlay();
    await recorder.init();
}

init().catch(console.error);