import React, { useState } from 'react';
import './Accordion.css';

interface AccordionProps {
    title: string;
    children: React.ReactNode;
    defaultExpanded?: boolean;
}

export const Accordion: React.FC<AccordionProps> = ({
    title,
    children,
    defaultExpanded = false,
}) => {
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);

    return (
        <div className="accordion">
            <button
                className={`accordion-header ${isExpanded ? 'expanded' : ''}`}
                onClick={() => setIsExpanded(!isExpanded)}
                aria-expanded={isExpanded}
            >
                <span className="accordion-title">{title}</span>
                <span className="accordion-icon">{isExpanded ? '−' : '+'}</span>
            </button>
            <div
                className={`accordion-content ${isExpanded ? 'expanded' : ''}`}
                aria-hidden={!isExpanded}
            >
                {children}
            </div>
        </div>
    );
};
