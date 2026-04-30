/**
 * Hotel Listing Images Component
 * Displays primary images for multiple hotels on listing pages
 */

import React, { useState, useEffect } from 'react';
import styles from './HotelListingImages.module.css';

interface HotelImage {
  id: string;
  cdnUrl: string;
  fileName: string;
  isPrimary: boolean;
}

interface HotelListingImagesProps {
  hotelIdsMd5: string[];
  onError?: (error: string) => void;
}

export const HotelListingImages: React.FC<HotelListingImagesProps> = ({
  hotelIdsMd5,
  onError,
}) => {
  const [imagesMap, setImagesMap] = useState<Record<string, HotelImage[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (hotelIdsMd5.length === 0) {
      setLoading(false);
      return;
    }

    fetchImages();
  }, [hotelIdsMd5]);

  const fetchImages = async () => {
    setLoading(true);
    setError(null);

    try {
      const hotelIdsParam = hotelIdsMd5.join(',');
      const response = await fetch(`/api/hotel/images?hotelIds=${hotelIdsParam}&limit=1`);

      if (!response.ok) {
        throw new Error('Failed to fetch images');
      }

      const data = await response.json();
      setImagesMap(data.data || {});
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to load images';
      setError(errorMsg);
      onError?.(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const getPrimaryImage = (hotelIdMd5: string): HotelImage | null => {
    const images = imagesMap[hotelIdMd5] || [];
    return images.length > 0 ? images[0] : null;
  };

  return {
    loading,
    error,
    getPrimaryImage,
    imagesMap,
  };
};

/**
 * Hotel Card Image Component
 * Displays a single hotel's primary image
 */
interface HotelCardImageProps {
  hotelIdMd5: string;
  hotelName: string;
  image?: HotelImage | null;
  loading?: boolean;
}

export const HotelCardImage: React.FC<HotelCardImageProps> = ({
  hotelIdMd5,
  hotelName,
  image,
  loading,
}) => {
  if (loading) {
    return (
      <div className={styles.imageContainer}>
        <div className={styles.loadingPlaceholder}>
          <div className={styles.spinner} />
        </div>
      </div>
    );
  }

  if (!image) {
    return (
      <div className={styles.imageContainer}>
        <div className={styles.placeholder}>
          <svg className={styles.placeholderIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.imageContainer}>
      <img
        src={image.cdnUrl}
        alt={hotelName}
        className={styles.image}
        loading="lazy"
      />
    </div>
  );
};

export default HotelListingImages;
