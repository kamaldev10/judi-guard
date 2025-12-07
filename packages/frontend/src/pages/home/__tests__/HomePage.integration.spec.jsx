import React from "react";
import { render, screen, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import HomePage from "../HomePage";

// --- 2. Mocking Dependencies ---

// Mock all child components
vi.mock("@/components/homepage/HeroSection", () => ({
  default: vi.fn(() => <div data-testid="mock-hero-section">Hero Section</div>),
}));
vi.mock("@/components/homepage/ContactSection", () => ({
  default: vi.fn(() => (
    <div data-testid="mock-contact-section">Contact Section</div>
  )),
}));
vi.mock("@/components/homepage/ConnectSection", () => ({
  default: vi.fn(() => (
    <div data-testid="mock-connect-section">Connect Section</div>
  )),
}));
vi.mock("@/components/homepage/TextPredictSection", () => ({
  default: vi.fn(() => (
    <div data-testid="mock-text-predict-section">Text Predict Section</div>
  )),
}));
vi.mock("@/components/fun-fact/FunFactsSection", () => ({
  default: vi.fn(() => (
    <div data-testid="mock-fun-facts-section">Fun Facts Section</div>
  )),
}));
vi.mock("@/components/homepage/TestimonialsSection", () => ({
  default: vi.fn(() => (
    <div data-testid="mock-testimonials-section">Testimonials Section</div>
  )),
}));

// --- 3. Mock Browser APIs ---
// Mock scrollIntoView
const mockScrollIntoView = vi.fn();
window.HTMLElement.prototype.scrollIntoView = mockScrollIntoView;

// Mock getElementById
const mockGetElementById = vi.fn();
const originalGetElementById = document.getElementById; // Store original
document.getElementById = mockGetElementById;

// --- Test Suite ---
describe("HomePage Integration Test", () => {
  // Helper render
  const renderPage = (route = "/") => {
    return render(
      <MemoryRouter initialEntries={[route]}>
        <HomePage />
      </MemoryRouter>
    );
  };

  beforeEach(() => {
    vi.useFakeTimers(); // Use fake timers for setTimeout
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers(); // Restore real timers
  });

  // Test 1: Initial Render
  it("should render all section components correctly", () => {
    renderPage();

    // Check that all 6 mock sections are rendered
    expect(screen.getByTestId("mock-hero-section")).toBeInTheDocument();
    expect(screen.getByTestId("mock-text-predict-section")).toBeInTheDocument();
    expect(screen.getByTestId("mock-fun-facts-section")).toBeInTheDocument();
    expect(screen.getByTestId("mock-connect-section")).toBeInTheDocument();
    expect(screen.getByTestId("mock-testimonials-section")).toBeInTheDocument();
    expect(screen.getByTestId("mock-contact-section")).toBeInTheDocument();
  });

  // Test 2: Default Scrolling (to hero-section)
  it("should scroll to the 'hero-section' by default on load (no hash)", () => {
    renderPage("/"); // Render without a hash

    // Advance the timer by 100ms
    act(() => {
      vi.advanceTimersByTime(100);
    });

    // Check if scrollIntoView was called (by the ref logic)
    expect(mockScrollIntoView).toHaveBeenCalledTimes(1);
    expect(mockScrollIntoView).toHaveBeenCalledWith({ behavior: "smooth" });

    // Check that getElementById was NOT called
    expect(mockGetElementById).not.toHaveBeenCalled();
  });

  // Test 3: Hash Scrolling (to contact-section)
  it("should scroll to the 'contact-section' when hash is provided", () => {
    // Arrange: Mock getElementById to return a fake element
    const fakeElement = { scrollIntoView: mockScrollIntoView };
    mockGetElementById.mockReturnValue(fakeElement);

    renderPage("/#contact-section"); // Render *with* a hash

    // Advance the timer by 100ms
    act(() => {
      vi.advanceTimersByTime(100);
    });

    // Check if getElementById was called with the correct ID
    expect(mockGetElementById).toHaveBeenCalledTimes(1);
    expect(mockGetElementById).toHaveBeenCalledWith("contact-section");

    // Check if scrollIntoView was called (by the getElementById logic)
    expect(mockScrollIntoView).toHaveBeenCalledTimes(1);
    expect(mockScrollIntoView).toHaveBeenCalledWith({ behavior: "smooth" });
  });

  // Test 4: Hash logic overrides default scroll
  it("should only scroll to hash, not to hero-section, if hash is present", () => {
    // Arrange
    const fakeElement = { scrollIntoView: mockScrollIntoView };
    mockGetElementById.mockReturnValue(fakeElement);

    renderPage("/#contact-section");

    act(() => {
      vi.advanceTimersByTime(100);
    });

    // Assert: Both getElementById and scrollIntoView are called once
    expect(mockGetElementById).toHaveBeenCalledTimes(1);
    expect(mockScrollIntoView).toHaveBeenCalledTimes(1);
    // The `return` in the `if (location.hash)` block should prevent
    // the default scroll-to-hero logic from running.
  });

  // Test 5: No Scroll on Invalid Hash
  it("should not scroll if hash is present but element does not exist", () => {
    // Arrange: Mock getElementById to return null
    mockGetElementById.mockReturnValue(null);

    renderPage("/#invalid-id");

    // Advance the timer
    act(() => {
      vi.advanceTimersByTime(100);
    });

    // Assert: getElementById was called
    expect(mockGetElementById).toHaveBeenCalledWith("invalid-id");

    // Assert: scrollIntoView was NOT called
    expect(mockScrollIntoView).not.toHaveBeenCalled();
  });
});
