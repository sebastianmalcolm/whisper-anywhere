import React, { useState, useEffect } from 'react';
import './ImageCarousel.css';

interface CarouselImage {
    src: string;
    alt: string;
    href?: string;
}

interface ImageCarouselProps {
    images: CarouselImage[];
    autoPlayInterval?: number;
}

export const ImageCarousel: React.FC<ImageCarouselProps> = ({
    images,
    autoPlayInterval = 3000,
}) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (images.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentIndex((current) => (current + 1) % images.length);
        }, autoPlayInterval);

        return () => clearInterval(interval);
    }, [images.length, autoPlayInterval]);

    const renderImage = (image: CarouselImage) => {
        const img = (
            <img
                src={image.src}
                alt={image.alt}
                className="carousel-image"
            />
        );

        return image.href ? (
            <a
                href={image.href}
                target="_blank"
                rel="noopener noreferrer"
                className="carousel-link"
            >
                {img}
            </a>
        ) : img;
    };

    return (
        <div className="image-carousel">
            <div className="carousel-container">
                {images.map((image, index) => (
                    <div
                        key={index}
                        className={`carousel-slide ${
                            index === currentIndex ? 'active' : ''
                        }`}
                    >
                        {renderImage(image)}
                    </div>
                ))}
            </div>
            {images.length > 1 && (
                <div className="carousel-indicators">
                    {images.map((_, index) => (
                        <button
                            key={index}
                            className={`carousel-dot ${
                                index === currentIndex ? 'active' : ''
                            }`}
                            onClick={() => setCurrentIndex(index)}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};
