import React from "react";
import { render, screen, within } from "@testing-library/react"; // Tambahkan within
import { describe, it, expect, vi } from "vitest";
import { MemoryRouter } from "react-router-dom"; // 1. Impor MemoryRouter
import ConnectSection from "../ConnectSection"; // <-- Sesuaikan path

// --- Mocking Dependencies ---

// 2. Mock 'motion/react'
vi.mock("motion/react", () => ({
  motion: {
    section: React.forwardRef((props, ref) => <section {...props} ref={ref} />),
    div: React.forwardRef((props, ref) => <div {...props} ref={ref} />),
    h2: React.forwardRef((props, ref) => <h2 {...props} ref={ref} />),
    p: React.forwardRef((props, ref) => <p {...props} ref={ref} />),
    button: React.forwardRef((props, ref) => <button {...props} ref={ref} />),
    img: React.forwardRef((props, ref) => <img {...props} ref={ref} />),
  },
}));

// 3. Mock 'lucide-react' (Youtube icon)
vi.mock("lucide-react", () => ({
  Youtube: (props) => <svg data-testid="youtube-icon" {...props} />,
}));

// 4. Mock image asset
vi.mock("@/assets/images", () => ({
  IlustrasiAnalisis: "ilustrasi-analisis-mock.png", // Path string
}));

// --- Test Suite ---

describe("ConnectSection Component", () => {
  // Helper render dengan Router
  const renderConnectSection = () => {
    return render(
      <MemoryRouter>
        <ConnectSection />
      </MemoryRouter>
    );
  };

  it("should render the main heading and description", () => {
    renderConnectSection();

    // Cek Judul
    expect(
      screen.getByRole("heading", {
        level: 2,
        name: /siap mengamankan ruang digital anda/i,
      })
    ).toBeInTheDocument();

    // Cek Deskripsi (gunakan regex parsial)
    expect(
      screen.getByText(/fitur analisis canggih kami membantu anda/i)
    ).toBeInTheDocument();
  });

  it("should render the illustration image correctly", () => {
    renderConnectSection();

    // Cek Gambar berdasarkan alt text
    const image = screen.getByAltText(
      /ilustrasi analisis komentar judi guard/i
    );
    expect(image).toBeInTheDocument();
    // Cek src yang sudah di-mock
    expect(image).toHaveAttribute("src", "ilustrasi-analisis-mock.png");
  });

  it("should render the CTA button with text and icon", () => {
    renderConnectSection();

    // Cari tombol berdasarkan teksnya
    const ctaButton = screen.getByRole("button", {
      name: /hubungkan youtube anda sekarang/i,
    });
    expect(ctaButton).toBeInTheDocument();

    // Cari ikon di dalam tombol menggunakan 'within'
    expect(within(ctaButton).getByTestId("youtube-icon")).toBeInTheDocument();
  });

  it("should render the CTA button wrapped in a link pointing to the correct profile section", () => {
    renderConnectSection();

    // Cari link yang berisi tombol
    // Cara terbaik adalah mencari link berdasarkan teks tombol di dalamnya
    const ctaLink = screen.getByRole("link", {
      name: /hubungkan youtube anda sekarang/i,
    });
    expect(ctaLink).toBeInTheDocument();

    // Verifikasi atribut href (hasil render dari 'to' prop)
    expect(ctaLink).toHaveAttribute("href", "/profile#connections-heading");

    // Pastikan tombol ada di dalam link (opsional, tapi bagus)
    expect(
      within(ctaLink).getByRole("button", {
        name: /hubungkan youtube anda sekarang/i,
      })
    ).toBeInTheDocument();
  });
});
