import React from 'react';
import { version } from '../../../package.json';

export const AboutSection: React.FC = () => {
    return (
        <div className="about-section">
            <div className="version-info">
                <h3>Version {version}</h3>
                <p>Voice-to-Text Anywhere with AI Speech Recognition</p>
            </div>

            <div className="provider-badges">
                <a href="https://openai.com" target="_blank" rel="noopener noreferrer">
                    <img 
                        src="assets/openai-logo.svg" 
                        alt="Powered by OpenAI Whisper" 
                        className="provider-badge"
                    />
                </a>
                <a href="https://groq.com" target="_blank" rel="noopener noreferrer">
                    <img
                        src="assets/PBG-mark1-color.svg"
                        alt="Powered by Groq for fast inference."
                        className="provider-badge"
                    />
                </a>
            </div>

            <div className="contributors">
                <h4>Contributors</h4>
                <div className="contributor-list">
                    <a href="https://github.com/ordinath" target="_blank" rel="noopener noreferrer">Ordinath</a>
                    <a href="https://github.com/redocrepus" target="_blank" rel="noopener noreferrer">redocrepus</a>
                    <a href="https://github.com/alireza29675" target="_blank" rel="noopener noreferrer">Alireza Sheikholmolouki</a>
                    <a href="https://github.com/sebastianmalcolm" target="_blank" rel="noopener noreferrer">Sebastian Malcolm</a>
                </div>
            </div>

            <div className="version-history">
                <h4>Recent Changes</h4>
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

            <div className="ai-credits">
                <h4>AI Development Assistance</h4>
                <p>Enhanced with AI assistance from Cline and Claude 3.5 Sonnet</p>
            </div>

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
