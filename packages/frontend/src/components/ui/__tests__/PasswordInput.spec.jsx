import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { PasswordInput } from "../PasswordInput";

// --- Mocking Dependencies ---

// 1. Mock 'lucide-react' icons
vi.mock("lucide-react", () => ({
  Eye: (props) => <svg data-testid="eye-icon" {...props} />,
  EyeOff: (props) => <svg data-testid="eye-off-icon" {...props} />,
  KeyRound: (props) => <svg data-testid="key-icon" {...props} />,
}));

// --- Test Suite ---

describe("PasswordInput Component", () => {
  const user = userEvent.setup();

  // 2. Siapkan mock functions untuk props
  const mockOnChange = vi.fn();
  const mockSetShow = vi.fn();

  // 3. Props default
  const defaultProps = {
    id: "password",
    label: "Kata Sandi",
    value: "",
    onChange: mockOnChange,
    show: false, // Default tersembunyi
    setShow: mockSetShow,
    isLoading: false,
  };

  // 4. Bersihkan mock sebelum setiap tes
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Tes 1: Render Awal (Password Tersembunyi)
  it("should render correctly with initial props (password hidden)", () => {
    render(<PasswordInput {...defaultProps} />);

    // Cek Label
    expect(screen.getByText(defaultProps.label)).toBeInTheDocument();

    // Cek Input
    const input = screen.getByLabelText(defaultProps.label);
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("id", defaultProps.id);
    expect(input).toHaveAttribute("type", "password"); // Tipe awal password
    expect(input).toHaveValue(""); // Nilai awal kosong
    expect(input).toBeEnabled(); // Tidak loading

    // Cek Tombol Toggle
    // Cari berdasarkan peran (button), mungkin perlu label aksesibilitas
    // Kita cari berdasarkan ikon di dalamnya untuk sementara
    const toggleButton = screen.getByRole("button");
    expect(toggleButton).toBeInTheDocument();

    // Cek Ikon
    expect(screen.getByTestId("key-icon")).toBeInTheDocument(); // Ikon kunci
    expect(screen.getByTestId("eye-icon")).toBeInTheDocument(); // Ikon mata (tersembunyi)
    expect(screen.queryByTestId("eye-off-icon")).not.toBeInTheDocument(); // Ikon mata coret tidak ada
  });

  // Tes 2: Interaksi Mengetik (onChange)
  it("should call onChange prop with correct event when user types", async () => {
    render(<PasswordInput {...defaultProps} value="current" />); // Beri nilai awal
    const input = screen.getByLabelText(defaultProps.label);

    await user.type(input, "abc");

    // Verifikasi onChange dipanggil 3x
    expect(mockOnChange).toHaveBeenCalledTimes(3);

    // Verifikasi event terakhir (saat 'c' diketik) memiliki ID yang benar
    const lastEvent = mockOnChange.mock.calls[2][0];
    expect(lastEvent.target.id).toBe(defaultProps.id);
  });

  // Tes 3: Interaksi Toggle Klik (setShow)
  it("should call setShow prop with the opposite value when toggle button is clicked", async () => {
    render(<PasswordInput {...defaultProps} show={false} />); // Mulai dari false

    // Cari tombol toggle (mungkin perlu aria-label jika ada tombol lain)
    const toggleButton = screen.getByRole("button");
    await user.click(toggleButton);

    // Verifikasi setShow dipanggil dengan true
    expect(mockSetShow).toHaveBeenCalledTimes(1);
    expect(mockSetShow).toHaveBeenCalledWith(true); // Meminta untuk menampilkan
  });

  // Tes 4: Render State Visible (Password Terlihat)
  it("should render with type='text' and EyeOff icon when show prop is true", () => {
    render(<PasswordInput {...defaultProps} show={true} />); // Render dengan show=true

    // Cek tipe input
    const input = screen.getByLabelText(defaultProps.label);
    expect(input).toHaveAttribute("type", "text");

    // Cek ikon tombol toggle
    expect(screen.getByTestId("eye-off-icon")).toBeInTheDocument(); // Ikon mata coret ada
    expect(screen.queryByTestId("eye-icon")).not.toBeInTheDocument(); // Ikon mata tidak ada
  });

  // Tes 5: Render State Loading
  it("should disable the input when isLoading prop is true", () => {
    render(<PasswordInput {...defaultProps} isLoading={true} />); // Render dengan isLoading=true

    // Cek input disabled
    const input = screen.getByLabelText(defaultProps.label);
    expect(input).toBeDisabled();

    // (Opsional) Tombol toggle biasanya tidak perlu disabled saat loading input
    const toggleButton = screen.getByRole("button");
    expect(toggleButton).toBeEnabled();
  });
});
