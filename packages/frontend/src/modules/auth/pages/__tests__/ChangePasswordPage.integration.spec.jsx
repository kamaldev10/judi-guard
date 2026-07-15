import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { HeadProvider } from 'react-head';
import ChangePasswordPage from '../ChangePasswordPage';

// --- Mocking Dependencies ---

vi.mock('react-head', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    Title: ({ children }) => {
      document.title = children;
      return null;
    },
  };
});

vi.mock('lucide-react', () => ({
  ArrowLeft: (props) => <svg data-testid="arrow-left-icon" {...props} />,
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../../components/ChangePasswordForm.jsx', () => ({
  default: () => <div data-testid="mock-change-password-form">Mock Form</div>,
}));

const mockUseAuthUiStore = vi.fn();
vi.mock('@/modules/auth', () => ({
  useAuthUiStore: (selector) => mockUseAuthUiStore(selector),
}));

describe('Change Password Page Integration Testing', () => {
  const user = userEvent.setup();
  const mockUser = { username: 'testuser' };
  const mockGuest = { username: 'Pengguna' };

  beforeEach(() => {
    vi.clearAllMocks();
    document.title = '';

    mockUseAuthUiStore.mockImplementation((selector) => {
      const state = {
        currentUser: mockUser,
      };

      if (typeof selector === 'function') {
        return selector(state);
      }
      return state;
    });
  });

  it('should set the document title correctly', () => {
    renderPage();
    expect(document.title).toBe('Ganti Password | Judi Guard');
  });

  const renderPage = (route = '/change-password') => {
    return render(
      <HeadProvider>
        <MemoryRouter initialEntries={[route]}>
          <ChangePasswordPage />
        </MemoryRouter>
      </HeadProvider>,
    );
  };

  it('should render header, welcome message, and the form when user is logged in', () => {
    renderPage();

    expect(
      screen.getByRole('heading', { level: 1, name: /ganti kata sandi/i }),
    ).toBeInTheDocument();

    expect(screen.getByText(/mengamankan akun untuk/i)).toBeInTheDocument();
    expect(screen.getByText(mockUser.username)).toBeInTheDocument();

    expect(screen.getByRole('button', { name: /kembali ke profil/i })).toBeInTheDocument();
    expect(screen.getByTestId('arrow-left-icon')).toBeInTheDocument();

    expect(screen.getByTestId('mock-change-password-form')).toBeInTheDocument();
  });

  it('should render with default username if currentUser is null', () => {
    mockUseAuthUiStore.mockImplementation((selector) => {
      const state = { currentUser: null };
      if (typeof selector === 'function') {
        return selector(state);
      }
      return state;
    });

    renderPage();

    expect(screen.getByText(mockGuest.username)).toBeInTheDocument();
    expect(screen.queryByText(mockUser.username)).not.toBeInTheDocument();
  });

  it("should call navigate to '/profile' when back button is clicked", async () => {
    renderPage();

    const backButton = screen.getByRole('button', {
      name: /kembali ke profil/i,
    });

    await user.click(backButton);

    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard/profile');
  });
});
