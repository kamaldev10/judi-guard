import React from 'react';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ConfigPage from '../ConfigPage';
import {
  useWhitelistQuery,
  useAddWhitelistMutation,
  useDeleteWhitelistMutation,
  useBlacklistQuery,
  useAddBlacklistMutation,
  useDeleteBlacklistMutation,
} from '../../hooks/useConfigQueries.js';

// --- Mocks ---

vi.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({
    invalidateQueries: vi.fn(),
  }),
}));

vi.mock('../../hooks/useConfigQueries.js', () => ({
  useWhitelistQuery: vi.fn(),
  useAddWhitelistMutation: vi.fn(),
  useDeleteWhitelistMutation: vi.fn(),
  useBlacklistQuery: vi.fn(),
  useAddBlacklistMutation: vi.fn(),
  useDeleteBlacklistMutation: vi.fn(),
}));

vi.mock('@/shared/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, ...props }) => (
    <button onClick={onClick} disabled={disabled} {...props}>
      {children}
    </button>
  ),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

describe('ConfigPage & Managers Integration Test', () => {
  const user = userEvent.setup();

  const mockWhitelist = [
    {
      _id: 'wl-1',
      channelId: 'UC12345',
      channelName: 'GadgetIn',
      channelThumbnail: 'http://gadgetin.jpg/thumb.jpg',
      note: 'Teman',
    },
  ];

  const mockBlacklist = [
    {
      _id: 'bl-1',
      keyword: 'slot gacor',
    },
  ];

  const mockAddWhitelist = vi.fn();
  const mockDeleteWhitelist = vi.fn();
  const mockAddBlacklist = vi.fn();
  const mockDeleteBlacklist = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    useWhitelistQuery.mockReturnValue({
      data: mockWhitelist,
      isLoading: false,
    });

    useAddWhitelistMutation.mockReturnValue({
      mutateAsync: mockAddWhitelist,
      isPending: false,
    });

    useDeleteWhitelistMutation.mockReturnValue({
      mutateAsync: mockDeleteWhitelist,
      isPending: false,
    });

    useBlacklistQuery.mockReturnValue({
      data: mockBlacklist,
      isLoading: false,
    });

    useAddBlacklistMutation.mockReturnValue({
      mutateAsync: mockAddBlacklist,
      isPending: false,
    });

    useDeleteBlacklistMutation.mockReturnValue({
      mutateAsync: mockDeleteBlacklist,
      isPending: false,
    });
  });

  it('should render ConfigPage with whitelist and blacklist titles and managers correctly', () => {
    render(<ConfigPage />);

    expect(screen.getByText('Konfigurasi Moderasi')).toBeInTheDocument();
    expect(screen.getByText('Whitelist Channel/Akun')).toBeInTheDocument();
    expect(screen.getByText('Blacklist Kata Kunci')).toBeInTheDocument();
    expect(screen.getByText('GadgetIn')).toBeInTheDocument();
    expect(screen.getByText('slot gacor')).toBeInTheDocument();
  });

  it('should call add whitelist mutation when submitting channel id', async () => {
    render(<ConfigPage />);

    const input = screen.getByPlaceholderText('@gadgetin(username) atau Id Channel/Akun');
    const submitBtn = screen.getByRole('button', { name: /tambah/i });

    await user.type(input, '@testchannel');
    await user.click(submitBtn);

    expect(mockAddWhitelist).toHaveBeenCalledWith({
      channelId: '@testchannel',
      channelName: '',
      note: '',
    });
  });

  it('should call add blacklist mutation when pressing Enter in keyword input', async () => {
    mockAddBlacklist.mockResolvedValue({ added: ['casino'] });
    render(<ConfigPage />);

    const input = screen.getByPlaceholderText('Ketik kata lalu Enter...');

    await user.type(input, 'casino{enter}');

    expect(mockAddBlacklist).toHaveBeenCalledWith({ keyword: 'casino' });
  });

  it('should call delete whitelist mutation when delete button is clicked', async () => {
    render(<ConfigPage />);

    const deleteBtn = screen.getByTitle('Hapus dari whitelist');
    await user.click(deleteBtn);

    expect(mockDeleteWhitelist).toHaveBeenCalledWith('wl-1');
  });
});
