/**
 * Unit tests for RefundModal component
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RefundModal from '../RefundModal';
import { Booking } from '../types';

describe('RefundModal', () => {
  const mockBooking: Booking = {
    id: 'booking-1',
    hotelName: 'Test Hotel',
    total: 1000,
    refundAmount: 0,
    currency: 'USD',
    status: 'COMPLETED',
    subtotal: 900,
    tax: 100,
    hotelId: 'hotel-1',
    roomTypeId: 'room-1',
    roomName: 'Room',
    checkIn: '2024-01-15',
    checkOut: '2024-01-20',
    nights: 5,
    guestName: 'John Doe',
    guestEmail: 'john@example.com',
    guestCount: 2,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  };

  const mockOnClose = jest.fn();
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should not render when isOpen is false', () => {
    const { container } = render(
      <RefundModal
        booking={mockBooking}
        isOpen={false}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        isProcessing={false}
      />
    );

    expect(container.querySelector('[class*="overlay"]')).not.toBeInTheDocument();
  });

  it('should render modal when isOpen is true', () => {
    render(
      <RefundModal
        booking={mockBooking}
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        isProcessing={false}
      />
    );

    expect(screen.getByText('Refund Amount')).toBeInTheDocument();
    expect(screen.getByText('Test Hotel')).toBeInTheDocument();
  });

  it('should pre-fill refund amount with maximum available', () => {
    render(
      <RefundModal
        booking={mockBooking}
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        isProcessing={false}
      />
    );

    const amountInput = screen.getByDisplayValue('1000');
    expect(amountInput).toBeInTheDocument();
  });

  it('should show error when reason is empty', async () => {
    render(
      <RefundModal
        booking={mockBooking}
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        isProcessing={false}
      />
    );

    const submitButtons = screen.getAllByRole('button');
    const submitButton = submitButtons.find((btn) => btn.textContent?.includes('Process Refund'));
    fireEvent.click(submitButton!);

    expect(screen.getByText(/Please provide a refund reason/i)).toBeInTheDocument();
  });

  it('should call onClose when close button is clicked', () => {
    render(
      <RefundModal
        booking={mockBooking}
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        isProcessing={false}
      />
    );

    const closeButton = screen.getByLabelText('Close modal');
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should disable buttons when isProcessing is true', () => {
    render(
      <RefundModal
        booking={mockBooking}
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        isProcessing={true}
      />
    );

    const closeButton = screen.getByLabelText('Close modal');
    const cancelButton = screen.getByRole('button', { name: /Cancel/i });

    expect(closeButton).toBeDisabled();
    expect(cancelButton).toBeDisabled();
  });
});
