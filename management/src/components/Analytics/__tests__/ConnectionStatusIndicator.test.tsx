/**
 * ConnectionStatusIndicator Component Tests
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ConnectionStatusIndicator from '../ConnectionStatusIndicator';

describe('ConnectionStatusIndicator', () => {
  it('should show green dot and "Live" when connected', () => {
    const { container } = render(
      <ConnectionStatusIndicator status="connected" />
    );

    expect(screen.getByText('Live')).toBeInTheDocument();
    const dot = container.querySelector('.bg-green-500');
    expect(dot).toBeInTheDocument();
  });

  it('should show yellow pulsing dot and "Reconnecting" when reconnecting', () => {
    const { container } = render(
      <ConnectionStatusIndicator status="reconnecting" />
    );

    expect(screen.getByText('Reconnecting')).toBeInTheDocument();
    const dot = container.querySelector('.bg-yellow-500');
    expect(dot).toBeInTheDocument();
    // Check for the pulsing animation element
    const pulsingDot = container.querySelector('.animate-ping');
    expect(pulsingDot).toBeInTheDocument();
  });

  it('should show red dot and "Disconnected" when disconnected', () => {
    const { container } = render(
      <ConnectionStatusIndicator status="disconnected" />
    );

    expect(screen.getByText('Disconnected')).toBeInTheDocument();
    const dot = container.querySelector('.bg-red-500');
    expect(dot).toBeInTheDocument();
  });

  it('should not show reconnect button when disconnected but max retries not reached', () => {
    render(
      <ConnectionStatusIndicator
        status="disconnected"
        maxRetriesReached={false}
        onReconnect={jest.fn()}
      />
    );

    expect(screen.queryByText('Reconnect')).not.toBeInTheDocument();
  });

  it('should show reconnect button when disconnected and max retries reached', () => {
    render(
      <ConnectionStatusIndicator
        status="disconnected"
        maxRetriesReached={true}
        onReconnect={jest.fn()}
      />
    );

    expect(screen.getByText('Reconnect')).toBeInTheDocument();
  });

  it('should call onReconnect when reconnect button is clicked', () => {
    const handleReconnect = jest.fn();
    render(
      <ConnectionStatusIndicator
        status="disconnected"
        maxRetriesReached={true}
        onReconnect={handleReconnect}
      />
    );

    fireEvent.click(screen.getByText('Reconnect'));
    expect(handleReconnect).toHaveBeenCalledTimes(1);
  });

  it('should not show reconnect button when connected', () => {
    render(
      <ConnectionStatusIndicator
        status="connected"
        maxRetriesReached={true}
        onReconnect={jest.fn()}
      />
    );

    expect(screen.queryByText('Reconnect')).not.toBeInTheDocument();
  });
});
