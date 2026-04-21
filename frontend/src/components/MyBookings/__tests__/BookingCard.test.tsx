/**
 * Unit tests for BookingCard component
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import BookingCard from '../BookingCard';
import { Booking } from '../types';

describe('BookingCard', () => {
  const mockBooking: Booking = {
    id: 'booking-1',
    hotelName: 'Test Hotel',
    roomName: 'Deluxe Room',
    checkIn: '2024-01-15',
    checkOut: '2024-01-20',
    nights: 5,
    total: 500,
    currency: 'USD',
    status: 'COMPLETED',
    subtotal: 450,
    tax: 50,
    hotelId: 'hotel-1',
    roomTypeId: 'room-1',
    guestName: 'John Doe',
    guestEmail: 'john@example.com',
    guestCount: 2,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  };

  it('should render booking card with correct information', () => {
    const mockClick = jest.fn();
    render(
      <BookingCard
        booking={mockBooking}
        isSelected={false}
        onClick={mockClick}
      />
    );

    expect(screen.getByText('Test Hotel')).toBeInTheDocument();
    expect(screen.getByText('Deluxe Room')).toBeInTheDocument();
    expect(screen.getByText('5 nights')).toBeInTheDocument();
  });

  it('should apply selected styling when isSelected is true', () => {
    const mockClick = jest.fn();
    const { container } = render(
      <BookingCard
        booking={mockBooking}
        isSelected={true}
        onClick={mockClick}
      />
    );

    const card = container.querySelector('[role="button"]');
    expect(card).toHaveClass('selected');
  });

  it('should call onClick when card is clicked', () => {
    const mockClick = jest.fn();
    const { container } = render(
      <BookingCard
        booking={mockBooking}
        isSelected={false}
        onClick={mockClick}
      />
    );

    const card = container.querySelector('[role="button"]');
    fireEvent.click(card!);
    expect(mockClick).toHaveBeenCalledTimes(1);
  });

  it('should handle keyboard Enter key', () => {
    const mockClick = jest.fn();
    const { container } = render(
      <BookingCard
        booking={mockBooking}
        isSelected={false}
        onClick={mockClick}
      />
    );

    const card = container.querySelector('[role="button"]');
    fireEvent.keyDown(card!, { key: 'Enter' });
    expect(mockClick).toHaveBeenCalledTimes(1);
  });

  it('should display status badge', () => {
    const mockClick = jest.fn();
    render(
      <BookingCard
        booking={mockBooking}
        isSelected={false}
        onClick={mockClick}
      />
    );

    expect(screen.getByText('COMPLETED')).toBeInTheDocument();
  });

  it('should format currency correctly', () => {
    const mockClick = jest.fn();
    render(
      <BookingCard
        booking={mockBooking}
        isSelected={false}
        onClick={mockClick}
      />
    );

    expect(screen.getByText('$500.00')).toBeInTheDocument();
  });
});
