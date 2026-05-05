/**
 * KPICard Component Tests
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import KPICard from '../KPICard';

describe('KPICard', () => {
  it('should render label and value', () => {
    render(<KPICard label="Total Bookings" value={150} />);

    expect(screen.getByText('Total Bookings')).toBeInTheDocument();
    expect(screen.getByText('150')).toBeInTheDocument();
  });

  it('should format GBP currency values', () => {
    render(<KPICard label="Total Revenue" value={1234.5} isCurrency />);

    expect(screen.getByText('Total Revenue')).toBeInTheDocument();
    // Intl.NumberFormat('en-GB') produces £1,234.50
    expect(screen.getByText('£1,234.50')).toBeInTheDocument();
  });

  it('should display zero GBP correctly', () => {
    render(<KPICard label="Revenue" value={0} isCurrency />);

    expect(screen.getByText('£0.00')).toBeInTheDocument();
  });

  it('should display suffix for non-currency values', () => {
    render(<KPICard label="Conversion Rate" value={75.3} suffix="%" />);

    expect(screen.getByText('75.3%')).toBeInTheDocument();
  });

  it('should show green ↑ for positive trend', () => {
    render(<KPICard label="Revenue" value={1000} isCurrency trend={12.5} />);

    expect(screen.getByText('↑')).toBeInTheDocument();
    expect(screen.getByText('12.5%')).toBeInTheDocument();
    expect(screen.getByText('vs prev. period')).toBeInTheDocument();
  });

  it('should show red ↓ for negative trend', () => {
    render(<KPICard label="Revenue" value={800} isCurrency trend={-5.2} />);

    expect(screen.getByText('↓')).toBeInTheDocument();
    expect(screen.getByText('5.2%')).toBeInTheDocument();
  });

  it('should show 0.0% for zero trend', () => {
    render(<KPICard label="Revenue" value={1000} isCurrency trend={0} />);

    expect(screen.getByText('0.0%')).toBeInTheDocument();
  });

  it('should not show trend when undefined', () => {
    render(<KPICard label="Total Users" value={42} />);

    expect(screen.queryByText('vs prev. period')).not.toBeInTheDocument();
  });

  it('should render loading skeleton state', () => {
    const { container } = render(<KPICard label="Revenue" value={0} loading />);

    // Should have animate-pulse class for skeleton
    const skeleton = container.querySelector('.animate-pulse');
    expect(skeleton).toBeInTheDocument();

    // Should NOT render the actual value
    expect(screen.queryByText('Revenue')).not.toBeInTheDocument();
  });

  it('should format large integer values with locale separators', () => {
    render(<KPICard label="Total Users" value={10000} />);

    expect(screen.getByText('10,000')).toBeInTheDocument();
  });
});
