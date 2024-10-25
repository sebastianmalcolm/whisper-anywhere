import React from 'react';
import { version } from '../../../package.json';
import { Accordion } from './common/Accordion';
import { ImageCarousel } from './common/ImageCarousel';
import './AboutSection.css';

const providerImages = [
    {
        src: '/assets/PBG-mark1-color.svg',
        alt: 'Powered by Groq',
        href: 'https://groq.com'
    },
    {
        src: '/resources/openai.com/openai-logos/SVGs/openai-white-lockup.svg',
        alt: 'Powered by OpenAI Whisper',
        href: 'https://openai.com'
    }
];

export const AboutSection: React.FC = () => {
    return (
        <div className="about-section">
            <div className="version-info">
                <h3>Version {version}</h3>
                <p>Voice-to-Text Anywhere with AI Speech Recognition</p>
            </div>

            <div className="provider-attribution">
                <h4>Powered By</h4>
                <ImageCarousel images={providerImages} />
            </div>

            <Accordion title="Recent Changes" defaultExpanded>
                <div className="version-history">
                    <ul>
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

            <div className="links">
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
            </div>
        </div>
    );
};
