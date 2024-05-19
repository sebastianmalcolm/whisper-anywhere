import React from 'react';
import { createRoot, Root } from 'react-dom/client';

import Overlay from './components/Overlay';

export const renderOverlay = (): void => {
    const rootElement: HTMLElement = document.createElement('div');
    rootElement.id = 'whisper-anywhere-overlay-root';
    document.body.appendChild(rootElement);
    const root: Root = createRoot(rootElement);
    root.render(React.createElement(Overlay));
}

renderOverlay();