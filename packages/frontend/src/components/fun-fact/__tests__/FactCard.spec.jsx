import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { FactCard } from "../FactCard";

// --- Mocking Dependencies ---

// 1. Mock 'framer-motion'
vi.mock("framer-motion", () => ({
  motion: {
    // Ganti semua elemen motion dengan elemen HTML biasa
    div: React.forwardRef(({ children, ...props }, ref) => (
      <div ref={ref} {...props}>
        {children}
      </div>
    )),
    span: React.forwardRef(({ children, ...props }, ref) => (
      <span ref={ref} {...props}>
        {children}
      </span>
    )),
    h3: React.forwardRef(({ children, ...props }, ref) => (
      <h3 ref={ref} {...props}>
        {children}
      </h3>
    )),
    p: React.forwardRef(({ children, ...props }, ref) => (
      <p ref={ref} {...props}>
        {children}
      </p>
    )),
  },
}));

// --- Mock Data ---

// 2. Buat data 'fact' tiruan
const mockFact = {
  icon: "💡",
  title: "Judul Fakta",
  text: "Ini adalah teks penjelasan fakta.",
  image: "gambar-fakta.jpg",
};

// --- Test Suite ---

describe("FactCard Component", () => {
  // Render komponen sebelum setiap tes
  beforeEach(() => {
    render(<FactCard fact={mockFact} />);
  });

  it("should render the fact image correctly", () => {
    // Cari gambar berdasarkan alt text (yang sama dengan title)
    const image = screen.getByAltText(mockFact.title);
    expect(image).toBeInTheDocument();
    // Pastikan src benar
    expect(image).toHaveAttribute("src", mockFact.image);
    // Pastikan tag-nya <img>
    expect(image.tagName).toBe("IMG");
  });

  it("should render the fact icon correctly", () => {
    // Cari elemen span yang berisi ikon
    const iconElement = screen.getByText(mockFact.icon);
    expect(iconElement).toBeInTheDocument();
    // Pastikan tag-nya <span>
    expect(iconElement.tagName).toBe("SPAN");
  });

  it("should render the fact title correctly", () => {
    // Cari heading level 3 berdasarkan teks title
    const titleElement = screen.getByRole("heading", {
      level: 3,
      name: mockFact.title,
    });
    expect(titleElement).toBeInTheDocument();
  });

  it("should render the fact text correctly", () => {
    // Cari paragraf berdasarkan teksnya
    const textElement = screen.getByText(mockFact.text);
    expect(textElement).toBeInTheDocument();
    // Pastikan tag-nya <p>
    expect(textElement.tagName).toBe("P");
  });
});
