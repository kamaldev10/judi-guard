import { render, screen, act, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Header from '../Header';
import { create } from 'zustand';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';

// --- Mocking Dependencies ---

// Mock lucide-react icons (including Lightbulb for the new nav item)
vi.mock('lucide-react', () => ({
  Menu: (props) => <svg data-testid="menu-icon" {...props} />,
  X: (props) => <svg data-testid="x-icon" {...props} />,
  Home: (props) => <svg data-testid="home-icon" {...props} />,
  Info: (props) => <svg data-testid="info-icon" {...props} />,
  BarChart3: (props) => <svg data-testid="barchart-icon" {...props} />,
  IdCard: (props) => <svg data-testid="idcard-icon" {...props} />,
  LayoutDashboard: (props) => <svg data-testid="layoutdashboard-icon" {...props} />,
  Lightbulb: (props) => <svg data-testid="lightbulb-icon" {...props} />,
  Sun: (props) => <svg data-testid="sun-icon" {...props} />,
  Moon: (props) => <svg data-testid="moon-icon" {...props} />,
}));

// Mock Image Logo
vi.mock('@images', () => ({
  Logo: 'logo-mock.png',
}));

// Mock SweetAlert2
vi.mock('sweetalert2', () => ({
  default: {
    fire: vi.fn().mockResolvedValue({ isConfirmed: true }),
  },
}));

// Mock react-toastify
vi.mock('react-toastify', () => ({
  toast: {
    error: vi.fn(),
  },
}));

// Mock next-themes
const mockSetTheme = vi.fn();
let mockResolvedTheme = 'light';
vi.mock('next-themes', () => ({
  useTheme: () => ({
    resolvedTheme: mockResolvedTheme,
    setTheme: mockSetTheme,
  }),
}));

// Mock useAuthStore (Zustand)
const mockLogout = vi.fn();
const createMockAuthStore = () =>
  create(() => ({
    isAuthenticated: false,
    currentUser: null,
    logout: mockLogout,
  }));
let mockAuthStore;
vi.mock('@/stores/authStore', () => ({
  useAuthStore: (selector) => mockAuthStore(selector),
}));

// Mock react-router-dom hooks (useNavigate)
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock Child Buttons
vi.mock('@/components/ui/LogoutButton', () => ({
  default: ({ onClick }) => (
    <button data-testid="logout-button" onClick={onClick}>
      Logout Mock
    </button>
  ),
}));
vi.mock('@/components/ui/LoginButton', () => ({
  default: ({ onClick }) => (
    <button data-testid="login-button" onClick={onClick}>
      Login Mock
    </button>
  ),
}));

// --- Test Suite ---

describe('Header Integration Testing', () => {
  const user = userEvent.setup();

  const renderHeader = (initialRoute = '/') => {
    mockAuthStore = createMockAuthStore();
    return render(
      <MemoryRouter initialEntries={[initialRoute]}>
        <Routes>
          <Route path="/*" element={<Header />} />
        </Routes>
      </MemoryRouter>,
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockResolvedTheme = 'light';
  });

  afterEach(() => {
    // Reset body overflow lock from Header's scroll-lock effect
    document.body.style.overflow = '';
  });

  // ── Brake 🚨: Core render & auth state ──

  it('should render logo and nav links when logged out', () => {
    renderHeader();
    expect(screen.getByAltText(/logo judi guard/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /beranda/i })).toBeInTheDocument();

    expect(screen.getByTestId('login-button')).toBeInTheDocument();
    expect(screen.queryByTestId('logout-button')).not.toBeInTheDocument();
    expect(screen.queryByText(/testuser/i)).not.toBeInTheDocument();
  });

  it('should render logout button and username when logged in', () => {
    const mockUser = { username: 'testuser' };
    renderHeader();
    act(() => {
      mockAuthStore.setState({ isAuthenticated: true, currentUser: mockUser });
    });

    expect(screen.getByTestId('logout-button')).toBeInTheDocument();
    expect(screen.queryByTestId('login-button')).not.toBeInTheDocument();
    expect(
      screen.getAllByText((_, el) => el?.textContent === `Halo, ${mockUser.username}`).length,
    ).toBeGreaterThan(0);
  });

  it('should navigate to /login when Login button is clicked', async () => {
    renderHeader();
    const loginButton = screen.getByTestId('login-button');
    await user.click(loginButton);

    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  // ── Brake 🚨: Logout flow ──

  it('should perform logout, navigate, and show toast on confirmation', async () => {
    renderHeader();
    act(() => {
      mockAuthStore.setState({
        isAuthenticated: true,
        currentUser: { username: 'testuser' },
      });
    });
    Swal.fire.mockResolvedValueOnce({ isConfirmed: true });

    const logoutButton = screen.getByTestId('logout-button');
    await user.click(logoutButton);

    expect(Swal.fire).toHaveBeenCalledTimes(1);
    await act(async () => {});

    expect(mockLogout).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith('/login');
    expect(toast.error).toHaveBeenCalledWith('Anda berhasil logout');
  });

  it('should NOT logout if Swal confirmation is cancelled', async () => {
    renderHeader();
    act(() => {
      mockAuthStore.setState({
        isAuthenticated: true,
        currentUser: { username: 'testuser' },
      });
    });
    Swal.fire.mockResolvedValueOnce({ isConfirmed: false });

    const logoutButton = screen.getByTestId('logout-button');
    await user.click(logoutButton);

    expect(Swal.fire).toHaveBeenCalledTimes(1);
    await act(async () => {});

    expect(mockLogout).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(toast.error).not.toHaveBeenCalled();
  });

  // ── Engine ⚡: Mobile menu open/close ──

  it('should toggle mobile menu on button click', async () => {
    renderHeader();
    const toggleBtn = screen.getByRole('button', { name: /buka menu utama/i });

    // Menu closed initially
    expect(
      screen.queryByRole('navigation', { name: /menu navigasi mobile/i }),
    ).not.toBeInTheDocument();

    // Open
    await user.click(toggleBtn);
    const mobileMenu = screen.getByRole('navigation', { name: /menu navigasi mobile/i });
    expect(mobileMenu).toBeInTheDocument();
    expect(within(mobileMenu).getByRole('link', { name: /tentang kami/i })).toBeInTheDocument();

    // Close
    await user.click(screen.getByRole('button', { name: /tutup menu/i }));
    expect(
      screen.queryByRole('navigation', { name: /menu navigasi mobile/i }),
    ).not.toBeInTheDocument();
  });

  it('should close mobile menu when a nav link inside it is clicked', async () => {
    renderHeader();
    const toggleBtn = screen.getByRole('button', { name: /buka menu utama/i });
    await user.click(toggleBtn);

    const mobileMenu = screen.getByRole('navigation', { name: /menu navigasi mobile/i });
    const link = within(mobileMenu).getByRole('link', { name: /tentang kami/i });
    await user.click(link);

    expect(
      screen.queryByRole('navigation', { name: /menu navigasi mobile/i }),
    ).not.toBeInTheDocument();
  });

  // ── Engine ⚡: Escape key closes mobile menu ──

  it('should close mobile menu on Escape key press', async () => {
    renderHeader();
    const toggleBtn = screen.getByRole('button', { name: /buka menu utama/i });
    await user.click(toggleBtn);

    expect(screen.getByRole('navigation', { name: /menu navigasi mobile/i })).toBeInTheDocument();

    await user.keyboard('{Escape}');

    expect(
      screen.queryByRole('navigation', { name: /menu navigasi mobile/i }),
    ).not.toBeInTheDocument();
  });

  // ── Engine ⚡: Body scroll lock ──

  it('should lock body overflow when mobile menu is open', async () => {
    renderHeader();
    expect(document.body.style.overflow).toBe('');

    const toggleBtn = screen.getByRole('button', { name: /buka menu utama/i });
    await user.click(toggleBtn);
    expect(document.body.style.overflow).toBe('hidden');

    await user.click(screen.getByRole('button', { name: /tutup menu/i }));
    expect(document.body.style.overflow).toBe('');
  });

  // ── Aero 🏁: Nav icon rendering in mobile menu ──

  it('should render the correct icon for each nav item in mobile menu', async () => {
    renderHeader();
    const toggleBtn = screen.getByRole('button', { name: /buka menu utama/i });
    await user.click(toggleBtn);

    const mobileMenu = screen.getByRole('navigation', { name: /menu navigasi mobile/i });
    const dashboardLink = within(mobileMenu).getByRole('link', { name: /dashboard/i });
    expect(within(dashboardLink).getByTestId('layoutdashboard-icon')).toBeInTheDocument();
  });

  // ── Aero 🏁: Active page indicator (aria-current) ──

  it('should set aria-current="page" on the active nav link', () => {
    renderHeader('/about-us');
    const aboutLink = screen.getByRole('link', { name: /tentang kami/i });
    expect(aboutLink).toHaveAttribute('aria-current', 'page');

    const homeLink = screen.getByRole('link', { name: /beranda/i });
    expect(homeLink).not.toHaveAttribute('aria-current');
  });

  // ── Aero 🏁: Skip-to-content link ──

  it('should render a skip-to-content link', () => {
    renderHeader();
    const skipLink = screen.getByText(/skip to content/i);
    expect(skipLink).toBeInTheDocument();
    expect(skipLink).toHaveAttribute('href', '/#connect-section');
  });

  // ── Aero 🏁: Theme toggle ──

  it("should call setTheme('dark') when toggled from light", async () => {
    mockResolvedTheme = 'light';
    renderHeader();
    const themeToggles = screen.getAllByTestId('theme-toggle-button');
    expect(themeToggles.length).toBeGreaterThan(0);

    await user.click(themeToggles[0]);
    expect(mockSetTheme).toHaveBeenCalledWith('dark');
  });

  it("should call setTheme('light') when toggled from dark", async () => {
    mockResolvedTheme = 'dark';
    renderHeader();
    const themeToggles = screen.getAllByTestId('theme-toggle-button');

    await user.click(themeToggles[0]);
    expect(mockSetTheme).toHaveBeenCalledWith('light');
  });

  // ── Aero 🏁: Mobile menu shows login when unauthenticated ──

  it('should show login button in mobile menu when logged out', async () => {
    renderHeader();
    const toggleBtn = screen.getByRole('button', { name: /buka menu utama/i });
    await user.click(toggleBtn);

    const mobileMenu = screen.getByRole('navigation', { name: /menu navigasi mobile/i });
    expect(within(mobileMenu).getByTestId('login-button')).toBeInTheDocument();
  });

  // ── Aero 🏁: Mobile menu shows user bar with logout when authenticated ──

  it('should show user greeting and logout button in mobile menu when logged in', async () => {
    renderHeader();
    act(() => {
      mockAuthStore.setState({
        isAuthenticated: true,
        currentUser: { username: 'mobiletester' },
      });
    });

    const toggleBtn = screen.getByRole('button', { name: /buka menu utama/i });
    await user.click(toggleBtn);

    const mobileMenu = screen.getByRole('navigation', { name: /menu navigasi mobile/i });
    expect(within(mobileMenu).getByText(/halo, mobiletester/i)).toBeInTheDocument();
    expect(within(mobileMenu).getByTestId('logout-button')).toBeInTheDocument();
    expect(within(mobileMenu).queryByTestId('login-button')).not.toBeInTheDocument();
  });
});
