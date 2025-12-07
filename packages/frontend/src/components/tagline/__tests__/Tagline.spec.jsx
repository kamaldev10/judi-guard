import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Tagline from "../Tagline";

describe("Tagline Component Testing", () => {
  // Tes 1: Verifikasi konten teks
  it("should render the correct tagline text", () => {
    render(<Tagline />);

    // Cari elemen <p> (paragraf) berdasarkan teks di dalamnya
    const taglineText = screen.getByText(
      /Membantu Anda Menjaga Ruang Digital Tetap Aman/i
    );

    // Pastikan elemen itu ada di dokumen
    expect(taglineText).toBeInTheDocument();
  });

  // Tes 2: Verifikasi prop className kustom
  it("should apply custom className when provided", () => {
    const customClass = "my-custom-class";
    render(<Tagline className={customClass} />);

    // Dapatkan elemennya lagi
    const taglineElement = screen.getByText(
      /Membantu Anda Menjaga Ruang Digital Tetap Aman/i
    );

    // Verifikasi bahwa class kustom ada di dalam daftar class elemen
    expect(taglineElement).toHaveClass(customClass);

    // (Opsional) Verifikasi bahwa class bawaan juga tetap ada
    expect(taglineElement).toHaveClass("italic");
    expect(taglineElement).toHaveClass("text-center");
  });
});
