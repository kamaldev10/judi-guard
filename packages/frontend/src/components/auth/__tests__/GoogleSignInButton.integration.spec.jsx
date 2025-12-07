import React from "react";
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom"; // Impor MemoryRouter
import GoogleSignInButton from "../GoogleSignInButton";
import { create } from "zustand";
import { toast } from "react-toastify";

// --- Mocking Dependencies ---

// 1. Mock 'react-toastify'
vi.mock("react-toastify", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// 2. Mock 'react-router-dom' (useNavigate)
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// 3. Mock useAuthStore (Zustand)
const mockSignInWithGoogle = vi.fn();
const createMockAuthStore = () =>
  create(() => ({
    signInWithGoogle: mockSignInWithGoogle,
    // Tambahkan state lain jika perlu diuji
  }));
let mockAuthStore;
vi.mock("@/stores/authStore", () => ({
  useAuthStore: (selector) => mockAuthStore(selector),
}));

// 4. Mock '@iconify/react'
vi.mock("@iconify/react", () => ({
  Icon: (props) => <span data-testid="google-icon" icon={props.icon}></span>,
}));

// 5. 🔥 Mock '@react-oauth/google' (GoogleLogin)

let googleOnSuccessCallback = null;
let googleOnErrorCallback = null;
let googleRenderProps = {}; // Untuk menyimpan onClick dan disabled dari GoogleLogin

vi.mock("@react-oauth/google", () => ({
  GoogleLogin: ({ onSuccess, onError, render }) => {
    // Simpan callback untuk dipicu nanti
    googleOnSuccessCallback = onSuccess;
    googleOnErrorCallback = onError;

    // Fungsi klik dummy yang bisa dipanggil oleh tombol kita
    const mockOnClick = vi.fn(() => {
      // Di sini kita bisa memilih untuk memicu success/error
      // console.log("Google mock onClick triggered");
    });

    // Panggil render prop yang diberikan oleh GoogleSignInButton
    // dengan fungsi klik tiruan dan status disabled (misal, false)
    googleRenderProps = { onClick: mockOnClick, disabled: false };
    return render(googleRenderProps);
  },
}));

// --- Test Suite ---

describe("Google Sign In Button Integration Testing", () => {
  const user = userEvent.setup();
  const mockOnSuccessCustom = vi.fn();
  const mockOnErrorCustom = vi.fn();

  // Helper render
  const renderButton = (props = {}) => {
    mockAuthStore = createMockAuthStore(); // Reset store
    return render(
      <MemoryRouter>
        <GoogleSignInButton {...props} />
      </MemoryRouter>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset callback GoogleLogin
    googleOnSuccessCallback = null;
    googleOnErrorCallback = null;
    googleRenderProps = {};
  });

  // Tes 1: Render Awal
  it("should render the button correctly", () => {
    const buttonText = "Masuk via Google";
    renderButton({ buttonText });

    const button = screen.getByRole("button", { name: buttonText });
    expect(button).toBeInTheDocument();
    expect(button).toBeEnabled();
    expect(screen.getByTestId("google-icon")).toBeInTheDocument();
    // Pastikan spinner tidak ada
    expect(
      screen.queryByRole("status", { name: /loading/i })
    ).not.toBeInTheDocument(); // Cari spinner berdasarkan peran
  });

  // Tes 2: Render Disabled
  it("should render disabled when disabled prop is true", () => {
    renderButton({ disabled: true });
    expect(screen.getByRole("button")).toBeDisabled();
  });

  // Tes 3: Flow Sukses (Default - Navigate)
  // it("should call signInWithGoogle, show success toast, and navigate on success", async () => {
  //   renderButton();
  //   const button = screen.getByRole("button", { name: /masuk dengan google/i });

  //   // Klik tombol (ini akan memanggil onClick dari render prop mock GoogleLogin)
  //   await user.click(button);
  //   // Panggil onClick internal dari mock GoogleLogin (opsional, tergantung implementasi mock)
  //   // Jika mock onClick kita tidak melakukan apa2, langkah ini bisa diskip
  //   // googleRenderProps.onClick();

  //   // --- Simulasikan Google Callback Sukses ---
  //   const mockCredential = { credential: "test-google-token" };
  //   // Bungkus dalam act karena memicu state update (loading) dan async logic
  //   await act(async () => {
  //     googleOnSuccessCallback(mockCredential);
  //     // Tunggu promise signInWithGoogle selesai (meskipun di-mock)
  //     await Promise.resolve();
  //   });

  //   // Verifikasi state loading (spinner seharusnya muncul lalu hilang)
  //   // (Sulit dites tanpa delay, fokus pada hasil akhir)

  //   // Verifikasi signInWithGoogle dipanggil
  //   expect(mockSignInWithGoogle).toHaveBeenCalledTimes(1);
  //   expect(mockSignInWithGoogle).toHaveBeenCalledWith(
  //     mockCredential.credential
  //   );

  //   // Verifikasi toast sukses
  //   expect(toast.success).toHaveBeenCalledWith(
  //     "Login dengan Google berhasil!",
  //     expect.any(Object)
  //   );

  //   // Verifikasi navigasi (default)
  //   expect(mockNavigate).toHaveBeenCalledTimes(1);
  //   expect(mockNavigate).toHaveBeenCalledWith("/");

  //   // Verifikasi tombol tidak lagi loading
  //   expect(button).toBeEnabled();
  //   expect(
  //     screen.queryByRole("status", { name: /loading/i })
  //   ).not.toBeInTheDocument(); // Cari spinner berdasarkan peran
  // });

  // // Tes 4: Flow Sukses (dengan onSuccessCustom)
  // it("should call onSuccessCustom instead of navigate when provided", async () => {
  //   renderButton({ onSuccessCustom: mockOnSuccessCustom });
  //   const button = screen.getByRole("button", { name: /masuk dengan google/i });

  //   await user.click(button);

  //   const mockCredential = { credential: "test-token-custom" };
  //   // Simulasikan success
  //   await act(async () => {
  //     googleOnSuccessCallback(mockCredential);
  //     await Promise.resolve(); // Tunggu signInWithGoogle
  //   });

  //   expect(mockSignInWithGoogle).toHaveBeenCalledWith("test-token-custom");
  //   expect(toast.success).toHaveBeenCalled();

  //   // Verifikasi onSuccessCustom dipanggil
  //   expect(mockOnSuccessCustom).toHaveBeenCalledTimes(1);
  //   // Verifikasi navigate TIDAK dipanggil
  //   expect(mockNavigate).not.toHaveBeenCalled();
  // });

  // // Tes 5: Flow Gagal (Store/API Error)
  // it("should show error toast and call onErrorCustom if signInWithGoogle fails", async () => {
  //   const errorMessage = "API Gagal";
  //   mockSignInWithGoogle.mockRejectedValueOnce(new Error(errorMessage)); // Buat mock gagal

  //   renderButton({ onErrorCustom: mockOnErrorCustom });
  //   const button = screen.getByRole("button", { name: /masuk dengan google/i });

  //   await user.click(button);

  //   const mockCredential = { credential: "test-token-fail" };
  //   await act(async () => {
  //     googleOnSuccessCallback(mockCredential);
  //     try {
  //       await mockSignInWithGoogle();
  //     } catch (e) {} // Biarkan reject
  //     await Promise.resolve(); // Flush
  //   });

  //   expect(mockSignInWithGoogle).toHaveBeenCalledWith("test-token-fail");

  //   // Verifikasi toast error
  //   expect(toast.error).toHaveBeenCalledWith(errorMessage, expect.any(Object));

  //   // Verifikasi onErrorCustom dipanggil
  //   expect(mockOnErrorCustom).toHaveBeenCalledTimes(1);
  //   expect(mockOnErrorCustom).toHaveBeenCalledWith(expect.any(Error));

  //   // Verifikasi navigate tidak dipanggil
  //   expect(mockNavigate).not.toHaveBeenCalled();
  //   expect(button).toBeEnabled(); // Tombol aktif lagi
  // });

  // Tes 6: Flow Gagal (Google Callback Error)
  it("should show error toast and call onErrorCustom on Google onError callback", async () => {
    renderButton({ onErrorCustom: mockOnErrorCustom });
    const button = screen.getByRole("button", { name: /masuk dengan google/i });

    await user.click(button);

    const mockError = { error: "popup_closed_by_user" };
    await act(async () => {
      googleOnErrorCallback(mockError); // Simulasikan Google error
    });

    // Verifikasi toast error yang sesuai
    expect(toast.error).toHaveBeenCalledWith(
      "Proses login Google dibatalkan.",
      expect.any(Object)
    );
    // Verifikasi onErrorCustom dipanggil
    expect(mockOnErrorCustom).toHaveBeenCalledTimes(1);
    expect(mockOnErrorCustom).toHaveBeenCalledWith(mockError);
    // Verifikasi signInWithGoogle TIDAK dipanggil
    expect(mockSignInWithGoogle).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  // Tes 7: Flow Gagal (Google Success tapi tanpa token)
  it("should show error toast if Google onSuccess provides no credential", async () => {
    renderButton({ onErrorCustom: mockOnErrorCustom });
    const button = screen.getByRole("button", { name: /masuk dengan google/i });

    await user.click(button);

    const mockCredential = {}; // Tanpa credential
    await act(async () => {
      googleOnSuccessCallback(mockCredential); // Simulasikan Google success tanpa token
    });

    // Verifikasi toast error spesifik
    expect(toast.error).toHaveBeenCalledWith(
      "Google ID Token tidak diterima",
      expect.any(Object)
    );
    // Verifikasi onErrorCustom dipanggil
    expect(mockOnErrorCustom).toHaveBeenCalledTimes(1);
    expect(mockOnErrorCustom).toHaveBeenCalledWith(expect.any(Error));
    // Verifikasi signInWithGoogle TIDAK dipanggil
    expect(mockSignInWithGoogle).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});

// Helper untuk spinner (cari berdasarkan role)
// Anda bisa menambahkan role="status" aria-label="loading" pada SVG spinner di komponen asli
// Contoh spinner mock:
// <svg role="status" aria-label="loading" ... />
