import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import TextPredictInput from "../TextPredictInput";

// --- Mocking Dependencies ---

// 1. Mock 'framer-motion'
// Kita ganti 'motion.form' menjadi elemen <form> biasa.
vi.mock("framer-motion", () => ({
  motion: {
    form: React.forwardRef((props, ref) => <form {...props} ref={ref} />),
  },
}));

// 2. Mock Ikon (kita ganti dengan data-testid agar mudah ditemukan)
vi.mock("@/assets/icons/SearchIcon", () => ({
  SearchIcon: () => <span data-testid="search-icon" />,
}));
vi.mock("@/assets/icons/LoadingSpinner", () => ({
  LoadingSpinner: () => <span data-testid="loading-spinner" />,
}));

// --- Test Suite ---

describe("Text Predict Input Component Testing", () => {
  const user = userEvent.setup();

  // 3. Siapkan mock functions untuk props
  const mockOnChange = vi.fn();
  const mockOnSubmit = vi.fn();

  // 4. Bersihkan mock sebelum setiap tes
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Tes 1: Render Awal (State Normal)
  it("should render correctly, be enabled, and show search icon", () => {
    render(
      <TextPredictInput
        value=""
        onChange={mockOnChange}
        onSubmit={mockOnSubmit}
        isLoading={false}
      />
    );

    // Cek input
    const input = screen.getByPlaceholderText(/menang judi bola/i);
    expect(input).toBeInTheDocument();
    expect(input).toBeEnabled();

    // Cek tombol
    const button = screen.getByRole("button", { name: /analisis/i });
    expect(button).toBeInTheDocument();
    expect(button).toBeEnabled();

    // Cek ikon
    expect(screen.getByTestId("search-icon")).toBeInTheDocument();
    expect(screen.queryByTestId("loading-spinner")).not.toBeInTheDocument();
  });

  // Tes 2: Interaksi Mengetik (onChange)
  it("should call onChange when user types in the input", async () => {
    render(
      <TextPredictInput
        value=""
        onChange={mockOnChange}
        onSubmit={mockOnSubmit}
        isLoading={false}
      />
    );

    const input = screen.getByPlaceholderText(/menang judi bola/i);
    await user.type(input, "tes");

    // Verifikasi 'onChange' dipanggil 3 kali (untuk 't', 'e', 's')
    expect(mockOnChange).toHaveBeenCalledTimes(3);
  });

  // Tes 3: Interaksi Submit (onSubmit)
  it("should call onSubmit when the form is submitted", async () => {
    render(
      <TextPredictInput
        value="ada teks"
        onChange={mockOnChange}
        onSubmit={mockOnSubmit}
        isLoading={false}
      />
    );

    const button = screen.getByRole("button", { name: /analisis/i });
    await user.click(button);

    // Verifikasi 'onSubmit' dipanggil
    expect(mockOnSubmit).toHaveBeenCalledTimes(1);
  });

  // Tes 4: State Loading
  it("should disable form and show loading spinner when isLoading is true", () => {
    render(
      <TextPredictInput
        value=""
        onChange={mockOnChange}
        onSubmit={mockOnSubmit}
        isLoading={true}
      />
    );

    // Cek input (disabled)
    const input = screen.getByPlaceholderText(/menang judi bola/i);
    expect(input).toBeDisabled();

    // Cek tombol (disabled)
    // Kita tidak bisa mencari berdasarkan nama 'Analisis' karena teksnya tidak ada
    const button = screen.getByRole("button");
    expect(button).toBeDisabled();

    // Cek ikon
    expect(screen.queryByTestId("search-icon")).not.toBeInTheDocument();
    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();

    // Cek teks di tombol
    expect(screen.queryByText(/analisis/i)).not.toBeInTheDocument();
  });
});
