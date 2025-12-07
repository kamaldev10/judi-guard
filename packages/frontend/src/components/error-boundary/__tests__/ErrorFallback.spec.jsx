import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import ErrorFallback from "../ErrorFallback";

// --- Mock Dependencies ---

// 1. Mock the image import
vi.mock("@/assets/images", () => ({
  ErrorImage: "mock-error-image.png",
}));

// 2. Mock window.location for the "Back to Home" button test
const originalLocation = window.location;
beforeEach(() => {
  // Create a mutable mock for window.location
  delete window.location;
  window.location = {
    ...originalLocation, // Keep original properties
    href: "", // Mock the href property
    assign: vi.fn(), // Mock the assign method (often used for navigation)
  };
});

afterEach(() => {
  // Restore the original window.location after each test
  window.location = originalLocation;
  vi.clearAllMocks();
});

// --- Test Suite ---

describe("Error Fallback Component Testing", () => {
  const user = userEvent.setup();
  const mockError = new Error("This is a test error message");
  const mockResetErrorBoundary = vi.fn();

  beforeEach(() => {
    // Render the component with mock props before each test
    render(
      <ErrorFallback
        error={mockError}
        resetErrorBoundary={mockResetErrorBoundary}
      />
    );
  });

  it("should render all static text content", () => {
    expect(
      screen.getByRole("heading", { name: /oops! ada sesuatu yang salah/i })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/terjadi kesalahan yang tidak terduga/i)
    ).toBeInTheDocument();
  });

  it("should render the error image with correct alt text", () => {
    const image = screen.getByAltText(/ilustrasi terjadi kesalahan/i);
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute("src", "mock-error-image.png");
  });

  it("should display the error message from the error prop", () => {
    // Verifies that the specific error message is shown
    expect(screen.getByText(mockError.message)).toBeInTheDocument();
  });

  it("should render the 'Back to Home' button", () => {
    expect(
      screen.getByRole("button", { name: /kembali ke beranda/i })
    ).toBeInTheDocument();
  });

  it("should call resetErrorBoundary when 'Reload Page' button is clicked", async () => {
    const reloadButton = screen.getByRole("button", {
      name: /muat ulang halaman/i,
    });

    // Simulate user click
    await user.click(reloadButton);

    // Verify the prop function was called
    expect(mockResetErrorBoundary).toHaveBeenCalledTimes(1);
  });

  it("should attempt to navigate to home when 'Back to Home' button is clicked", async () => {
    const homeButton = screen.getByRole("button", {
      name: /kembali ke beranda/i,
    });

    // Simulate user click
    await user.click(homeButton);

    // Verify the component tried to change the window location
    // We check 'href' because the code directly assigns to it
    expect(window.location.href).toBe("/");
  });
});
