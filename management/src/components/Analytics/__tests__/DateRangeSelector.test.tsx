/**
 * DateRangeSelector Component Tests
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import DateRangeSelector from '../DateRangeSelector';

describe('DateRangeSelector', () => {
  it('should render all three range options', () => {
    render(<DateRangeSelector value={30} onChange={jest.fn()} />);

    expect(screen.getByText('7d')).toBeInTheDocument();
    expect(screen.getByText('30d')).toBeInTheDocument();
    expect(screen.getByText('90d')).toBeInTheDocument();
  });

  it('should visually highlight the active option', () => {
    render(<DateRangeSelector value={30} onChange={jest.fn()} />);

    const activeButton = screen.getByText('30d');
    expect(activeButton).toHaveAttribute('aria-pressed', 'true');
    expect(activeButton.className).toContain('bg-indigo-600');
  });

  it('should not highlight inactive options', () => {
    render(<DateRangeSelector value={30} onChange={jest.fn()} />);

    const inactiveButton = screen.getByText('7d');
    expect(inactiveButton).toHaveAttribute('aria-pressed', 'false');
    expect(inactiveButton.className).not.toContain('bg-indigo-600');
  });

  it('should call onChange with 7 when 7d is clicked', () => {
    const handleChange = jest.fn();
    render(<DateRangeSelector value={30} onChange={handleChange} />);

    fireEvent.click(screen.getByText('7d'));
    expect(handleChange).toHaveBeenCalledWith(7);
  });

  it('should call onChange with 90 when 90d is clicked', () => {
    const handleChange = jest.fn();
    render(<DateRangeSelector value={30} onChange={handleChange} />);

    fireEvent.click(screen.getByText('90d'));
    expect(handleChange).toHaveBeenCalledWith(90);
  });

  it('should call onChange even when clicking the already-active option', () => {
    const handleChange = jest.fn();
    render(<DateRangeSelector value={30} onChange={handleChange} />);

    fireEvent.click(screen.getByText('30d'));
    expect(handleChange).toHaveBeenCalledWith(30);
  });
});
