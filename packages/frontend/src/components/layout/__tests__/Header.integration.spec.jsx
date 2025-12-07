import React from "react";
import { render, screen, act, within } from "@testing-library/react"; // 1. Tambahkan 'within'
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import Header from "../Header";
import { create } from "zustand";
import Swal from "sweetalert2";
import { toast } from "react-toastify";

// --- Mocking Dependencies ---

// Mock Ikon lucide-react
vi.mock("lucide-react", () => ({
  Menu: () => <svg data-testid="menu-icon" />,
  X: () => <svg data-testid="x-icon" />,
  Home: () => <svg data-testid="home-icon" />,
  Info: () => <svg data-testid="info-icon" />,
  BarChart3: () => <svg data-testid="barchart-icon" />,
  UserRound: () => <svg data-testid="userround-icon" />,
  IdCard: () => <svg data-testid="idcard-icon" />,
}));

// Mock Image Logo
vi.mock("@images", () => ({
  Logo: "logo-mock.png",
}));

// Mock SweetAlert2
vi.mock("sweetalert2", () => ({
  default: {
    fire: vi.fn().mockResolvedValue({ isConfirmed: true }),
  },
}));

// Mock react-toastify
vi.mock("react-toastify", () => ({
  toast: {
    error: vi.fn(),
  },
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
vi.mock("@/stores/authStore", () => ({
  useAuthStore: (selector) => mockAuthStore(selector),
}));

// Mock react-router-dom hooks (useNavigate)
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock Child Buttons
vi.mock("@/components/ui/LogoutButton", () => ({
  default: ({ onClick }) => (
    <button data-testid="logout-button" onClick={onClick}>
      Logout Mock
    </button>
  ),
}));
vi.mock("@/components/ui/LoginButton", () => ({
  default: ({ onClick }) => (
    <button data-testid="login-button" onClick={onClick}>
      Login Mock
    </button>
  ),
}));

// --- Test Suite ---

describe("Header Integration Testing", () => {
  const user = userEvent.setup();

  // Helper render
  const renderHeader = (initialRoute = "/") => {
    // Pastikan store di-reset SEBELUM render
    mockAuthStore = createMockAuthStore();
    return render(
      <MemoryRouter initialEntries={[initialRoute]}>
        <Routes>
          <Route path="/*" element={<Header />} />
        </Routes>
      </MemoryRouter>
    );
  };

  // Reset mocks before each test
  beforeEach(() => {
    // Cukup clear mock functions, store di-reset di renderHeader
    vi.clearAllMocks();
  });

  // Tes 1: Render Logged Out
  it("should render correctly when user is logged out", () => {
    renderHeader();
    // ... (cek logo, link nav desktop - tidak berubah)
    expect(screen.getByAltText(/logo judi guard/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /beranda/i })).toBeInTheDocument();

    // Verifikasi tombol Login ADA
    expect(screen.getByTestId("login-button")).toBeInTheDocument();
    // Verifikasi tombol Logout TIDAK ADA
    expect(screen.queryByTestId("logout-button")).not.toBeInTheDocument();
    // Verifikasi username TIDAK ADA
    // 👇 Perbaiki: Cari berdasarkan data-cy atau text, bukan testid
    expect(screen.queryByText(/testuser/i)).not.toBeInTheDocument();
  });

  // Tes 2: Render Logged In
  it("should render correctly when user is logged in", () => {
    const mockUser = { username: "testuser" };
    renderHeader(); // Render dulu
    // Baru set state setelah render dan store dibuat
    act(() => {
      mockAuthStore.setState({ isAuthenticated: true, currentUser: mockUser });
    });

    // Verifikasi tombol Logout ADA
    expect(screen.getByTestId("logout-button")).toBeInTheDocument();
    // Verifikasi tombol Login TIDAK ADA
    expect(screen.queryByTestId("login-button")).not.toBeInTheDocument();
    // Verifikasi username ADA
    expect(screen.getByText(mockUser.username)).toBeInTheDocument();
  });

  // Tes 3: Klik Tombol Login
  it("should navigate to /login when Login button is clicked", async () => {
    renderHeader();
    const loginButton = screen.getByTestId("login-button");
    await user.click(loginButton);

    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });

  // Tes 4: Flow Logout (Berhasil)
  it("should perform logout, navigate, and show toast on logout confirmation", async () => {
    renderHeader(); // Render dulu
    act(() => {
      mockAuthStore.setState({
        isAuthenticated: true,
        currentUser: { username: "testuser" },
      });
    });
    // Set mock Swal SEBELUM klik
    Swal.fire.mockResolvedValueOnce({ isConfirmed: true });

    const logoutButton = screen.getByTestId("logout-button");
    await user.click(logoutButton);

    expect(Swal.fire).toHaveBeenCalledTimes(1);
    // Tunggu promise Swal selesai (meskipun kita mock resolve)
    await act(async () => {}); // Flush promises

    expect(mockLogout).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith("/login");
    expect(toast.error).toHaveBeenCalledWith("Anda berhasil logout");
  });

  // Tes 5: Flow Logout (Batal)
  it("should NOT logout if Swal confirmation is cancelled", async () => {
    renderHeader(); // Render dulu
    act(() => {
      mockAuthStore.setState({
        isAuthenticated: true,
        currentUser: { username: "testuser" },
      });
    });
    // Set mock Swal SEBELUM klik
    Swal.fire.mockResolvedValueOnce({ isConfirmed: false });

    const logoutButton = screen.getByTestId("logout-button");
    await user.click(logoutButton);

    expect(Swal.fire).toHaveBeenCalledTimes(1);
    await act(async () => {}); // Flush promises

    expect(mockLogout).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(toast.error).not.toHaveBeenCalled();
  });

  // Tes 6: Mobile Menu Toggle
  it("should toggle mobile menu visibility on button click", async () => {
    renderHeader();
    const mobileMenuButton = screen.getByRole("button", {
      name: /buka menu utama/i,
    });

    // Awalnya menu mobile tidak ada
    expect(
      screen.queryByTestId("mobile-menu-container")
    ).not.toBeInTheDocument();
    expect(screen.getByTestId("menu-icon")).toBeInTheDocument(); // Ikon buka

    // Klik untuk membuka
    await user.click(mobileMenuButton);
    // Sekarang container menu mobile ADA
    const mobileMenu = screen.getByTestId("mobile-menu-container");
    expect(mobileMenu).toBeInTheDocument();
    // Cek salah satu link di dalamnya ada
    expect(
      within(mobileMenu).getByRole("link", { name: /tentang kami/i })
    ).toBeInTheDocument();
    // Cek ikon X muncul
    expect(screen.getByTestId("x-icon")).toBeInTheDocument();
    expect(screen.queryByTestId("menu-icon")).not.toBeInTheDocument(); // Ikon buka hilang

    // Klik untuk menutup
    await user.click(mobileMenuButton);
    // Container menu mobile HILANG
    expect(
      screen.queryByTestId("mobile-menu-container")
    ).not.toBeInTheDocument();
    // Cek ikon Menu muncul lagi
    expect(screen.getByTestId("menu-icon")).toBeInTheDocument();
    expect(screen.queryByTestId("x-icon")).not.toBeInTheDocument(); // Ikon X hilang
  });

  // Tes 7: Mobile Menu Closes on Link Click
  it("should close mobile menu when a navigation link inside it is clicked", async () => {
    renderHeader();
    const mobileMenuButton = screen.getByRole("button", {
      name: /buka menu utama/i,
    });

    // Buka menu
    await user.click(mobileMenuButton);
    const mobileMenu = screen.getByTestId("mobile-menu-container");
    const mobileAboutLink = within(mobileMenu).getByRole("link", {
      name: /tentang kami/i,
    });
    expect(mobileAboutLink).toBeInTheDocument(); // Pastikan ada

    // Klik link di dalam menu
    await user.click(mobileAboutLink);

    // Menu mobile seharusnya tertutup
    expect(
      screen.queryByTestId("mobile-menu-container")
    ).not.toBeInTheDocument();
  });
});
