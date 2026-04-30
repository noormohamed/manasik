/**
 * Hotel Image Carousel Component
 * Displays hotel images in a carousel format for hotel details pages
 */

import React, { useState, useEffect } from 'react';
import styles from './HotelImageCarousel.module.css';

interface HotelImage {
  id: string;
  cdnUrl: string;
  fileName: string;
  isPrimary: boolean;
}

interface HotelImageCarouselProps {
  hotelIdMd5: string;
  onError?: (error: string) => void;
}

export const HotelImageCarousel: React.FC<HotelImageCarouselProps> = ({
  hotelIdMd5,
  onError,
}) => {
  const [images, setImages] = useState<HotelImage[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchImages();
  }, [hotelIdMd5]);

  const fetchImages = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/hotel/${hotelIdMd5}/images?limit=20`);

      if (!response.ok) {
        throw new Error('Failed to fetch images');
      }

      const data = await response.json();
      setImages(data.images || []);
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to load images';
      setError(errorMsg);
      onError?.(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleThumbnailClick = (index: number) => {
    setCurrentIndex(index);
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingPlaceholder}>
          <div className={styles.spinner} />
          <p>Loading images...</p>
        </div>
      </div>
    );
  }

  if (error || images.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.placeholder}>
          <svg className={styles.placeholderIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
          <p>No images available</p>
        </div>
      </div>
    );
  }

  const currentImage = images[currentIndex];

  return (
    <div className={styles.container}>
      <div className={styles.carouselContainer}>
        <div className={styles.mainImageContainer}>
          <img
            src={currentImage.cdnUrl}
            alt={currentImage.fileName}
            className={styles.mainImage}
          />

          {images.length > 1 && (
            <>
              <button
                className={`${styles.navButton} ${styles.prevButton}`}
                onClick={handlePrevious}
                aria-label="Previous image"
              >
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
                </svg>
              </button>

              <button
                className={`${styles.navButton} ${styles.nextButton}`}
                onClick={handleNext}
                aria-label="Next image"
              >
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
                </svg>
              </button>
            </>
          )}

          {currentImage.isPrimary && (
            <div className={styles.primaryBadge}>Primary Image</div>
          )}

          {images.length > 1 && (
            <div className={styles.imageCounter}>
              {currentIndex + 1} / {images.length}
            </div>
          )}
        </div>

        {images.length > 1 && (
          <div className={styles.thumbnailContainer}>
            <div className={styles.thumbnailScroll}>
              {images.map((image, index) => (
                <button
                  key={image.id}
                  className={`${styles.thumbnail} ${index === currentIndex ? styles.activeThumbnail : ''}`}
                  onClick={() => handleThumbnailClick(index)}
                  aria-label={`View image ${index + 1}`}
                >
                  <img src={image.cdnUrl} alt={`Thumbnail ${index + 1}`} />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {images.length > 1 && (
        <div className={styles.dotsContainer}>
          {images.map((_, index) => (
            <button
              key={index}
              className={`${styles.dot} ${index === currentIndex ? styles.activeDot : ''}`}
              onClick={() => handleThumbnailClick(index)}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default HotelImageCarousel;
