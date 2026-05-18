'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { apiClient } from '@/lib/api';
import { md5 } from '@/lib/md5';

interface HotelImage {
  id: string;
  hotelId: string;
  cdnUrl: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  isPrimary: boolean;
  imageNumber: number;
  displayOrder: number;
  createdAt: string;
}

interface HotelImagesTabProps {
  hotelId: string;
}

const HotelImagesTab: React.FC<HotelImagesTabProps> = ({ hotelId }) => {
  const [images, setImages] = useState<HotelImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchImages();
  }, [hotelId]);

  const fetchImages = async () => {
    setLoading(true);
    setError(null);
    try {
      const hotelIdMd5 = md5(hotelId);
      const response = await apiClient.get<{
        images: HotelImage[];
        pagination: { total: number };
      }>(`/hotel/${hotelIdMd5}/images?limit=50`);
      setImages(response.images || []);
      setTotal(response.pagination?.total || 0);
    } catch (err: any) {
      // If 404 or no images, just show empty state
      if (err.status === 404) {
        setImages([]);
        setTotal(0);
      } else {
        setError(err.error || 'Failed to load images');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Only JPEG, PNG, and WebP images are allowed');
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    setUploading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/hotel/${hotelId}/images`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Upload failed');
      }

      setSuccessMsg('Image uploaded successfully');
      await fetchImages();
    } catch (err: any) {
      setError(err.message || 'Failed to upload image');
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDelete = async (imageId: string) => {
    if (!confirm('Are you sure you want to delete this image?')) return;

    setError(null);
    setSuccessMsg(null);

    try {
      await apiClient.delete(`/hotel/${hotelId}/images/${imageId}`);
      setSuccessMsg('Image deleted successfully');
      await fetchImages();
    } catch (err: any) {
      setError(err.error || 'Failed to delete image');
    }
  };

  const handleSetPrimary = async (imageId: string) => {
    setError(null);
    setSuccessMsg(null);

    try {
      await apiClient.put(`/hotel/${hotelId}/images/${imageId}/primary`, {});
      setSuccessMsg('Primary image updated');
      await fetchImages();
    } catch (err: any) {
      setError(err.error || 'Failed to set primary image');
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading images...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="mb-0">Hotel Images ({total})</h4>
        <button
          className="btn btn-primary btn-sm"
          onClick={handleUploadClick}
          disabled={uploading}
        >
          {uploading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Uploading...
            </>
          ) : (
            <>
              <i className="ri-upload-2-line me-2"></i>
              Upload Image
            </>
          )}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
      </div>

      {error && (
        <div className="alert alert-danger alert-dismissible" role="alert">
          <i className="ri-error-warning-line me-2"></i>
          {error}
          <button type="button" className="btn-close" onClick={() => setError(null)}></button>
        </div>
      )}

      {successMsg && (
        <div className="alert alert-success alert-dismissible" role="alert">
          <i className="ri-check-line me-2"></i>
          {successMsg}
          <button type="button" className="btn-close" onClick={() => setSuccessMsg(null)}></button>
        </div>
      )}

      {images.length === 0 ? (
        <div className="card">
          <div className="card-body text-center py-5">
            <i className="ri-image-line" style={{ fontSize: '48px', color: '#ccc' }}></i>
            <p className="text-muted mt-3 mb-0">No images uploaded yet. Click "Upload Image" to add your first hotel photo.</p>
          </div>
        </div>
      ) : (
        <div className="row g-3">
          {images.map((image) => (
            <div key={image.id} className="col-6 col-md-4 col-lg-3">
              <div className="card h-100">
                <div style={{ position: 'relative', height: '180px' }}>
                  <Image
                    src={image.cdnUrl}
                    alt={image.fileName}
                    fill
                    style={{ objectFit: 'cover', borderTopLeftRadius: '0.375rem', borderTopRightRadius: '0.375rem' }}
                  />
                  {image.isPrimary && (
                    <span
                      className="badge bg-success"
                      style={{ position: 'absolute', top: '8px', left: '8px' }}
                    >
                      <i className="ri-star-fill me-1"></i>Primary
                    </span>
                  )}
                </div>
                <div className="card-body p-2">
                  <p className="small text-muted mb-1 text-truncate" title={image.fileName}>
                    {image.fileName}
                  </p>
                  <p className="small text-muted mb-2">
                    {formatFileSize(image.fileSize)}
                  </p>
                  <div className="d-flex gap-1">
                    {!image.isPrimary && (
                      <button
                        className="btn btn-outline-success btn-sm flex-grow-1"
                        onClick={() => handleSetPrimary(image.id)}
                        title="Set as primary image"
                      >
                        <i className="ri-star-line"></i>
                      </button>
                    )}
                    <button
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => handleDelete(image.id)}
                      title="Delete image"
                    >
                      <i className="ri-delete-bin-line"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HotelImagesTab;
