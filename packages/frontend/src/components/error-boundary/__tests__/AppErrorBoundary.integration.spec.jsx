import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach, afterAll } from "vitest";
import AppErrorBoundary from "../AppErrorBoundary";
import ErrorFallback from "../ErrorFallback";

// --- Mock Dependencies ---

// 1. Mock the ErrorFallback component
//    We render the error message and reset button to test interactions.
vi.mock("../ErrorFallback", () => ({
  default: vi.fn(({ error, resetErrorBoundary }) => (
    <div data-testid="mock-fallback">
      <h1>Error: {error.message}</h1>
      <button onClick={resetErrorBoundary}>Reset</button>
    </div>
  )),
}));

// 2. Mock window.location.reload for the onReset test
//    and spy on console.error for the onError test
const originalLocation = window.location;
const originalConsoleError = console.error;
const mockReload = vi.fn();
const mockConsoleError = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  // Silence console.error for failing tests
  console.error = mockConsoleError;
  // Mock window.location
  delete window.location;
  window.location = { ...originalLocation, reload: mockReload };
});

afterAll(() => {
  // Restore globals
  window.location = originalLocation;
  console.error = originalConsoleError;
});

// --- Helper Components for Testing ---

// 3. A component that renders correctly
const GoodChild = () => <div>This is fine.</div>;

// 4. A component that throws an error
const ProblemChild = () => {
  throw new Error("This is a test error");
};

// --- Test Suite ---

describe("App Error Boundary Integration Testing", () => {
  const user = userEvent.setup();

  // Test 1: Happy Path (No Error)
  it("should render children correctly when there is no error", () => {
    render(
      <AppErrorBoundary>
        <GoodChild />
      </AppErrorBoundary>
    );

    // Verify the child component is visible
    expect(screen.getByText("This is fine.")).toBeInTheDocument();

    // Verify the fallback component is NOT visible
    expect(screen.queryByTestId("mock-fallback")).not.toBeInTheDocument();
  });

  // Test 2: Error Path (Catches Error)
  it("should render the ErrorFallback when a child throws an error", () => {
    render(
      <AppErrorBoundary>
        <ProblemChild />
      </AppErrorBoundary>
    );

    // Verify the fallback component IS visible
    expect(screen.getByTestId("mock-fallback")).toBeInTheDocument();

    // Verify the fallback received the correct error prop
    expect(screen.getByText("Error: This is a test error")).toBeInTheDocument();

    // Verify the original child is NOT visible
    expect(screen.queryByText("This is fine.")).not.toBeInTheDocument();
  });

  // Test 3: onError Prop
  it("should call console.error via the onError prop when an error is caught", () => {
    render(
      <AppErrorBoundary>
        <ProblemChild />
      </AppErrorBoundary>
    );

    // Verify console.error was called by the onError handler
    expect(mockConsoleError).toHaveBeenCalledTimes(2); // react mungkin memanggil error 2 kali
    expect(mockConsoleError).toHaveBeenCalledWith(
      "Unhandled error:",
      expect.any(Error), // The error object
      expect.any(Object) // The componentStack info
    );
  });

  // Test 4: onReset Prop
  it("should call window.location.reload when the fallback's reset function is triggered", async () => {
    render(
      <AppErrorBoundary>
        <ProblemChild />
      </AppErrorBoundary>
    );

    // Find the reset button inside our mock fallback
    const resetButton = screen.getByRole("button", { name: /reset/i });

    // Click the reset button
    await user.click(resetButton);

    // Verify the onReset prop (which calls window.location.reload) was triggered
    expect(mockReload).toHaveBeenCalledTimes(1);
  });
});
