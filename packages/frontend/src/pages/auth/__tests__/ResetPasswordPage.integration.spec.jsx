import React from "react";
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter, useParams } from "react-router-dom";
import { HeadProvider, Title } from "react-head";
import ResetPasswordPage from "../ResetPasswordPage";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";
import { toast } from "react-toastify";

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

// Mock 'react-toastify'
vi.mock("react-toastify", () => ({
  toast: {
    error: vi.fn(),
  },
}));

// Mock 'react-router-dom' (useParams only)
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual, // Keep MemoryRouter, Link, etc.
    useParams: vi.fn(), // Mock useParams
  };
});

// Mock the child component (ResetPasswordForm)
// We need to capture the 'onInvalidToken' prop
let capturedOnInvalidToken = null;
vi.mock("@/components/auth/ResetPasswordForm", () => ({
  default: vi.fn(({ token, onInvalidToken }) => {
    // Capture the callback function passed as a prop
    capturedOnInvalidToken = onInvalidToken;
    return <div data-testid="mock-reset-form">Mock Form (Token: {token})</div>;
  }),
}));

// --- Test Suite ---

describe("Reset Password Page Integration Testing", () => {
  const user = userEvent.setup();

  // Helper render
  const renderPage = (route = "/reset-password/some-token") => {
    return render(
      <HeadProvider>
        <MemoryRouter initialEntries={[route]}>
          <ResetPasswordPage />
        </MemoryRouter>
      </HeadProvider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    document.title = ""; // Reset document title
    capturedOnInvalidToken = null; // Reset captured callback
    // Get a typed reference to the useParams mock
    vi.mocked(useParams).mockClear();
  });

  // Test 1: Happy Path (Token Present)
  it("should render the form when a token is present in the URL", () => {
    // Arrange: Mock useParams to return a valid token
    const testToken = "valid-token-123";
    vi.mocked(useParams).mockReturnValue({ token: testToken });

    // Act
    renderPage(`/reset-password/${testToken}`);

    // Assert: Title is set
    expect(document.title).toBe("Reset Password | Judi Guard");

    // Assert: Mock form is rendered
    const mockForm = screen.getByTestId("mock-reset-form");
    expect(mockForm).toBeInTheDocument();

    // Assert: Token was passed correctly to the form
    expect(mockForm).toHaveTextContent(`Mock Form (Token: ${testToken})`);

    // Assert: Error UI is NOT rendered
    expect(
      screen.queryByRole("heading", { name: /token tidak valid/i })
    ).not.toBeInTheDocument();

    // Assert: No error toast was shown
    expect(toast.error).not.toHaveBeenCalled();
  });

  // Test 2: Failure Path (No Token in URL)
  it("should render error UI and call toast if token is missing", () => {
    // Arrange: Mock useParams to return no token
    vi.mocked(useParams).mockReturnValue({ token: undefined });

    // Act
    renderPage("/reset-password/"); // Route without token

    // Assert: Error UI is rendered
    expect(
      screen.getByRole("heading", { name: /token tidak valid/i })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/token reset kata sandi yang anda gunakan tidak valid/i)
    ).toBeInTheDocument();

    // Assert: Links for recovery are present
    expect(
      screen.getByRole("link", { name: /minta reset kata sandi baru/i })
    ).toHaveAttribute("href", "/forgot-password");
    expect(
      screen.getByRole("link", { name: /kembali ke login/i })
    ).toHaveAttribute("href", "/login");

    // Assert: Mock form is NOT rendered
    expect(screen.queryByTestId("mock-reset-form")).not.toBeInTheDocument();

    // Assert: Error toast was shown
    expect(toast.error).toHaveBeenCalledTimes(1);
    expect(toast.error).toHaveBeenCalledWith(
      expect.stringContaining("Token reset tidak ditemukan"),
      expect.any(Object)
    );
  });

  // Test 3: Failure Path (Invalid Token via Child Callback)
  it("should switch to error UI when child form calls onInvalidToken", () => {
    // Arrange: Start with a valid token
    const testToken = "invalid-token-456";
    vi.mocked(useParams).mockReturnValue({ token: testToken });

    // Act: Initial render
    renderPage(`/reset-password/${testToken}`);

    // Assert: Initial state is the form
    expect(screen.getByTestId("mock-reset-form")).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: /token tidak valid/i })
    ).not.toBeInTheDocument();
    expect(capturedOnInvalidToken).toBeInstanceOf(Function); // Check the callback was captured

    // Act: Simulate the child component (form) calling the callback
    // We must wrap this in act() because it triggers a state update
    act(() => {
      capturedOnInvalidToken();
    });

    // Assert: Final state is the error UI
    expect(screen.queryByTestId("mock-reset-form")).not.toBeInTheDocument(); // Form is gone
    expect(
      screen.getByRole("heading", { name: /token tidak valid/i })
    ).toBeInTheDocument(); // Error UI is visible
    expect(
      screen.getByRole("link", { name: /minta reset kata sandi baru/i })
    ).toBeInTheDocument();
  });
});
