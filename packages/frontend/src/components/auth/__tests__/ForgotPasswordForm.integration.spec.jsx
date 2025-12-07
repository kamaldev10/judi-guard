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
import ForgotPasswordForm from "../ForgotPasswordForm";
import { useManagePasswordStore } from "@/stores/managePasswordStore";
import Swal from "sweetalert2";

// --- Configuration ---
// Configure RTL to look for 'data-cy' attribute instead of 'data-testid'
configure({ testIdAttribute: "data-cy" });

// --- Mocks Setup ---

// 1. Hoist mock functions to ensure they exist before imports/mocks run
const { mockNavigate, mockForgotPassword } = vi.hoisted(() => ({
  mockNavigate: vi.fn(),
  mockForgotPassword: vi.fn(),
}));

// 2. Mock React Router Dom
vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

// 3. Mock SweetAlert2
// We mock the default export since it's imported as "import Swal from..."
vi.mock("sweetalert2", () => ({
  default: {
    fire: vi.fn(),
  },
}));

// 4. Mock Store
vi.mock("@/stores/managePasswordStore", () => ({
  useManagePasswordStore: vi.fn(),
}));

describe("ForgotPasswordForm Integration Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Reset Store Default State
    useManagePasswordStore.mockReturnValue({
      forgotPassword: mockForgotPassword,
      isLoading: false,
    });
  });

  afterEach(() => {
    vi.useRealTimers(); // Cleanup timers after each test
  });

  const setup = () => {
    return render(<ForgotPasswordForm />);
  };

  it("renders the form correctly", () => {
    setup();

    expect(screen.getByText("Lupa Kata Sandi?")).toBeInTheDocument();
    expect(
      screen.getByText(/Jangan khawatir! Masukkan alamat email Anda/i)
    ).toBeInTheDocument();

    // Check for input using data-cy as per source code
    expect(screen.getByTestId("email-input")).toBeInTheDocument();

    // Check button
    expect(
      screen.getByRole("button", { name: /Kirim Instruksi Reset/i })
    ).toBeInTheDocument();
  });

  it("shows validation warning if email is empty", async () => {
    setup();

    const submitBtn = screen.getByTestId("send-instructions-button");
    fireEvent.submit(submitBtn.closest("form"));

    // Verify API was NOT called
    expect(mockForgotPassword).not.toHaveBeenCalled();

    // Verify SweetAlert Validation
    expect(Swal.fire).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Input Tidak Valid",
        text: "Alamat email wajib diisi.",
        icon: "warning",
      })
    );
  });

  it("successfully sends reset request, clears form, and navigates after delay", async () => {
    // Enable fake timers to test setTimeout
    vi.useFakeTimers({ shouldAdvanceTime: true });

    mockForgotPassword.mockResolvedValue({}); // API Success

    setup();

    const emailInput = screen.getByTestId("email-input");
    const submitBtn = screen.getByTestId("send-instructions-button");

    // 1. Enter Valid Email
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });

    // 2. Submit
    fireEvent.click(submitBtn);

    // 3. Verify API Call
    await waitFor(() => {
      expect(mockForgotPassword).toHaveBeenCalledWith("test@example.com");
    });

    // 4. Verify Success Alert
    expect(Swal.fire).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Permintaan Terkirim!",
        icon: "success",
      })
    );

    // 5. Verify Form Cleared
    expect(emailInput.value).toBe("");

    // 6. Verify Navigation Logic (Wait for Timeout)
    expect(mockNavigate).not.toHaveBeenCalled(); // Shouldn't navigate yet

    // Advance time by 2 seconds
    await act(async () => {
      vi.advanceTimersByTime(2000);
    });

    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });

  it("handles API errors gracefully", async () => {
    const errorMessage = "Email tidak ditemukan";
    mockForgotPassword.mockRejectedValue(new Error(errorMessage)); // API Failure

    setup();

    const emailInput = screen.getByTestId("email-input");
    const submitBtn = screen.getByTestId("send-instructions-button");

    fireEvent.change(emailInput, { target: { value: "wrong@example.com" } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockForgotPassword).toHaveBeenCalled();
    });

    // Verify Error Alert
    expect(Swal.fire).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Oops... Terjadi Kesalahan",
        text: errorMessage,
        icon: "error",
      })
    );

    // Verify we did NOT navigate
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("handles generic API errors", async () => {
    // Rejection without a specific message
    mockForgotPassword.mockRejectedValue({});

    setup();
    const submitBtn = screen.getByTestId("send-instructions-button");
    fireEvent.change(screen.getByTestId("email-input"), {
      target: { value: "valid@test.com" },
    });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(Swal.fire).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Oops... Terjadi Kesalahan",
          text: "Gagal mengirim permintaan reset password.", // Default fallback text
          icon: "error",
        })
      );
    });
  });

  it("disables input and button when loading", () => {
    // Simulate loading state from store
    useManagePasswordStore.mockReturnValue({
      forgotPassword: mockForgotPassword,
      isLoading: true,
    });

    setup();

    const emailInput = screen.getByTestId("email-input");
    const submitBtn = screen.getByTestId("send-instructions-button");

    expect(emailInput).toBeDisabled();
    expect(submitBtn).toBeDisabled();
    expect(submitBtn).toHaveTextContent("Mengirim Permintaan...");
  });
});
