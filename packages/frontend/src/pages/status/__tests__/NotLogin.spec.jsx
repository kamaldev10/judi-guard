import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import NotLogin from "../NotLogin";
import { NotLoginImage } from "@/assets/images";

// --- Mocking Dependencies ---

// 1. Mock the image asset
vi.mock("@/assets/images", () => ({
  NotLoginImage: "mock-not-login-image.png",
}));

// --- Test Suite ---

describe("Not Login Component Testing", () => {
  // Render the component once before each test
  beforeEach(() => {
    render(<NotLogin />);
  });

  it("should render the main heading", () => {
    // Check for the level 2 heading with the specific text
    expect(
      screen.getByRole("heading", { level: 2, name: /anda belum login/i })
    ).toBeInTheDocument();
  });

  it("should render the descriptive paragraphs", () => {
    // Check for the descriptive texts
    expect(
      screen.getByText(/untuk mengakses fitur ini, anda perlu login/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/silakan kembali ke halaman login atau daftar/i)
    ).toBeInTheDocument();
  });

  it("should render the image with correct alt text and mocked src", () => {
    // Find the image by its alt text
    const image = screen.getByAltText("Not Login Image");
    expect(image).toBeInTheDocument();

    // Verify the src attribute points to our mock
    expect(image).toHaveAttribute("src", "mock-not-login-image.png");
  });

  it("should not render the login button (since it is commented out)", () => {
    // Use queryByRole as it returns null instead of throwing an error if not found
    // This confirms the button is not part of the rendered output
    expect(
      screen.queryByRole("button", { name: /login sekarang/i })
    ).not.toBeInTheDocument();
  });
});
