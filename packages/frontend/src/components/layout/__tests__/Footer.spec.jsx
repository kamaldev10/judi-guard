import React from "react";
import { render, screen } from "@testing-library/react";

import { describe, it, expect } from "vitest";
import { MemoryRouter } from "react-router-dom";
import Footer from "../Footer";

// --- Test Suite ---

describe("Footer Component Testing", () => {
  // Helper function untuk me-render dengan Router
  const renderWithRouter = (ui, { route = "/" } = {}) => {
    window.history.pushState({}, "Test page", route);
    return render(ui, { wrapper: MemoryRouter });
  };

  // Tes 1: Konten Statis Utama (Tidak Berubah)
  it("should render main static content like title and descriptions", () => {
    renderWithRouter(<Footer />);
    expect(
      screen.getByRole("heading", { level: 1, name: /judi guard/i })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/platform pendeteksi komentar spam judi/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/say goodbye to spam judi/i)).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: /navigasi/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: /bantuan/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: /berlangganan/i })
    ).toBeInTheDocument();
    const currentYear = new Date().getFullYear();
    expect(
      screen.getByText(`© ${currentYear} Judi Guard v1.0.0`, { exact: false })
    ).toBeInTheDocument();
    expect(screen.getByText(/all rights reserved/i)).toBeInTheDocument();
  });

  // Tes 2: Link Navigasi (Tidak Berubah)
  it("should render navigation links with correct href attributes", () => {
    renderWithRouter(<Footer />);
    expect(screen.getByRole("link", { name: /beranda/i })).toHaveAttribute(
      "href",
      "/"
    );
    expect(screen.getByRole("link", { name: /tentang kami/i })).toHaveAttribute(
      "href",
      "/about-us"
    );
    expect(screen.getByRole("link", { name: /analisis/i })).toHaveAttribute(
      "href",
      "/analysis"
    );
    expect(screen.getByRole("link", { name: /profil/i })).toHaveAttribute(
      "href",
      "/profile"
    );
  });

  // Tes 3: Link Bantuan (Diperbarui)
  it("should render help links with correct href attributes", () => {
    renderWithRouter(<Footer />);

    // Cek link Bantuan
    const faqLink = screen.getByRole("link", { name: /faq/i });
    expect(faqLink).toBeInTheDocument();
    expect(faqLink).toHaveAttribute("href", "/#faq");

    const contactLink = screen.getByRole("link", { name: /kontak kami/i });
    expect(contactLink).toBeInTheDocument();
    expect(contactLink).toHaveAttribute("href", "/#contact-section");
  });

  // Tes 4: Form Newsletter (Tidak Berubah)
  it("should render the newsletter form", () => {
    renderWithRouter(<Footer />);
    expect(screen.getByPlaceholderText(/email anda/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /langganan/i })
    ).toBeInTheDocument();
  });
});
