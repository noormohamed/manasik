/**
 * ReviewForm Component Tests
 * 
 * Tests for the ReviewForm component which includes:
 * - Basic review form fields (name, email, review text)
 * - Friction questions section (optional)
 * - Form submission with loading state
 * - Error handling and success messages
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import ReviewForm from './ReviewForm';

describe('ReviewForm Component', () => {
  it('renders the review form with title', () => {
    render(<ReviewForm />);
    expect(screen.getByText('Add Your Review')).toBeInTheDocument();
  });

  it('renders all basic form fields', () => {
    render(<ReviewForm />);
    expect(screen.getByPlaceholderText('Name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Write a review')).toBeInTheDocument();
  });

  it('renders friction questions section with title', () => {
    render(<ReviewForm />);
    expect(screen.getByText('Hotel Experience (Optional)')).toBeInTheDocument();
  });

  it('renders all three friction questions', () => {
    render(<ReviewForm />);
    expect(screen.getByText('Did you experience lift/elevator delays?')).toBeInTheDocument();
    expect(screen.getByText('Was the hotel crowded at peak times?')).toBeInTheDocument();
    expect(screen.getByText('How smooth was the check-in experience?')).toBeInTheDocument();
  });

  it('renders friction response options for lift delays', () => {
    render(<ReviewForm />);
    const liftDelaysRadios = screen.getAllByRole('radio', { name: /Yes|No|Not Applicable/ });
    expect(liftDelaysRadios.length).toBeGreaterThanOrEqual(3);
  });

  it('renders friction response options for check-in experience', () => {
    render(<ReviewForm />);
    expect(screen.getByLabelText('Smooth')).toBeInTheDocument();
    expect(screen.getByLabelText('Average')).toBeInTheDocument();
    expect(screen.getByLabelText('Difficult')).toBeInTheDocument();
  });

  it('renders submit button', () => {
    render(<ReviewForm />);
    expect(screen.getByText('Submit Review')).toBeInTheDocument();
  });

  it('renders star rating display', () => {
    render(<ReviewForm />);
    const svgs = screen.getAllByRole('img', { hidden: true });
    // Should have multiple star SVGs
    expect(svgs.length).toBeGreaterThan(0);
  });

  it('has all form inputs as required fields', () => {
    render(<ReviewForm />);
    const nameInput = screen.getByPlaceholderText('Name') as HTMLInputElement;
    const emailInput = screen.getByPlaceholderText('Email') as HTMLInputElement;
    const reviewInput = screen.getByPlaceholderText('Write a review') as HTMLTextAreaElement;
    
    expect(nameInput.hasAttribute('required')).toBe(true);
    expect(emailInput.hasAttribute('required')).toBe(true);
    expect(reviewInput.hasAttribute('required')).toBe(true);
  });

  it('renders friction questions as optional (no required attribute)', () => {
    render(<ReviewForm />);
    const radios = screen.getAllByRole('radio');
    // Friction questions should not have required attribute
    radios.forEach(radio => {
      expect(radio.hasAttribute('required')).toBe(false);
    });
  });

  it('renders form with proper structure', () => {
    const { container } = render(<ReviewForm />);
    const form = container.querySelector('form');
    expect(form).toBeInTheDocument();
  });

  it('displays friction section with distinct styling', () => {
    const { container } = render(<ReviewForm />);
    const frictionCard = container.querySelector('.card');
    expect(frictionCard).toBeInTheDocument();
    expect(frictionCard).toHaveStyle({ backgroundColor: '#f9fafb' });
  });
});
