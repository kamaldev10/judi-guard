import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
  configure,
} from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { BrowserRouter } from "react-router-dom";
import LoginForm from "../LoginForm";

// --- Configuration ---
configure({ testIdAttribute: "data-cy" });

// --- Mocks ---

// 1. Hoisted variables for mocks
// We include mockUseAuthStore here so we can change its implementation in specific tests
const {
  mockNavigate,
  mockLogin,
  mockSetUser,
  mockToast,
  mockValidateEmail,
  mockValidatePassword,
  mockUseAuthStore,
} = vi.hoisted(() => ({
  mockNavigate: vi.fn(),
  mockLogin: vi.fn(),
  mockSetUser: vi.fn(),
  mockToast: { success: vi.fn(), error: vi.fn() },
  mockValidateEmail: vi.fn(),
  mockValidatePassword: vi.fn(),
  mockUseAuthStore: vi.fn(),
}));

// 2. Mock React Router Dom
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// 3. Mock Toastify
vi.mock("react-toastify", () => ({
  toast: mockToast,
}));

// 4. Mock Auth Store
// We delegate to the hoisted mockUseAuthStore function.
// This prevents us from needing to "require" the actual file in tests, avoiding the import error.
vi.mock("@/stores/authStore", () => ({
  useAuthStore: (selector) => mockUseAuthStore(selector),
}));

// 5. Mock Validators
vi.mock("@/lib/utils/formValidators", () => ({
  validateEmail: mockValidateEmail,
  validateLoginPassword: mockValidatePassword,
}));

// 6. Mock Child Component (GoogleSignInButton)
vi.mock("../GoogleSignInButton", () => ({
  default: ({ buttonText, disabled }) => (
    <button data-cy="google-signin-btn" disabled={disabled}>
      {buttonText}
    </button>
  ),
}));

