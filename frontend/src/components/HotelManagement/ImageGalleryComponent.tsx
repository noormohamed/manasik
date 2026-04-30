/**
 * Image Gallery Component
 * Displays hotel images with delete, reorder, and primary image management
 */

import React, { useState, useEffect } from 'react';
import styles from './ImageGalleryComponent.module.css';

interface HotelImage {
  id: string;
  cdnUrl: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  isPrimary: boolean;
  createdAt: string;
}

interface ImageGalleryComponentProps {
  hotelId: string;
  images: HotelImage[];
  onImageDeleted: (imageId: string) => void;
  onPrimaryImageSet: (imageId: string) => void;
  onImagesReordered: (imageIds: string[]) => void;
  onError: (error: string) => void;
}

export const ImageGalleryComponent: React.FC<ImageGalleryComponentProps> = ({
  hotelId,
  images,
  onImageDeleted,
  onPrimaryImageSet,
  onImagesReordered,
  onError,
}) => {
  const [localImages, setLocalImages] = useState<HotelImage[]>(images);
  const [draggedImage, setDraggedImage] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLocalImages(images);
  }, [images]);

  const handleDeleteClick = (imageId: string) => {
    setDeleteConfirm(imageId);
  };

  const handleConfirmDelete = async (imageId: string) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/hotel/${hotelId}/images/${imageId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete image');
      }

      setLocalImages(localImages.filter(img => img.id !== imageId));
      onImageDeleted(imageId);
      setDeleteConfirm(null);
    } catch (error: any) {
      onError(error.message || 'Failed to delete image');
    } finally {
      setLoading(false);
    }
  };

  const handleSetPrimary = async (imageId: string) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/hotel/${hotelId}/images/${imageId}/primary`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to set primary image');
      }

      // Update local state
      const updatedImages = localImages.map(img => ({
        ...img,
        isPrimary: img.id === imageId,
      }));
      setLocalImages(updatedImages);
      onPrimaryImageSet(imageId);
    } catch (error: any) {
      onError(error.message || 'Failed to set primary image');
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (imageId: string) => {
    setDraggedImage(imageId);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = async (targetImageId: string) => {
    if (!draggedImage || draggedImage === targetImageId) {
      setDraggedImage(null);
      return;
    }

    // Reorder locally
    const draggedIndex = localImages.findIndex(img => img.id === draggedImage);
    const targetIndex = localImages.findIndex(img => img.id === targetImageId);

    const newImages = [...localImages];
    [newImages[draggedIndex], newImages[targetIndex]] = [newImages[targetIndex], newImages[draggedIndex]];
    setLocalImages(newImages);

    // Send to server
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const imageIds = newImages.map(img => img.id);

      const response = await fetch(`/api/hotel/${hotelId}/images/reorder`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageIds }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to reorder images');
      }

      onImagesReordered(imageIds);
    } catch (error: any) {
      onError(error.message || 'Failed to reorder images');
      // Revert on error
      setLocalImages(images);
    } finally {
      setLoading(false);
      setDraggedImage(null);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  if (localImages.length === 0) {
    return (
      <div className={styles.emptyState}>
        <svg className={styles.emptyIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
        <p className={styles.emptyText}>No images yet</p>
        <p className={styles.emptySubtext}>Upload your first image to get started</p>
      </div>
    );
  }

  return (
    <div className={styles.gallery}>
      <div className={styles.galleryGrid}>
        {localImages.map((image) => (
          <div
            key={image.id}
            className={`${styles.imageCard} ${draggedImage === image.id ? styles.dragging : ''}`}
            draggable
            onDragStart={() => handleDragStart(image.id)}
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(image.id)}
          >
            {image.isPrimary && (
              <div className={styles.primaryBadge}>Primary</div>
            )}

            <div className={styles.imageContainer}>
              <img src={image.cdnUrl} alt={image.fileName} className={styles.image} />
              <div className={styles.imageOverlay}>
                <div className={styles.imageActions}>
                  {!image.isPrimary && (
                    <button
                      className={styles.actionButton}
                      onClick={() => handleSetPrimary(image.id)}
                      disabled={loading}
                      title="Set as primary image"
                    >
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    </button>
                  )}
                  <button
                    className={`${styles.actionButton} ${styles.deleteButton}`}
                    onClick={() => handleDeleteClick(image.id)}
                    disabled={loading}
                    title="Delete image"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <div className={styles.imageInfo}>
              <p className={styles.fileName} title={image.fileName}>{image.fileName}</p>
              <p className={styles.fileSize}>{formatFileSize(image.fileSize)}</p>
              <p className={styles.uploadDate}>{formatDate(image.createdAt)}</p>
            </div>

            <div className={styles.dragHandle}>
              <svg viewBox="0 0 24 24" fill="currentColor">
                <circle cx="9" cy="5" r="1.5" />
                <circle cx="9" cy="12" r="1.5" />
                <circle cx="9" cy="19" r="1.5" />
                <circle cx="15" cy="5" r="1.5" />
                <circle cx="15" cy="12" r="1.5" />
                <circle cx="15" cy="19" r="1.5" />
              </svg>
            </div>
          </div>
        ))}
      </div>

      {deleteConfirm && (
        <div className={styles.confirmDialog}>
          <div className={styles.confirmContent}>
            <h3>Delete Image?</h3>
            <p>Are you sure you want to delete this image? This action cannot be undone.</p>
            <div className={styles.confirmButtons}>
              <button
                className={styles.confirmButton}
                onClick={() => handleConfirmDelete(deleteConfirm)}
                disabled={loading}
              >
                Delete
              </button>
              <button
                className={styles.cancelButton}
                onClick={() => setDeleteConfirm(null)}
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageGalleryComponent;
