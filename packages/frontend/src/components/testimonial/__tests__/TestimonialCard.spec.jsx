import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import TestimonialCard from "../TestimonialCard";

// --- Mocking Dependencies ---

// 1. Mock 'framer-motion'
vi.mock("framer-motion", () => ({
  motion: {
    // Ganti motion.div dengan div biasa
    div: React.forwardRef(({ children, ...props }, ref) => (
      <div ref={ref} {...props}>
        {children}
      </div>
    )),
  },
}));

// --- Mock Data ---

// 2. Buat data testimonial tiruan untuk tes
const mockTestimonial = {
  id: 1, // Tambahkan ID jika komponen membutuhkannya sebagai key (meski tidak di-render)
  quote: "Ini adalah kutipan testimoni yang bagus.",
  author: "Budi Doremi",
  title: "Pengguna Setia",
  avatarUrl: "https://example.com/avatar.jpg",
};

// --- Test Suite ---

describe("Testimonial Card Component Testing", () => {
  // Render komponen sebelum setiap tes
  beforeEach(() => {
    render(<TestimonialCard testimonial={mockTestimonial} />);
  });

  it("should render the testimonial quote correctly", () => {
    // Cari elemen berdasarkan teks kutipan (gunakan regex untuk fleksibilitas)
    const quoteElement = screen.getByText(`“${mockTestimonial.quote}”`);
    expect(quoteElement).toBeInTheDocument();
    // Pastikan itu adalah elemen <p>
    expect(quoteElement.tagName).toBe("P");
  });

  it("should render the author's name correctly", () => {
    const authorElement = screen.getByText(mockTestimonial.author);
    expect(authorElement).toBeInTheDocument();
  });

  it("should render the author's title correctly", () => {
    const titleElement = screen.getByText(mockTestimonial.title);
    expect(titleElement).toBeInTheDocument();
  });

  it("should render the avatar image with correct src and alt attributes", () => {
    // Cari gambar berdasarkan teks alt
    const avatarImage = screen.getByAltText(mockTestimonial.author);
    expect(avatarImage).toBeInTheDocument();
    // Pastikan atribut src benar
    expect(avatarImage).toHaveAttribute("src", mockTestimonial.avatarUrl);
    // Pastikan itu adalah elemen <img>
    expect(avatarImage.tagName).toBe("IMG");
  });
});