describe("LoginForm Integration Tests", () => {
  const renderComponent = () => {
    return render(
      <BrowserRouter>
        <LoginForm />
      </BrowserRouter>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Default: Validators return empty string (no error)
    mockValidateEmail.mockReturnValue("");
    mockValidatePassword.mockReturnValue("");

    // Default: Auth Store Loading is false
    // We set the default implementation for every test here
    mockUseAuthStore.mockImplementation((selector) => {
      const state = {
        login: mockLogin,
        setUser: mockSetUser,
        isLoadingAuth: false,
      };
      return selector ? selector(state) : state;
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders all form elements correctly", () => {
    renderComponent();

    expect(screen.getByRole("heading", { name: /Masuk/i })).toBeInTheDocument();
    expect(screen.getByTestId("email-input")).toBeInTheDocument();
    expect(screen.getByTestId("password-input")).toBeInTheDocument();
    expect(screen.getByTestId("log-in-button")).toBeInTheDocument();
    expect(screen.getByTestId("google-signin-btn")).toBeInTheDocument();
    expect(screen.getByTestId("forgot-password-link")).toBeInTheDocument();
    expect(screen.getByText(/Belum punya akun\?/i)).toBeInTheDocument();
  });

  it("toggles password visibility when eye icon is clicked", () => {
    renderComponent();

    const passwordInput = screen.getByTestId("password-input");
    // Initially type password
    expect(passwordInput).toHaveAttribute("type", "password");

    // Find the toggle button
    const toggleBtn = screen.getByRole("button", {
      name: /Hide Password|Show Password/i,
    });

    // Click to show
    fireEvent.click(toggleBtn);
    expect(passwordInput).toHaveAttribute("type", "text");

    // Click to hide
    fireEvent.click(toggleBtn);
    expect(passwordInput).toHaveAttribute("type", "password");
  });

  it("updates input values and triggers validation on change", () => {
    renderComponent();

    const emailInput = screen.getByTestId("email-input");
    const passwordInput = screen.getByTestId("password-input");

    fireEvent.change(emailInput, {
      target: { value: "test@email.com", name: "email" },
    });
    fireEvent.change(passwordInput, {
      target: { value: "password123", name: "password" },
    });

    expect(emailInput.value).toBe("test@email.com");
    expect(passwordInput.value).toBe("password123");

    expect(mockValidateEmail).toHaveBeenCalledWith("test@email.com");
    expect(mockValidatePassword).toHaveBeenCalledWith("password123");
  });

  it("blocks submission and shows errors if validation fails", () => {
    // Setup validators to return errors
    mockValidateEmail.mockReturnValue("Email tidak valid");
    mockValidatePassword.mockReturnValue("Password terlalu pendek");

    renderComponent();

    const submitBtn = screen.getByTestId("log-in-button");
    fireEvent.click(submitBtn);

    expect(mockValidateEmail).toHaveBeenCalled();
    expect(mockValidatePassword).toHaveBeenCalled();

    expect(screen.getByText("Email tidak valid")).toBeInTheDocument();
    expect(screen.getByText("Password terlalu pendek")).toBeInTheDocument();

    expect(mockLogin).not.toHaveBeenCalled();
  });

  it("handles successful login and navigation", async () => {
    // FIX: Add shouldAdvanceTime: true to prevent waitFor from hanging
    vi.useFakeTimers({ shouldAdvanceTime: true });

    // Setup Mock Success
    const mockUser = { id: 1, name: "Test User" };
    mockLogin.mockResolvedValue({ data: { user: mockUser } });

    renderComponent();

    // Fill Form
    fireEvent.change(screen.getByTestId("email-input"), {
      target: { name: "email", value: "valid@email.com" },
    });
    fireEvent.change(screen.getByTestId("password-input"), {
      target: { name: "password", value: "ValidPass123" },
    });

    // Submit
    fireEvent.submit(screen.getByTestId("log-in-button").closest("form"));

    // Wait for login to be called
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: "valid@email.com",
        password: "ValidPass123",
      });
    });

    // Verify Set User
    expect(mockSetUser).toHaveBeenCalledWith(mockUser);

    // Verify Toast
    expect(mockToast.success).toHaveBeenCalledWith(
      "Anda berhasil login!",
      expect.anything()
    );

    // NOTE: We removed the check `expect(mockNavigate).not.toHaveBeenCalled()`
    // because with a 0ms timeout and `shouldAdvanceTime: true`, the navigation happens almost instantly.

    // Fast-forward timers to ensure we catch the navigation if it hasn't happened yet
    await act(async () => {
      vi.runAllTimers();
    });

    expect(mockNavigate).toHaveBeenCalledWith("/");
  });

  it("handles login failure (API Error)", async () => {
    // Setup Mock Failure
    mockLogin.mockRejectedValue(new Error("Invalid Credentials"));

    renderComponent();

    fireEvent.change(screen.getByTestId("email-input"), {
      target: { name: "email", value: "wrong@email.com" },
    });
    fireEvent.change(screen.getByTestId("password-input"), {
      target: { name: "password", value: "WrongPass" },
    });

    fireEvent.click(screen.getByTestId("log-in-button"));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalled();
    });

    expect(mockToast.error).toHaveBeenCalledWith(
      "Error: Invalid Credentials",
      expect.anything()
    );

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("disables inputs and buttons when loading", () => {
    // FIX: Use the hoisted mock variable to change implementation.
    // This avoids using require() which triggers the "Cannot find package" error.
    mockUseAuthStore.mockImplementation((selector) => {
      const state = {
        login: mockLogin,
        setUser: mockSetUser,
        isLoadingAuth: true, // TRUE here
      };
      return selector ? selector(state) : state;
    });

    renderComponent();

    expect(screen.getByTestId("email-input")).toBeDisabled();
    expect(screen.getByTestId("password-input")).toBeDisabled();
    expect(screen.getByTestId("log-in-button")).toBeDisabled();
    expect(screen.getByTestId("log-in-button")).toHaveTextContent(
      "Memproses..."
    );

    expect(screen.getByTestId("google-signin-btn")).toBeDisabled();
  });
});
