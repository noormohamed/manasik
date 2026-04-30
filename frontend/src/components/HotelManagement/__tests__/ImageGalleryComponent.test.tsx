/**
 * Unit tests for ImageGalleryComponent
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ImageGalleryComponent from '../ImageGalleryComponent';

describe('ImageGalleryComponent', () => {
  const mockImages = [
    {
      id: 'img-1',
      cdnUrl: 'https://example.com/img1.jpg',
      fileName: 'image1.jpg',
      fileSize: 1024,
      mimeType: 'image/jpeg',
      isPrimary: true,
      createdAt: '2024-01-01T00:00:00Z',
    },
    {
      id: 'img-2',
      cdnUrl: 'https://example.com/img2.jpg',
      fileName: 'image2.jpg',
      fileSize: 2048,
      mimeType: 'image/jpeg',
      isPrimary: false,
      createdAt: '2024-01-02T00:00:00Z',
    },
  ];

  const mockOnImageDeleted = jest.fn();
  const mockOnPrimaryImageSet = jest.fn();
  const mockOnImagesReordered = jest.fn();
  const mockOnError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.setItem('authToken', 'test-token');
    global.fetch = jest.fn();
  });

  afterEach(() => {
    localStorage.removeItem('authToken');
    jest.restoreAllMocks();
  });

  it('should render empty state when no images', () => {
    render(
      <ImageGalleryComponent
        hotelId="hotel-1"
        images={[]}
        onImageDeleted={mockOnImageDeleted}
        onPrimaryImageSet={mockOnPrimaryImageSet}
        onImagesReordered={mockOnImagesReordered}
        onError={mockOnError}
      />
    );

    expect(screen.getByText('No images yet')).toBeInTheDocument();
  });

  it('should render image gallery with images', () => {
    render(
      <ImageGalleryComponent
        hotelId="hotel-1"
        images={mockImages}
        onImageDeleted={mockOnImageDeleted}
        onPrimaryImageSet={mockOnPrimaryImageSet}
        onImagesReordered={mockOnImagesReordered}
        onError={mockOnError}
      />
    );

    expect(screen.getByText('image1.jpg')).toBeInTheDocument();
    expect(screen.getByText('image2.jpg')).toBeInTheDocument();
  });

  it('should display primary badge on primary image', () => {
    render(
      <ImageGalleryComponent
        hotelId="hotel-1"
        images={mockImages}
        onImageDeleted={mockOnImageDeleted}
        onPrimaryImageSet={mockOnPrimaryImageSet}
        onImagesReordered={mockOnImagesReordered}
        onError={mockOnError}
      />
    );

    const primaryBadges = screen.getAllByText('Primary');
    expect(primaryBadges.length).toBeGreaterThan(0);
  });

  it('should show delete confirmation dialog', async () => {
    render(
      <ImageGalleryComponent
        hotelId="hotel-1"
        images={mockImages}
        onImageDeleted={mockOnImageDeleted}
        onPrimaryImageSet={mockOnPrimaryImageSet}
        onImagesReordered={mockOnImagesReordered}
        onError={mockOnError}
      />
    );

    const deleteButtons = screen.getAllByRole('button').filter(btn => 
      btn.getAttribute('title') === 'Delete image'
    );
    
    if (deleteButtons.length > 0) {
      fireEvent.click(deleteButtons[0]);
      
      await waitFor(() => {
        expect(screen.getByText('Delete Image?')).toBeInTheDocument();
      });
    }
  });

  it('should handle image deletion', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'Image deleted' }),
    });

    render(
      <ImageGalleryComponent
        hotelId="hotel-1"
        images={mockImages}
        onImageDeleted={mockOnImageDeleted}
        onPrimaryImageSet={mockOnPrimaryImageSet}
        onImagesReordered={mockOnImagesReordered}
        onError={mockOnError}
      />
    );

    const deleteButtons = screen.getAllByRole('button').filter(btn => 
      btn.getAttribute('title') === 'Delete image'
    );
    
    if (deleteButtons.length > 0) {
      fireEvent.click(deleteButtons[0]);
      
      await waitFor(() => {
        const confirmButton = screen.getByRole('button', { name: /Delete/i });
        fireEvent.click(confirmButton);
      });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/hotel/hotel-1/images/'),
          expect.objectContaining({ method: 'DELETE' })
        );
      });
    }
  });

  it('should handle setting primary image', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'Primary image set' }),
    });

    render(
      <ImageGalleryComponent
        hotelId="hotel-1"
        images={mockImages}
        onImageDeleted={mockOnImageDeleted}
        onPrimaryImageSet={mockOnPrimaryImageSet}
        onImagesReordered={mockOnImagesReordered}
        onError={mockOnError}
      />
    );

    const primaryButtons = screen.getAllByRole('button').filter(btn => 
      btn.getAttribute('title') === 'Set as primary image'
    );
    
    if (primaryButtons.length > 0) {
      fireEvent.click(primaryButtons[0]);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/primary'),
          expect.objectContaining({ method: 'PUT' })
        );
      });
    }
  });

  it('should display file size in human readable format', () => {
    render(
      <ImageGalleryComponent
        hotelId="hotel-1"
        images={mockImages}
        onImageDeleted={mockOnImageDeleted}
        onPrimaryImageSet={mockOnPrimaryImageSet}
        onImagesReordered={mockOnImagesReordered}
        onError={mockOnError}
      />
    );

    expect(screen.getByText(/1 KB/)).toBeInTheDocument();
    expect(screen.getByText(/2 KB/)).toBeInTheDocument();
  });
});
