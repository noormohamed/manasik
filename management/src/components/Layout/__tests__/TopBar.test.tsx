/**
 * TopBar Component Tests
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import TopBar from '../TopBar';
import authReducer from '@/store/slices/authSlice';
import uiReducer from '@/store/slices/uiSlice';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  usePathname: () => '/admin/dashboard',
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Mock authService
jest.mock('@/services/authService', () => ({
  authService: {
    logout: jest.fn().mockResolvedValue({}),
  },
}));

describe('TopBar', () => {
  let store: any;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        auth: authReducer,
        ui: uiReducer,
      },
      preloadedState: {
        auth: {
          token: 'test_token',
          user: {
            id: 1,
            email: 'admin@platform.com',
            role: 'SUPER_ADMIN',
          },
          isAuthenticated: true,
          isLoading: false,
          error: null,
          requiresMFA: false,
          tempToken: null,
        },
        ui: {
          sidebarOpen: false,
          theme: 'light',
          notifications: [],
          modals: {},
          loading: false,
        },
      },
    });
  });

  it('should render breadcrumbs', () => {
    render(
      <Provider store={store}>
        <TopBar />
      </Provider>
    );

    expect(screen.getByText('Admin')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('should display current time', async () => {
    render(
      <Provider store={store}>
        <TopBar />
      </Provider>
    );

    await waitFor(() => {
      const timeElements = screen.queryAllByText(/\d{1,2}:\d{2}/);
      expect(timeElements.length).toBeGreaterThan(0);
    });
  });

  it('should display user email in menu', () => {
    render(
      <Provider store={store}>
        <TopBar />
      </Provider>
    );

    expect(screen.getByText('admin@platform.com')).toBeInTheDocument();
  });

  it('should display Super Admin role', () => {
    render(
      <Provider store={store}>
        <TopBar />
      </Provider>
    );

    const userMenuButton = screen.getByText('admin@platform.com').closest('button');
    fireEvent.click(userMenuButton!);

    expect(screen.getByText(/Super Admin/)).toBeInTheDocument();
  });

  it('should open user menu when clicked', () => {
    render(
      <Provider store={store}>
        <TopBar />
      </Provider>
    );

    const userMenuButton = screen.getByText('admin@platform.com').closest('button');
    fireEvent.click(userMenuButton!);

    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Help & Support')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });

  it('should close user menu when clicking outside', async () => {
    const { container } = render(
      <Provider store={store}>
        <TopBar />
      </Provider>
    );

    const userMenuButton = screen.getByText('admin@platform.com').closest('button');
    fireEvent.click(userMenuButton!);

    expect(screen.getByText('Settings')).toBeInTheDocument();

    // Click outside
    fireEvent.mouseDown(container);

    await waitFor(() => {
      expect(screen.queryByText('Settings')).not.toBeInTheDocument();
    });
  });

  it('should have notification button', () => {
    const { container } = render(
      <Provider store={store}>
        <TopBar />
      </Provider>
    );

    const notificationButtons = container.querySelectorAll('button');
    expect(notificationButtons.length).toBeGreaterThan(0);
  });

  it('should have search input', () => {
    render(
      <Provider store={store}>
        <TopBar />
      </Provider>
    );

    const searchInput = screen.getByPlaceholderText('Search (Ctrl+K)');
    expect(searchInput).toBeInTheDocument();
  });

  it('should render settings link', () => {
    render(
      <Provider store={store}>
        <TopBar />
      </Provider>
    );

    const userMenuButton = screen.getByText('admin@platform.com').closest('button');
    fireEvent.click(userMenuButton!);

    const settingsLink = screen.getByText('Settings').closest('a');
    expect(settingsLink).toHaveAttribute('href', '/admin/settings');
  });

  it('should render help link', () => {
    render(
      <Provider store={store}>
        <TopBar />
      </Provider>
    );

    const userMenuButton = screen.getByText('admin@platform.com').closest('button');
    fireEvent.click(userMenuButton!);

    const helpLink = screen.getByText('Help & Support').closest('a');
    expect(helpLink).toHaveAttribute('href', '/admin/help');
  });

  it('should have logout button', () => {
    render(
      <Provider store={store}>
        <TopBar />
      </Provider>
    );

    const userMenuButton = screen.getByText('admin@platform.com').closest('button');
    fireEvent.click(userMenuButton!);

    expect(screen.getByText('Logout')).toBeInTheDocument();
  });

  it('should display user avatar with first letter', () => {
    render(
      <Provider store={store}>
        <TopBar />
      </Provider>
    );

    expect(screen.getByText('A')).toBeInTheDocument();
  });
});
