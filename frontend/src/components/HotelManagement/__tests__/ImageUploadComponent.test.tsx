/**
 * Unit tests for ImageUploadComponent
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ImageUploadComponent from '../ImageUploadComponent';

describe('ImageUploadComponent', () => {
  const mockOnUploadSuccess = jest.fn();
  const mockOnUploadError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.setItem('authToken', 'test-token');
  });

  afterEach(() => {
    localStorage.removeItem('authToken');
  });

  it('should render upload area', () => {
    render(
      <ImageUploadComponent
        hotelId="hotel-1"
        onUploadSuccess={mockOnUploadSuccess}
        onUploadError={mockOnUploadError}
      />
    );

    expect(screen.getByText(/Drag and drop your image here/i)).toBeInTheDocument();
  });

  it('should accept file selection', async () => {
    render(
      <ImageUploadComponent
        hotelId="hotel-1"
        onUploadSuccess={mockOnUploadSuccess}
        onUploadError={mockOnUploadError}
      />
    );

    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const input = screen.getByRole('button', { name: /Select Image/i }).parentElement?.querySelector('input[type="file"]');

    if (input) {
      await userEvent.upload(input, file);
      await waitFor(() => {
        expect(screen.getByText('test.jpg')).toBeInTheDocument();
      });
    }
  });

  it('should reject invalid file types', async () => {
    render(
      <ImageUploadComponent
        hotelId="hotel-1"
        onUploadSuccess={mockOnUploadSuccess}
        onUploadError={mockOnUploadError}
      />
    );

    const file = new File(['test'], 'test.txt', { type: 'text/plain' });
    const input = screen.getByRole('button', { name: /Select Image/i }).parentElement?.querySelector('input[type="file"]');

    if (input) {
      await userEvent.upload(input, file);
      await waitFor(() => {
        expect(mockOnUploadError).toHaveBeenCalledWith(expect.stringContaining('Invalid file type'));
      });
    }
  });

  it('should reject files exceeding size limit', async () => {
    render(
      <ImageUploadComponent
        hotelId="hotel-1"
        onUploadSuccess={mockOnUploadSuccess}
        onUploadError={mockOnUploadError}
      />
    );

    const largeBuffer = Buffer.alloc(11 * 1024 * 1024); // 11MB
    const file = new File([largeBuffer], 'large.jpg', { type: 'image/jpeg' });
    const input = screen.getByRole('button', { name: /Select Image/i }).parentElement?.querySelector('input[type="file"]');

    if (input) {
      await userEvent.upload(input, file);
      await waitFor(() => {
        expect(mockOnUploadError).toHaveBeenCalledWith(expect.stringContaining('exceeds maximum'));
      });
    }
  });

  it('should display preview after file selection', async () => {
    render(
      <ImageUploadComponent
        hotelId="hotel-1"
        onUploadSuccess={mockOnUploadSuccess}
        onUploadError={mockOnUploadError}
      />
    );

    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const input = screen.getByRole('button', { name: /Select Image/i }).parentElement?.querySelector('input[type="file"]');

    if (input) {
      await userEvent.upload(input, file);
      await waitFor(() => {
        const preview = screen.getByAltText('Preview');
        expect(preview).toBeInTheDocument();
      });
    }
  });

  it('should display upload button after file selection', async () => {
    render(
      <ImageUploadComponent
        hotelId="hotel-1"
        onUploadSuccess={mockOnUploadSuccess}
        onUploadError={mockOnUploadError}
      />
    );

    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const input = screen.getByRole('button', { name: /Select Image/i }).parentElement?.querySelector('input[type="file"]');

    if (input) {
      await userEvent.upload(input, file);
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Upload Image/i })).toBeInTheDocument();
      });
    }
  });

  it('should allow canceling file selection', async () => {
    render(
      <ImageUploadComponent
        hotelId="hotel-1"
        onUploadSuccess={mockOnUploadSuccess}
        onUploadError={mockOnUploadError}
      />
    );

    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const input = screen.getByRole('button', { name: /Select Image/i }).parentElement?.querySelector('input[type="file"]');

    if (input) {
      await userEvent.upload(input, file);
      await waitFor(() => {
        expect(screen.getByText('test.jpg')).toBeInTheDocument();
      });

      const cancelButton = screen.getByRole('button', { name: /Cancel/i });
      fireEvent.click(cancelButton);

      await waitFor(() => {
        expect(screen.queryByText('test.jpg')).not.toBeInTheDocument();
      });
    }
  });
});
