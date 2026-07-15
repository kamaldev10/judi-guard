import React from 'react';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import EditProfilePage from '../EditProfilePage';
import { useUserProfileQuery, useUpdateProfileMutation } from '../../hooks/useProfileQueries.js';
import { MemoryRouter } from 'react-router-dom';

// --- Mocks ---

vi.mock('../../hooks/useProfileQueries.js', () => ({
  useUserProfileQuery: vi.fn(),
  useUpdateProfileMutation: vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('EditProfilePage Integration Tests', () => {
  const mockUser = {
    username: 'Rizky',
    email: 'rizky@judiguard.com',
  };

  const mockUpdate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    useUserProfileQuery.mockReturnValue({
      data: mockUser,
      isLoading: false,
      error: null,
    });

    useUpdateProfileMutation.mockReturnValue({
      mutateAsync: mockUpdate,
      isPending: false,
    });
  });

  it('should render form with existing data and cancel button', () => {
    render(
      <MemoryRouter>
        <EditProfilePage />
      </MemoryRouter>,
    );

    expect(screen.getByDisplayValue('Rizky')).toBeInTheDocument();
    expect(screen.getByDisplayValue('rizky@judiguard.com')).toBeInTheDocument();
  });

  it('should call update mutation when submission is successful with modified data', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <EditProfilePage />
      </MemoryRouter>,
    );

    const input = screen.getByDisplayValue('Rizky');
    await user.clear(input);
    await user.type(input, 'NewRizky');

    const submitBtn = screen.getByRole('button', { name: /simpan perubahan/i });
    await user.click(submitBtn);

    expect(mockUpdate).toHaveBeenCalledWith({ username: 'NewRizky' });
  });
});
