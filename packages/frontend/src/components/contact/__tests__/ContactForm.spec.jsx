import React from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ContactForm from "../ContactForm"; // <-- Adjust path

// --- 1. Mock Dependencies ---

// Mock 'framer-motion'
vi.mock("framer-motion", () => ({
  motion: {
    div: React.forwardRef(({ children, ...props }, ref) => (
      <div ref={ref} {...props}>
        {children}
      </div>
    )),
    button: React.forwardRef(({ children, ...props }, ref) => (
      <button ref={ref} {...props}>
        {children}
      </button>
    )),
  },
}));

// Mock 'lucide-react' (Send icon)
vi.mock("lucide-react", () => ({
  Send: (props) => <svg data-testid="send-icon" {...props} />,
}));

// Mock '@formspree/react' (ValidationError)
// We'll render the error if one for that field exists
vi.mock("@formspree/react", () => ({
  ValidationError: vi.fn(({ prefix, field, errors, className }) => {
    if (errors) {
      // Check for a specific field error
      if (field && errors[field]) {
        return (
          <div data-testid={`error-${field}`} className={className}>
            {prefix} Error: {errors[field]}
          </div>
        );
      }
      // Check for a global form error (no 'field' prop)
      if (!field && errors.formErrors?.length) {
        return (
          <div data-testid="error-global" className={className}>
            Global: {errors.formErrors[0].message}
          </div>
        );
      }
    }
    return null;
  }),
}));

// --- 2. Test Suite Setup ---

describe("Contact Form Component Testing", () => {
  const user = userEvent.setup();

  // Mock functions for props
  const mockOnSubmit = vi.fn((e) => e.preventDefault());
  const mockOnChange = vi.fn();

  // Default props for a clean, empty form
  const defaultProps = {
    formData: { name: "", email: "", subject: "", message: "" },
    isSubmitting: false,
    onSubmit: mockOnSubmit,
    onChange: mockOnChange,
    errors: null, // No errors by default
  };

  beforeEach(() => {
    vi.clearAllMocks(); // Clear mock call history
  });

  // --- 3. Test Cases ---

  // Test 1: Initial Render
  it("should render correctly with initial props", () => {
    render(<ContactForm {...defaultProps} />);

    // Check heading
    expect(
      screen.getByRole("heading", { name: /kirim pesan langsung/i })
    ).toBeInTheDocument();

    // Check form fields
    expect(screen.getByLabelText(/nama anda/i)).toBeEnabled();
    expect(screen.getByLabelText(/nama anda/i)).toHaveValue("");
    expect(screen.getByLabelText(/email anda/i)).toBeEnabled();
    expect(screen.getByLabelText(/email anda/i)).toHaveValue("");
    expect(screen.getByLabelText(/subjek/i)).toBeEnabled();
    expect(screen.getByLabelText(/subjek/i)).toHaveValue("");
    expect(screen.getByLabelText(/pesan anda/i)).toBeEnabled();
    expect(screen.getByLabelText(/pesan anda/i)).toHaveValue("");

    // Check submit button
    const submitButton = screen.getByRole("button", { name: /kirim pesan/i });
    expect(submitButton).toBeEnabled();
    expect(within(submitButton).getByTestId("send-icon")).toBeInTheDocument();
    expect(screen.queryByText(/mengirim.../i)).not.toBeInTheDocument();

    // Check that no errors are displayed
    expect(screen.queryByTestId(/error-/i)).not.toBeInTheDocument();
  });

  // Test 2: Pre-filled Data
  it("should render with pre-filled formData", () => {
    const filledData = {
      name: "Test User",
      email: "test@example.com",
      subject: "Testing",
      message: "Hello World",
    };
    render(<ContactForm {...defaultProps} formData={filledData} />);

    expect(screen.getByLabelText(/nama anda/i)).toHaveValue(filledData.name);
    expect(screen.getByLabelText(/email anda/i)).toHaveValue(filledData.email);
    expect(screen.getByLabelText(/subjek/i)).toHaveValue(filledData.subject);
    expect(screen.getByLabelText(/pesan anda/i)).toHaveValue(
      filledData.message
    );
  });

  // Test 3: Input Interaction (onChange)
  // it("should call onChange prop with correct event when user types", async () => {
  //   render(<ContactForm {...defaultProps} />);

  //   const nameInput = screen.getByLabelText(/nama anda/i);
  //   await user.type(nameInput, "Budi");

  //   // Test that the handler was called 4 times (B-u-d-i)
  //   expect(mockOnChange).toHaveBeenCalledTimes(4);

  //   // Test the *last* event object that was passed to the handler
  //   const lastEvent = mockOnChange.mock.calls[3][0]; // 4th call is at index 3
  //   expect(lastEvent.target.name).toBe("name");
  //   // We check the event value, not the DOM value (which doesn't change)
  //   expect(lastEvent.target.value).toBe("Budi");
  // });

  // Test 4: Submit Interaction (onSubmit)
  it("should call onSubmit prop when form is submitted", async () => {
    render(<ContactForm {...defaultProps} />);
    const submitButton = screen.getByRole("button", { name: /kirim pesan/i });

    await user.click(submitButton);

    expect(mockOnSubmit).toHaveBeenCalledTimes(1);
  });

  // Test 5: Submitting State
  it("should disable inputs/button and show loading state when isSubmitting is true", () => {
    render(<ContactForm {...defaultProps} isSubmitting={true} />);

    // Check all inputs are disabled
    expect(screen.getByLabelText(/nama anda/i)).toBeDisabled();
    expect(screen.getByLabelText(/email anda/i)).toBeDisabled();
    expect(screen.getByLabelText(/subjek/i)).toBeDisabled();
    expect(screen.getByLabelText(/pesan anda/i)).toBeDisabled();

    // Check submit button
    const submitButton = screen.getByRole("button", { name: /mengirim.../i });
    expect(submitButton).toBeDisabled();

    // Check spinner icon (by checking for its specific class)
    const spinner = submitButton.querySelector("div.animate-spin");
    expect(spinner).toBeInTheDocument();
    expect(screen.queryByTestId("send-icon")).not.toBeInTheDocument();
  });

  // Test 6: Error State
  // it("should display errors when errors prop is provided", () => {
  //   const mockErrors = {
  //     // Field-specific error
  //     email: ["Email is required"],
  //     // Global form error
  //     formErrors: [{ message: "Failed to send" }],
  //   };

  //   render(<ContactForm {...defaultProps} errors={mockErrors} />);

  //   // Check for the field-specific error (rendered by our mock)
  //   expect(
  //     screen.getByTestId("validation-error-for-email")
  //   ).toBeInTheDocument();
  //   expect(screen.getByText(/email error/i)).toBeInTheDocument();

  //   // Check for the global error (rendered by our mock)
  //   expect(screen.getByTestId("validation-error-for-form")).toBeInTheDocument();
  //   expect(screen.getByText(/global: failed to send/i)).toBeInTheDocument();

  //   // Check that other error fields are not rendered
  //   expect(
  //     screen.queryByTestId("validation-error-for-name")
  //   ).not.toBeInTheDocument();
  // });
});
