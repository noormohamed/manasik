/**
 * Image Upload Component
 * Handles file selection, validation, preview, and upload
 */

import React, { useState, useRef } from 'react';
import styles from './ImageUploadComponent.module.css';

interface ImageUploadComponentProps {
  hotelId: string;
  onUploadSuccess: (image: any) => void;
  onUploadError: (error: string) => void;
}

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const ImageUploadComponent: React.FC<ImageUploadComponentProps> = ({
  hotelId,
  onUploadSuccess,
  onUploadError,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragOverRef = useRef(false);

  const validateFile = (file: File): { valid: boolean; error?: string } => {
    // Check MIME type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return {
        valid: false,
        error: `Invalid file type. Allowed types: JPEG, PNG, WebP`,
      };
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return {
        valid: false,
        error: `File size exceeds maximum limit of ${MAX_FILE_SIZE / 1024 / 1024}MB`,
      };
    }

    return { valid: true };
  };

  const handleFileSelect = (file: File) => {
    setError(null);
    setSuccess(false);

    const validation = validateFile(file);
    if (!validation.valid) {
      setError(validation.error || 'Invalid file');
      onUploadError(validation.error || 'Invalid file');
      return;
    }

    setSelectedFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    dragOverRef.current = true;
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    dragOverRef.current = false;
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    dragOverRef.current = false;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('No file selected');
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(false);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const xhr = new XMLHttpRequest();

      // Track upload progress
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 100;
          setUploadProgress(percentComplete);
        }
      });

      // Handle completion
      xhr.addEventListener('load', () => {
        if (xhr.status === 201) {
          const response = JSON.parse(xhr.responseText);
          setSuccess(true);
          setSelectedFile(null);
          setPreview(null);
          setUploadProgress(0);
          onUploadSuccess(response.image);

          // Reset after 2 seconds
          setTimeout(() => {
            setSuccess(false);
          }, 2000);
        } else {
          const response = JSON.parse(xhr.responseText);
          const errorMsg = response.error || 'Upload failed';
          setError(errorMsg);
          onUploadError(errorMsg);
        }
        setUploading(false);
      });

      // Handle errors
      xhr.addEventListener('error', () => {
        const errorMsg = 'Upload failed. Please try again.';
        setError(errorMsg);
        onUploadError(errorMsg);
        setUploading(false);
      });

      // Send request
      const token = localStorage.getItem('authToken');
      xhr.open('POST', `/api/hotel/${hotelId}/images`);
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }
      xhr.send(formData);
    } catch (err: any) {
      const errorMsg = err.message || 'Upload failed';
      setError(errorMsg);
      onUploadError(errorMsg);
      setUploading(false);
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setPreview(null);
    setError(null);
    setSuccess(false);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.uploadArea}>
        {!preview ? (
          <div
            className={`${styles.dropZone} ${dragOverRef.current ? styles.dragOver : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className={styles.dropZoneContent}>
              <svg className={styles.uploadIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <p className={styles.dropZoneText}>
                Drag and drop your image here, or click to select
              </p>
              <p className={styles.dropZoneSubtext}>
                Supported formats: JPEG, PNG, WebP (Max 10MB)
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept={ALLOWED_MIME_TYPES.join(',')}
              onChange={handleInputChange}
              style={{ display: 'none' }}
            />
          </div>
        ) : (
          <div className={styles.previewContainer}>
            <img src={preview} alt="Preview" className={styles.preview} />
            <div className={styles.fileInfo}>
              <p className={styles.fileName}>{selectedFile?.name}</p>
              <p className={styles.fileSize}>
                {(selectedFile?.size || 0) / 1024 > 1024
                  ? `${((selectedFile?.size || 0) / 1024 / 1024).toFixed(2)} MB`
                  : `${((selectedFile?.size || 0) / 1024).toFixed(2)} KB`}
              </p>
            </div>
          </div>
        )}
      </div>

      {uploading && (
        <div className={styles.progressContainer}>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <p className={styles.progressText}>{Math.round(uploadProgress)}% uploaded</p>
        </div>
      )}

      {error && (
        <div className={styles.errorMessage}>
          <svg className={styles.errorIcon} viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {error}
        </div>
      )}

      {success && (
        <div className={styles.successMessage}>
          <svg className={styles.successIcon} viewBox="0 0 24 24" fill="currentColor">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
          </svg>
          Image uploaded successfully!
        </div>
      )}

      <div className={styles.buttonContainer}>
        {preview && !uploading && (
          <>
            <button
              className={styles.uploadButton}
              onClick={handleUpload}
              disabled={uploading}
            >
              Upload Image
            </button>
            <button
              className={styles.cancelButton}
              onClick={handleCancel}
              disabled={uploading}
            >
              Cancel
            </button>
          </>
        )}
        {!preview && !uploading && (
          <button
            className={styles.selectButton}
            onClick={() => fileInputRef.current?.click()}
          >
            Select Image
          </button>
        )}
      </div>
    </div>
  );
};

export default ImageUploadComponent;
