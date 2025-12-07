import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import AnalysisSubmitForm from "../AnalysisSubmitForm"; // <-- Sesuaikan path

// --- Mocking Dependencies ---

// 1. Mock 'framer-motion'
vi.mock("framer-motion", () => ({
  motion: {
    section: React.forwardRef(({ children, ...props }, ref) => (
      <section ref={ref} {...props}>
        {children}
      </section>
    )),
  },
}));

// --- Test Suite ---

describe("Analysis Submit Form Component Testing", () => {
  const user = userEvent.setup();

  // 2. Siapkan mock functions untuk props
  const mockSetVideoUrl = vi.fn();
  const mockOnSubmit = vi.fn();

  // 3. Props default (state normal, URL kosong)
  const defaultProps = {
    videoUrl: "",
    setVideoUrl: mockSetVideoUrl,
    onSubmit: mockOnSubmit,
    isActionInProgress: false,
    loadingMessage: null,
  };

  // 4. Bersihkan mock sebelum setiap tes
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Tes 1: Render Awal
  // it("should render the form correctly in initial state", () => {
  //   render(<AnalysisSubmitForm {...defaultProps} />);

  //   // Cek judul
  //   expect(
  //     screen.getByRole("heading", {
  //       level: 2,
  //       name: /analisis komentar video youtube/i,
  //     })
  //   ).toBeInTheDocument();

  //   // Cek input URL
  //   const urlInput = screen.getByLabelText(/link video/i);
  //   expect(urlInput).toBeInTheDocument();
  //   expect(urlInput).toHaveValue(""); // Kosong awalnya
  //   expect(urlInput).toBeEnabled();

  //   // Cek dropdown sumber
  //   const sourceSelect = screen.getByLabelText(/sumber komentar/i);
  //   expect(sourceSelect).toBeInTheDocument();
  //   expect(sourceSelect).toHaveValue("youtube"); // Default value
  //   expect(sourceSelect).toBeEnabled();
  //   expect(screen.getByRole("option", { name: "YouTube" })).toBeInTheDocument();

  //   // Cek tombol submit
  //   const submitButton = screen.getByRole("button", {
  //     name: /mulai analisis/i,
  //   });
  //   expect(submitButton).toBeInTheDocument();
  //   expect(submitButton).toBeDisabled(); // Disabled karena URL kosong

  //   // Cek ikon Play (cari SVG di dalam tombol)
  //   // 1. Pastikan ada SVG di dalam tombol
  //   const svgElement = submitButton.querySelector("svg");
  //   expect(svgElement).toBeInTheDocument();

  //   // 2. Pastikan SVG ini BUKAN spinner (tidak punya <circle>)
  //   const spinnerCircle = svgElement.querySelector("circle");
  //   expect(spinnerCircle).not.toBeInTheDocument();

  //   // Pastikan spinner (sebagai elemen terpisah) tidak ada
  //   const spinnerSvgCircleOuter = submitButton.querySelector("svg > circle");
  //   expect(spinnerSvgCircleOuter).not.toBeInTheDocument();
  // });

  // Tes 2: Interaksi Input URL
  it("should call setVideoUrl when typing in the URL input", async () => {
    render(<AnalysisSubmitForm {...defaultProps} />);
    const urlInput = screen.getByLabelText(/link video/i);
    const testUrl = "https://youtube.com/watch?v=abc";

    await user.type(urlInput, testUrl);

    // Verifikasi setVideoUrl dipanggil untuk setiap karakter
    expect(mockSetVideoUrl).toHaveBeenCalledTimes(testUrl.length);
  });

  // Tes 3: Tombol Submit Aktif setelah Input URL
  it("should enable submit button when videoUrl is not empty", () => {
    render(<AnalysisSubmitForm {...defaultProps} videoUrl="some-url" />); // Render dengan URL terisi
    const submitButton = screen.getByRole("button", {
      name: /mulai analisis/i,
    });
    expect(submitButton).toBeEnabled();
  });

  // Tes 4: Interaksi Klik Submit (ketika aktif)
  it("should call onSubmit when submit button is clicked and enabled", async () => {
    render(<AnalysisSubmitForm {...defaultProps} videoUrl="some-url" />);
    const submitButton = screen.getByRole("button", {
      name: /mulai analisis/i,
    });
    expect(submitButton).toBeEnabled(); // Pastikan enabled

    await user.click(submitButton);

    // Verifikasi onSubmit dipanggil
    expect(mockOnSubmit).toHaveBeenCalledTimes(1);
  });

  // Tes 5: State Loading
  it("should disable inputs/button, show spinner and loading message when isActionInProgress is true", () => {
    const loadingMsg = "Memulai analisis...";
    render(
      <AnalysisSubmitForm
        {...defaultProps}
        videoUrl="some-url" // Beri URL agar tombol tidak disabled karenanya
        isActionInProgress={true} // <-- State loading aktif
        loadingMessage={loadingMsg}
      />
    );

    // Cek input disabled
    expect(screen.getByLabelText(/link video/i)).toBeDisabled();
    // Cek select disabled
    expect(screen.getByLabelText(/sumber komentar/i)).toBeDisabled();

    // Cek tombol submit disabled dan teks/ikon berubah
    const submitButton = screen.getByRole("button", {
      name: /mulai analisis/i,
    }); // Gunakan aria-label asli
    expect(submitButton).toBeDisabled(); // Verifikasi disabled

    // Cek ikon spinner (cari SVG spinner di dalam tombol)
    const spinnerSvgCircle = submitButton.querySelector("svg > circle"); // Cari elemen unik spinner
    expect(spinnerSvgCircle).toBeInTheDocument();

    // Pastikan ikon play tidak ada
    const playIconSvg = submitButton.querySelector(
      'svg path[fill-rule="evenodd"]'
    );
    expect(playIconSvg).not.toBeInTheDocument();

    // Cek loading message muncul
    expect(screen.getByText(loadingMsg)).toBeInTheDocument();
    expect(screen.getByText(loadingMsg)).toHaveClass("animate-pulse");
  });

  // Tes 6: Loading message tidak muncul jika null
  it("should not render loading message when isActionInProgress is true but loadingMessage is null", () => {
    render(
      <AnalysisSubmitForm
        {...defaultProps}
        videoUrl="some-url"
        isActionInProgress={true}
        loadingMessage={null} // <-- Pesan loading null
      />
    );
    // Pastikan tidak ada elemen <p> dengan pesan loading
    // (Asumsi loadingMessage dirender dalam <p>)
    expect(
      screen.queryByText(/memproses.../i, { selector: "p" })
    ).not.toBeInTheDocument();
  });
});
