import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { HeadProvider, Title } from "react-head";
import NotFoundPage from "../NotFound";
import { NotFoundImage } from "@/assets/images";

// --- 4. Mocking Dependencies ---

// Mock 'react-head' (Title component)
vi.mock("react-head", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    Title: ({ children }) => {
      // Set document title for testing
      document.title = children;
      return null;
    },
  };
});

// Mock the image asset
vi.mock("@/assets/images", () => ({
  NotFoundImage: "mock-not-found-image.png",
}));

// --- Test Suite ---

describe("Not Found Page Integration Testing", () => {
  // Helper render function
  const renderPage = (props = {}) => {
    return render(
      <HeadProvider>
        <MemoryRouter>
          <NotFoundPage {...props} />
        </MemoryRouter>
      </HeadProvider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    document.title = ""; // Reset document title
  });

  // Test 1: Check rendering with default props
  it("should render correctly with default props", () => {
    renderPage();

    // 1. Check document title
    expect(document.title).toBe("Halaman Tidak Ditemukan | Judi Guard");

    // 2. Check default heading
    expect(
      screen.getByRole("heading", { name: /oops! halaman tidak ditemukan/i })
    ).toBeInTheDocument();

    // 3. Check default message
    expect(
      screen.getByText(/maaf, halaman yang anda cari tidak ada/i)
    ).toBeInTheDocument();

    // 4. Check default image (from mock)
    const image = screen.getByAltText("Halaman Tidak Ditemukan");
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute("src", "mock-not-found-image.png");

    // 5. Check the "Back to Home" link
    const homeLink = screen.getByRole("link", {
      name: /kembali ke home page/i,
    });
    expect(homeLink).toBeInTheDocument();
    expect(homeLink).toHaveAttribute("href", "/");
  });

  // Test 2: Check rendering with custom props
  it("should render correctly with custom props", () => {
    const customProps = {
      imageUrl: "custom-image.png",
      imageAlt: "Alt Kustom",
      title: "404 Kustom",
      message: "Pesan error kustom.",
    };

    renderPage(customProps);

    // 1. Check custom heading
    expect(
      screen.getByRole("heading", { name: customProps.title })
    ).toBeInTheDocument();

    // 2. Check custom message
    expect(screen.getByText(customProps.message)).toBeInTheDocument();

    // 3. Check custom image
    const image = screen.getByAltText(customProps.imageAlt);
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute("src", customProps.imageUrl);

    // 4. Default title and link should still be correct
    expect(document.title).toBe("Halaman Tidak Ditemukan | Judi Guard");
    expect(
      screen.getByRole("link", { name: /kembali ke home page/i })
    ).toBeInTheDocument();
  });
});
