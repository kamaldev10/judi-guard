import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { HeadProvider, Title } from "react-head";
import ChangePasswordPage from "../ChangePasswordPage";

// --- 3. Mocking Dependencies ---

// Mock 'react-head' (Title component)
vi.mock("react-head", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    Title: ({ children }) => {
      document.title = children; // Set title for testing
      return null;
    },
  };
});

// Mock 'lucide-react' (ArrowLeft icon)
vi.mock("lucide-react", () => ({
  ArrowLeft: (props) => <svg data-testid="arrow-left-icon" {...props} />,
}));

// Mock 'react-router-dom' (useNavigate)
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock the child component
vi.mock("@/components/auth/ChangePasswordForm", () => ({
  default: vi.fn(() => (
    <div data-testid="mock-change-password-form">Mock Form</div>
  )),
}));

// Mock 'useAuthStore'
const mockUseAuthStore = vi.fn();
vi.mock("@/stores/authStore", () => ({
  useAuthStore: (selector) => mockUseAuthStore(selector),
}));

// --- Test Suite ---

describe("Change Password Page Integration Testing", () => {
  const user = userEvent.setup();
  const mockUser = { username: "testuser" };
  const mockGuest = { username: "Pengguna" }; // Default

  // Helper render
  const renderPage = (route = "/change-password") => {
    return render(
      <HeadProvider>
        <MemoryRouter initialEntries={[route]}>
          <ChangePasswordPage />
        </MemoryRouter>
      </HeadProvider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    document.title = "";

    // Set default mock for authStore (logged in user)
    mockUseAuthStore.mockImplementation((selector) => {
      const state = {
        currentUser: mockUser, // (Tambahkan state lain jika perlu, misal: isAuthenticated: true)
      };

      if (typeof selector === "function") {
        return selector(state);
      }
      return state;
    });
  });

  // Test 1: Document Title
  it("should set the document title correctly", () => {
    renderPage();
    expect(document.title).toBe("Ganti Password | Judi Guard");
  });

  // Test 2: Render Content (User Logged In)
  it("should render header, welcome message, and the form when user is logged in", () => {
    renderPage();

    // Check heading
    expect(
      screen.getByRole("heading", { level: 1, name: /ganti kata sandi/i })
    ).toBeInTheDocument();

    // Check welcome message with specific username
    expect(screen.getByText(/mengamankan akun untuk/i)).toBeInTheDocument();
    expect(screen.getByText(mockUser.username)).toBeInTheDocument();

    // Check back button
    expect(
      screen.getByRole("button", { name: /kembali ke profil/i })
    ).toBeInTheDocument();
    expect(screen.getByTestId("arrow-left-icon")).toBeInTheDocument();

    // Check that the mock form component is rendered
    expect(screen.getByTestId("mock-change-password-form")).toBeInTheDocument();
  });

  // Test 3: Render Content (User Not Logged In / Guest)
  it("should render with default username if currentUser is null", () => {
    // Override mock for this test
    mockUseAuthStore.mockImplementation((selector) => {
      const state = { currentUser: null }; // State dengan user null
      if (typeof selector === "function") {
        return selector(state);
      }
      return state; // Kembalikan seluruh state
    });

    renderPage();

    // Check for default username
    expect(screen.getByText(mockGuest.username)).toBeInTheDocument();
    expect(screen.queryByText(mockUser.username)).not.toBeInTheDocument();
  });

  // Test 4: Back Button Navigation
  it("should call navigate to '/profile' when back button is clicked", async () => {
    renderPage();

    const backButton = screen.getByRole("button", {
      name: /kembali ke profil/i,
    });

    // Simulate user click
    await user.click(backButton);

    // Verify navigation
    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith("/profile");
  });
});
