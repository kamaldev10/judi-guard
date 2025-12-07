import React from "react";
import { render, screen, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { HeadProvider, Title } from "react-head";
import OtpPage from "../OtpPage";
import OtpForm from "@/components/auth/OtpForm";
import { toast } from "react-toastify";

// --- 4. Mocking Dependencies ---

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

// Mock 'react-router-dom' (useNavigate)
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock the image asset
vi.mock("@/assets/images", () => ({
  LogoWithSlogan: "mock-logo-with-slogan.png",
}));

// Mock the child component (OtpForm)
vi.mock("@/components/auth/OtpForm", () => ({
  default: vi.fn(({ email }) => (
    <div data-testid="mock-otp-form">Mock OTP Form for {email}</div>
  )),
}));

// --- Test Suite ---

describe("Otp Page Integration Testing", () => {
  // Helper render function
  const renderPage = (routeState = null) => {
    return render(
      <HeadProvider>
        {/* Pass state via MemoryRouter's initialEntries */}
        <MemoryRouter
          initialEntries={[{ pathname: "/otp", state: routeState }]}
        >
          <OtpPage />
        </MemoryRouter>
      </HeadProvider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    document.title = ""; // Reset document title

    // Clear the OtpForm mock history
    if (vi.isMockFunction(OtpForm)) {
      OtpForm.mockClear();
    }
  });

  // Test 1: Happy Path (with email state)
  it("should render the title, logo, and OtpForm when email is provided in state", () => {
    const testEmail = "test@example.com";
    renderPage({ email: testEmail });

    // 1. Check document title
    expect(document.title).toBe("Verifikasi OTP | Judi Guard");

    // 2. Check for the logo image
    const logoImage = screen.getByAltText("Judi Guard Logo");
    expect(logoImage).toBeInTheDocument();
    expect(logoImage).toHaveAttribute("src", "mock-logo-with-slogan.png");

    // 3. Check that the mock form is rendered
    const mockForm = screen.getByTestId("mock-otp-form");
    expect(mockForm).toBeInTheDocument();

    // 4. Check that the email prop was passed correctly to the mock
    //    Verifikasi props secara manual

    // 4a. Pastikan mock dipanggil 1 kali
    expect(OtpForm).toHaveBeenCalledTimes(1);

    // 4b. Ambil argumen dari panggilan pertama (indeks 0)
    const firstCallArgs = OtpForm.mock.calls[0];

    // 4c. Verifikasi jumlah argumen
    expect(firstCallArgs.length).toBe(2); // Pastikan ada 2 argumen

    // 4d. Verifikasi argumen pertama (props)
    const receivedProps = firstCallArgs[0];
    expect(receivedProps).toEqual(
      expect.objectContaining({ email: testEmail })
    );

    // 4e. (Opsional) Verifikasi argumen kedua
    expect(firstCallArgs[1]).toBeUndefined();

    // 5. Check that no error/navigation occurred
    expect(toast.error).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(
      screen.queryByText(/memuat atau terjadi kesalahan/i)
    ).not.toBeInTheDocument();
  });

  // Test 2: Failure Path (no email state)
  it("should show fallback text, call toast.error, and navigate if email is missing", () => {
    renderPage(null); // Render without state

    // 1. Check for the fallback UI (before navigation)
    expect(
      screen.getByText(/memuat atau terjadi kesalahan/i)
    ).toBeInTheDocument();

    // 2. Check that the mock form is NOT rendered
    expect(screen.queryByTestId("mock-otp-form")).not.toBeInTheDocument();

    // 3. Check that toast.error was called (due to useEffect)
    expect(toast.error).toHaveBeenCalledTimes(1);
    expect(toast.error).toHaveBeenCalledWith(
      "Email tidak ditemukan, harap registrasi ulang.",
      expect.any(Object)
    );

    // 4. Check that navigate was called (due to useEffect)
    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith("/register");

    // 5. Check that the title was NOT set
    expect(document.title).not.toBe("Verifikasi OTP | Judi Guard");
  });
});
