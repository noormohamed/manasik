/**
 * Unit Tests for CreateBookingModal Component
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CreateBookingModal from '../CreateBookingModal';

// Mock the API client
vi.mock('@/lib/api', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe('CreateBookingModal', () => {
  const mockOnClose = vi.fn();
  const mockOnBookingCreated = vi.fn();
  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    hotelId: 'hotel-1',
    onBookingCreated: mockOnBookingCreated,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Modal Rendering', () => {
    it('should render modal when isOpen is true', () => {
      render(<CreateBookingModal {...defaultProps} />);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Create Booking')).toBeInTheDocument();
    });

    it('should not render modal when isOpen is false', () => {
      render(<CreateBookingModal {...defaultProps} isOpen={false} />);
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should have proper ARIA attributes', () => {
      render(<CreateBookingModal {...defaultProps} />);
      const modal = screen.getByRole('dialog');
      expect(modal).toHaveAttribute('aria-modal', 'true');
      expect(modal).toHaveAttribute('aria-labelledby', 'modal-title');
    });
  });

  describe('Form Fields', () => {
    it('should render all required form fields', () => {
      render(<CreateBookingModal {...defaultProps} />);

      expect(screen.getByLabelText(/Guest Email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/First Name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Last Name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Check-In Date/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Check-Out Date/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Room Type/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Number of Guests/i)).toBeInTheDocument();
    });

    it('should render optional fields', () => {
      render(<CreateBookingModal {...defaultProps} />);

      expect(screen.getByLabelText(/Phone/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Send Payment Link/i)).toBeInTheDocument();
    });
  });

  describe('Email Validation', () => {
    it('should accept valid email format', async () => {
      const user = userEvent.setup();
      render(<CreateBookingModal {...defaultProps} />);

      const emailInput = screen.getByLabelText(/Guest Email/i);
      await user.type(emailInput, 'valid@example.com');

      expect(emailInput).toHaveValue('valid@example.com');
      expect(screen.queryByText(/Invalid email format/i)).not.toBeInTheDocument();
    });

    it('should reject invalid email format', async () => {
      const user = userEvent.setup();
      render(<CreateBookingModal {...defaultProps} />);

      const emailInput = screen.getByLabelText(/Guest Email/i);
      await user.type(emailInput, 'invalid-email');

      // Trigger validation by trying to submit
      const submitButton = screen.getByRole('button', { name: /Create Booking/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Invalid email format/i)).toBeInTheDocument();
      });
    });
  });

  describe('Date Validation', () => {
    it('should reject past check-in date', async () => {
      const user = userEvent.setup();
      render(<CreateBookingModal {...defaultProps} />);

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      const checkInInput = screen.getByLabelText(/Check-In Date/i);
      await user.type(checkInInput, yesterdayStr);

      const submitButton = screen.getByRole('button', { name: /Create Booking/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Check-in date must be today or later/i)).toBeInTheDocument();
      });
    });

    it('should reject check-out date before check-in date', async () => {
      const user = userEvent.setup();
      render(<CreateBookingModal {...defaultProps} />);

      const checkInInput = screen.getByLabelText(/Check-In Date/i);
      const checkOutInput = screen.getByLabelText(/Check-Out Date/i);

      await user.type(checkInInput, '2024-12-27');
      await user.type(checkOutInput, '2024-12-25');

      const submitButton = screen.getByRole('button', { name: /Create Booking/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Check-out date must be after check-in date/i)).toBeInTheDocument();
      });
    });

    it('should clear check-out date if check-in date changes to after it', async () => {
      const user = userEvent.setup();
      render(<CreateBookingModal {...defaultProps} />);

      const checkInInput = screen.getByLabelText(/Check-In Date/i);
      const checkOutInput = screen.getByLabelText(/Check-Out Date/i);

      await user.type(checkInInput, '2024-12-25');
      await user.type(checkOutInput, '2024-12-27');

      expect(checkOutInput).toHaveValue('2024-12-27');

      // Change check-in to after check-out
      await user.clear(checkInInput);
      await user.type(checkInInput, '2024-12-28');

      // Check-out should be cleared
      expect(checkOutInput).toHaveValue('');
    });
  });

  describe('Guest Count Validation', () => {
    it('should reject zero guests', async () => {
      const user = userEvent.setup();
      render(<CreateBookingModal {...defaultProps} />);

      const guestCountInput = screen.getByLabelText(/Number of Guests/i);
      await user.clear(guestCountInput);
      await user.type(guestCountInput, '0');

      const submitButton = screen.getByRole('button', { name: /Create Booking/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Number of guests must be at least 1/i)).toBeInTheDocument();
      });
    });

    it('should accept positive guest count', async () => {
      const user = userEvent.setup();
      render(<CreateBookingModal {...defaultProps} />);

      const guestCountInput = screen.getByLabelText(/Number of Guests/i);
      await user.clear(guestCountInput);
      await user.type(guestCountInput, '2');

      expect(guestCountInput).toHaveValue(2);
    });
  });

  describe('Form Submission', () => {
    it('should disable submit button when form is invalid', () => {
      render(<CreateBookingModal {...defaultProps} />);

      const submitButton = screen.getByRole('button', { name: /Create Booking/i });
      expect(submitButton).toBeDisabled();
    });

    it('should enable submit button when form is valid', async () => {
      const user = userEvent.setup();
      render(<CreateBookingModal {...defaultProps} />);

      const emailInput = screen.getByLabelText(/Guest Email/i);
      const firstNameInput = screen.getByLabelText(/First Name/i);
      const lastNameInput = screen.getByLabelText(/Last Name/i);
      const checkInInput = screen.getByLabelText(/Check-In Date/i);
      const checkOutInput = screen.getByLabelText(/Check-Out Date/i);
      const roomTypeSelect = screen.getByLabelText(/Room Type/i);

      await user.type(emailInput, 'guest@example.com');
      await user.type(firstNameInput, 'John');
      await user.type(lastNameInput, 'Doe');
      await user.type(checkInInput, '2024-12-25');
      await user.type(checkOutInput, '2024-12-27');
      await user.selectOption(roomTypeSelect, 'room-1');

      const submitButton = screen.getByRole('button', { name: /Create Booking/i });
      expect(submitButton).not.toBeDisabled();
    });
  });

  describe('Modal Close', () => {
    it('should close modal when close button is clicked', async () => {
      const user = userEvent.setup();
      render(<CreateBookingModal {...defaultProps} />);

      const closeButton = screen.getByLabelText(/Close modal/i);
      await user.click(closeButton);

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should close modal when backdrop is clicked', async () => {
      const user = userEvent.setup();
      render(<CreateBookingModal {...defaultProps} />);

      const backdrop = screen.getByRole('dialog').parentElement;
      if (backdrop) {
        await user.click(backdrop);
      }

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should close modal when cancel button is clicked', async () => {
      const user = userEvent.setup();
      render(<CreateBookingModal {...defaultProps} />);

      const cancelButton = screen.getByRole('button', { name: /Cancel/i });
      await user.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have proper form labels', () => {
      render(<CreateBookingModal {...defaultProps} />);

      expect(screen.getByLabelText(/Guest Email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/First Name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Last Name/i)).toBeInTheDocument();
    });

    it('should announce validation errors to screen readers', async () => {
      const user = userEvent.setup();
      render(<CreateBookingModal {...defaultProps} />);

      const emailInput = screen.getByLabelText(/Guest Email/i);
      await user.type(emailInput, 'invalid');

      const submitButton = screen.getByRole('button', { name: /Create Booking/i });
      await user.click(submitButton);

      await waitFor(() => {
        const errorElement = screen.getByText(/Invalid email format/i);
        expect(errorElement).toHaveAttribute('id', 'guestEmail-error');
      });
    });

    it('should have keyboard navigation support', async () => {
      const user = userEvent.setup();
      render(<CreateBookingModal {...defaultProps} />);

      const emailInput = screen.getByLabelText(/Guest Email/i);
      emailInput.focus();
      expect(emailInput).toHaveFocus();

      // Tab to next field
      await user.tab();
      expect(screen.getByLabelText(/First Name/i)).toHaveFocus();
    });
  });

  describe('Booking Summary', () => {
    it('should display booking summary when dates and room are selected', async () => {
      const user = userEvent.setup();
      render(<CreateBookingModal {...defaultProps} />);

      const emailInput = screen.getByLabelText(/Guest Email/i);
      const firstNameInput = screen.getByLabelText(/First Name/i);
      const lastNameInput = screen.getByLabelText(/Last Name/i);
      const checkInInput = screen.getByLabelText(/Check-In Date/i);
      const checkOutInput = screen.getByLabelText(/Check-Out Date/i);
      const roomTypeSelect = screen.getByLabelText(/Room Type/i);

      await user.type(emailInput, 'guest@example.com');
      await user.type(firstNameInput, 'John');
      await user.type(lastNameInput, 'Doe');
      await user.type(checkInInput, '2024-12-25');
      await user.type(checkOutInput, '2024-12-27');
      await user.selectOption(roomTypeSelect, 'room-1');

      // Summary should be visible
      expect(screen.getByText(/Booking Summary/i)).toBeInTheDocument();
      expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
    });
  });

  describe('Payment Link Option', () => {
    it('should render payment link checkbox', () => {
      render(<CreateBookingModal {...defaultProps} />);

      expect(screen.getByLabelText(/Send Payment Link to Guest/i)).toBeInTheDocument();
    });

    it('should allow toggling payment link option', async () => {
      const user = userEvent.setup();
      render(<CreateBookingModal {...defaultProps} />);

      const checkbox = screen.getByLabelText(/Send Payment Link to Guest/i);
      expect(checkbox).not.toBeChecked();

      await user.click(checkbox);
      expect(checkbox).toBeChecked();

      await user.click(checkbox);
      expect(checkbox).not.toBeChecked();
    });
  });
});
