import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import TextPredictSection from "../TextPredictSection";

// --- Mock Child Component ---

// 1. Mock TextPredictForm
//    Replace it with a simple placeholder with a data-testid
vi.mock("@/components/text-predict/TextPredictForm", () => ({
  default: () => <div data-testid="mock-text-predict-form">Mock Form</div>,
}));

// --- Test Suite ---

describe("Text Predict Section Component", () => {
  // Render the component before each test
  beforeEach(() => {
    render(<TextPredictSection />);
  });

  it("should render the main heading", () => {
    expect(
      screen.getByRole("heading", { level: 1, name: /judi guard ai/i })
    ).toBeInTheDocument();
  });

  it("should render the description text", () => {
    expect(
      screen.getByText(
        /alat canggih untuk menganalisis dan memahami teks terkait perjudian/i
      )
    ).toBeInTheDocument();
  });

  it("should render the TextPredictForm component (mocked)", () => {
    // Check if the mock component's placeholder is rendered
    expect(screen.getByTestId("mock-text-predict-form")).toBeInTheDocument();
    // (Optional) Check the placeholder text
    expect(screen.getByText("Mock Form")).toBeInTheDocument();
  });
});
