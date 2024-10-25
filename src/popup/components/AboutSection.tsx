import React from 'react';
import { version } from '../../../package.json';
import { Accordion } from './common/Accordion';
import { ImageCarousel } from './common/ImageCarousel';
import './AboutSection.css';

const providerImages = [
    {
        src: '/assets/PBG-mark1-color.svg',
        alt: 'Groq - Provider of ultra-fast LLM inference API endpoints. Used in this extension for rapid text processing and AI-powered features. Known for their high-performance API that delivers exceptional speed for AI model inference.',
        href: 'https://groq.com'
    },
    {
        src: '/resources/openai.com/openai-logos/SVGs/openai-white-lockup.svg',
        alt: 'OpenAI - Provider of the Whisper ASR model and API endpoints. Used in this extension for high-accuracy speech recognition and transcription. Whisper is a state-of-the-art multilingual ASR model known for its robust performance across many languages and accents.',
        href: 'https://openai.com'
    }
];

export const AboutSection: React.FC = () => {
    return (
        <div className="about-section">
            <header className="about-header">
                <h2>Voice-to-Text Anywhere</h2>
                <span className="version">v{version}</span>
                <p className="tagline">AI-Powered Speech Recognition</p>
            </header>

            <section className="provider-attribution">
                <h4>AI Services Provided By</h4>
                <ImageCarousel images={providerImages} />
            </section>

            <div className="expandable-content">
                <Accordion title="Recent Changes">
                    <div className="version-history">
                        <ul>
                            <li>
                                <strong>2.0.2</strong>
                                <ul>
                                    <li>Enhanced About tab with expandable sections</li>
                                    <li>Improved responsive design</li>
                                    <li>Added detailed provider attributions</li>
                                </ul>
                            </li>
                            <li>
                                <strong>2.0.1</strong>
                                <ul>
                                    <li>Added provider capability indicators</li>
                                    <li>Enhanced configuration testing</li>
                                    <li>Improved error handling</li>
                                </ul>
                            </li>
                            <li>
                                <strong>2.0.0</strong>
                                <ul>
                                    <li>Added support for multiple AI providers</li>
                                    <li>Integrated Groq for faster processing</li>
                                    <li>Enhanced configuration options</li>
                                    <li>Improved error handling</li>
                                </ul>
                            </li>
                            <li>
                                <strong>1.2.7</strong>
                                <ul>
                                    <li>Performance improvements</li>
                                    <li>Bug fixes</li>
                                </ul>
                            </li>
                        </ul>
                    </div>
                </Accordion>

                <Accordion title="Contributors">
                    <div className="contributor-list">
                        <a href="https://github.com/ordinath" target="_blank" rel="noopener noreferrer">Ordinath</a>
                        <a href="https://github.com/redocrepus" target="_blank" rel="noopener noreferrer">redocrepus</a>
                        <a href="https://github.com/alireza29675" target="_blank" rel="noopener noreferrer">Alireza Sheikholmolouki</a>
                        <a href="https://github.com/sebastianmalcolm" target="_blank" rel="noopener noreferrer">Sebastian Malcolm</a>
                    </div>
                </Accordion>

                <Accordion title="AI Development Assistance">
                    <div className="ai-credits">
                        <p>Enhanced with AI assistance from Cline and Claude 3.5 Sonnet</p>
                    </div>
                </Accordion>
            </div>

            <footer className="about-footer">
                <a href="https://github.com/sebastianmalcolm/whisper-anywhere" target="_blank" rel="noopener noreferrer">
                    GitHub Repository
                </a>
                <span className="separator">•</span>
                <a href="https://github.com/sebastianmalcolm/whisper-anywhere/issues" target="_blank" rel="noopener noreferrer">
                    Report Issues
                </a>
                <span className="separator">•</span>
                <a href="https://github.com/sebastianmalcolm/whisper-anywhere/blob/main/LICENSE" target="_blank" rel="noopener noreferrer">
                    License
                </a>
            </footer>
        </div>
    );
};
