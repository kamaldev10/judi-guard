import React from 'react';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ProfilePage from '../ProfilePage';
import {
  useUserProfileQuery,
  useConnectYoutubeMutation,
  useDisconnectYoutubeMutation,
} from '../../hooks/useProfileQueries.js';
import { MemoryRouter } from 'react-router-dom';

// --- Mocks ---

vi.mock('../../hooks/useProfileQueries.js', () => ({
  useUserProfileQuery: vi.fn(),
  useConnectYoutubeMutation: vi.fn(),
  useDisconnectYoutubeMutation: vi.fn(),
  useDeleteAccountMutation: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('ProfilePage Integration Tests', () => {
  const mockUser = {
    username: 'Rizky',
    email: 'rizky@judiguard.com',
    createdAt: '2026-01-01T00:00:00.000Z',
    isVerified: true,
    youtubeChannelId: 'UCyoutube123',
    youtubeChannelName: 'Rizky Channel',
    youtubeChannelThumbnail: 'https://thumbnail.jpg',
  };

  const mockConnect = vi.fn();
  const mockDisconnect = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    useUserProfileQuery.mockReturnValue({
      data: mockUser,
      isLoading: false,
      error: null,
    });

    useConnectYoutubeMutation.mockReturnValue({
      mutateAsync: mockConnect,
      isPending: false,
    });

    useDisconnectYoutubeMutation.mockReturnValue({
      mutateAsync: mockDisconnect,
      isPending: false,
    });
  });

  it('should render user profile information and connections correctly', () => {
    render(
      <MemoryRouter>
        <ProfilePage />
      </MemoryRouter>,
    );

    expect(screen.getByText('Rizky')).toBeInTheDocument();
    expect(screen.getByText('rizky@judiguard.com')).toBeInTheDocument();
    expect(screen.getByText('Akun Terhubung')).toBeInTheDocument();
    expect(screen.getByText('Rizky Channel')).toBeInTheDocument();
  });

  it('should call connect YouTube handler when clicked and navigate to oauth redirect url', async () => {
    mockUser.youtubeChannelId = null; // simulate disconnected state
    useUserProfileQuery.mockReturnValue({
      data: mockUser,
      isLoading: false,
      error: null,
    });

    // Mock window.location.href
    const originalLocation = window.location;
    delete window.location;
    window.location = { href: '' };

    mockConnect.mockResolvedValue({ redirectUrl: 'https://google-oauth-redirect-url' });

    render(
      <MemoryRouter>
        <ProfilePage />
      </MemoryRouter>,
    );

    const connectBtn = screen.getByRole('button', { name: /hubungkan akun youtube/i });
    await userEvent.click(connectBtn);

    expect(mockConnect).toHaveBeenCalled();
    expect(window.location.href).toBe('https://google-oauth-redirect-url');

    // Restore window.location
    window.location = originalLocation;
  });
});
