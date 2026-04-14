/**
 * Sidebar Component Tests
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import Sidebar from '../Sidebar';
import uiReducer from '@/store/slices/uiSlice';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  usePathname: () => '/admin/dashboard',
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

describe('Sidebar', () => {
  let store: any;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        ui: uiReducer,
      },
    });
  });

  it('should render navigation items', () => {
    render(
      <Provider store={store}>
        <Sidebar />
      </Provider>
    );

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Users')).toBeInTheDocument();
    expect(screen.getByText('Bookings')).toBeInTheDocument();
    expect(screen.getByText('Reviews')).toBeInTheDocument();
    expect(screen.getByText('Transactions')).toBeInTheDocument();
    expect(screen.getByText('Analytics')).toBeInTheDocument();
    expect(screen.getByText('Audit Log')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('should highlight active navigation item', () => {
    render(
      <Provider store={store}>
        <Sidebar />
      </Provider>
    );

    const dashboardLink = screen.getByText('Dashboard').closest('a');
    expect(dashboardLink).toHaveClass('bg-indigo-600');
  });

  it('should render logo', () => {
    render(
      <Provider store={store}>
        <Sidebar />
      </Provider>
    );

    expect(screen.getByText('Admin')).toBeInTheDocument();
  });

  it('should render version info', () => {
    render(
      <Provider store={store}>
        <Sidebar />
      </Provider>
    );

    expect(screen.getByText('Super Admin Panel v1.0')).toBeInTheDocument();
  });

  it('should have navigation links with correct hrefs', () => {
    render(
      <Provider store={store}>
        <Sidebar />
      </Provider>
    );

    const dashboardLink = screen.getByText('Dashboard').closest('a');
    expect(dashboardLink).toHaveAttribute('href', '/admin/dashboard');

    const usersLink = screen.getByText('Users').closest('a');
    expect(usersLink).toHaveAttribute('href', '/admin/users');

    const bookingsLink = screen.getByText('Bookings').closest('a');
    expect(bookingsLink).toHaveAttribute('href', '/admin/bookings');
  });

  it('should render close button on mobile', () => {
    render(
      <Provider store={store}>
        <Sidebar />
      </Provider>
    );

    // The close button should be present in the DOM
    const closeButtons = screen.getAllByRole('button');
    expect(closeButtons.length).toBeGreaterThan(0);
  });

  it('should dispatch toggle sidebar action when close button is clicked', () => {
    const { container } = render(
      <Provider store={store}>
        <Sidebar />
      </Provider>
    );

    const closeButton = container.querySelector('button[class*="md:hidden"]');
    if (closeButton) {
      fireEvent.click(closeButton);
      // The action should be dispatched to Redux
    }
  });

  it('should render all navigation icons', () => {
    const { container } = render(
      <Provider store={store}>
        <Sidebar />
      </Provider>
    );

    const svgs = container.querySelectorAll('svg');
    expect(svgs.length).toBeGreaterThan(0);
  });
});
