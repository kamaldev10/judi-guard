import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ThemeProvider } from "../ThemeProvider";

// Mock the underlying provider from next-themes
// We don't need to test next-themes itself, just that our provider passes children
vi.mock("next-themes", () => ({
  ThemeProvider: ({ children }) => (
    <div data-testid="mock-next-themes-provider">{children}</div>
  ),
}));

describe("Theme Provider Component Testing", () => {
  it("should render children passed to it", () => {
    const testMessage = "Hello World";
    render(
      <ThemeProvider>
        <p>{testMessage}</p>
      </ThemeProvider>
    );

    // Check if the mock provider is rendered
    expect(screen.getByTestId("mock-next-themes-provider")).toBeInTheDocument();

    // Check if the child content is rendered inside
    expect(screen.getByText(testMessage)).toBeInTheDocument();
  });
});
