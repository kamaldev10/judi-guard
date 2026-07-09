import React from 'react';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import ContactSection from '../ContactSection'; // <-- Adjust path
import ContactInfoList from '@/components/contact/ContactInfoList'; // Import for mocking
import ContactForm from '@/components/contact/ContactForm'; // Import for mocking
import { useForm } from '@formspree/react';
import { toast } from 'react-toastify';
import * as LucideReact from 'lucide-react';

// --- 1. Mock Dependencies ---

// Mock 'framer-motion'
vi.mock('framer-motion', () => ({
  motion: {
    div: React.forwardRef(({ children, ...props }, ref) => (
      <div ref={ref} {...props}>
        {children}
      </div>
    )),
    h2: React.forwardRef(({ children, ...props }, ref) => (
      <h2 ref={ref} {...props}>
        {children}
      </h2>
    )),
  },
}));

// Mock 'lucide-react' icons (used in ContactInfoList)
vi.mock('lucide-react', () => ({
  Mail: (props) => <svg data-testid="mail-icon" {...props} />,
  Phone: (props) => <svg data-testid="phone-icon" {...props} />,
  MapPin: (props) => <svg data-testid="map-pin-icon" {...props} />,
  Send: (props) => <svg data-testid="send-icon" {...props} />, // Also mock Send for ContactForm
}));

// Mock 'react-toastify'
vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
  },
}));

// Mock Child Components
vi.mock('@/components/contact/ContactInfoList', () => ({
  default: vi.fn(() => <div data-testid="mock-contact-info">Info List</div>),
}));

// Mock ContactForm (interactive)
vi.mock('@/components/contact/ContactForm', () => ({
  default: vi.fn(({ formData, isSubmitting, onChange, onSubmit }) => (
    <form data-testid="mock-contact-form" onSubmit={onSubmit}>
      <input aria-label="name-input" name="name" value={formData.name} onChange={onChange} />
      <input aria-label="email-input" name="email" value={formData.email} onChange={onChange} />
      {/* Add other inputs if needed for testing */}
      <button type="submit" disabled={isSubmitting}>
        Submit Mock
      </button>
    </form>
  )),
}));

// Mock '@formspree/react' (useForm hook)
const mockFormspreeHandleSubmit = vi.fn((e) => e.preventDefault());
let mockFormspreeState = {
  submitting: false,
  succeeded: false,
  errors: null,
};
vi.mock('@formspree/react', () => ({
  useForm: vi.fn(() => [mockFormspreeState, mockFormspreeHandleSubmit]),
}));

// --- 2. Get Typed References ---
/** @type {import('vitest').Mock} */
const MockContactForm = ContactForm;
/** @type {import('vitest').Mock} */
const MockContactInfoList = ContactInfoList;

// --- 3. Test Suite ---
describe('Contact Section Integration Testing', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset Formspree state before each test
    mockFormspreeState = {
      submitting: false,
      succeeded: false,
      errors: null,
    };
    // Ensure the mock implementation uses the reset state
    vi.mocked(useForm).mockReturnValue([mockFormspreeState, mockFormspreeHandleSubmit]);
  });

  // Test 1: Initial Render
  // it("should render correctly and pass initial props to children", () => {
  //   render(<ContactSection />);

  //   // Check static content
  //   expect(
  //     screen.getByRole("heading", { name: /hubungi kami/i })
  //   ).toBeInTheDocument();

  //   // Check children are rendered
  //   expect(screen.getByTestId("mock-contact-info")).toBeInTheDocument();
  //   expect(screen.getByTestId("mock-contact-form")).toBeInTheDocument();

  //   // Check props passed to ContactInfoList
  //   expect(MockContactInfoList).toHaveBeenCalledWith(
  //     expect.objectContaining({
  //       contactInfo: expect.any(Array),
  //     }),
  //     expect.anything()
  //   );
  //   expect(MockContactInfoList.mock.calls[0][0].contactInfo.length).toBe(3);

  //   // Check props passed to ContactForm
  //   expect(MockContactForm).toHaveBeenCalledWith(
  //     expect.objectContaining({
  //       formData: { name: "", email: "", subject: "", message: "" },
  //       isSubmitting: false,
  //       onSubmit: mockFormspreeHandleSubmit, // Verifies the handler is passed
  //     }),
  //     expect.anything()
  //   );
  // });

  // Test 2: Input Change (State managed by ContactSection)
  it('should update formData state when onChange is triggered', async () => {
    render(<ContactSection />);

    const nameInput = screen.getByLabelText('name-input');

    // Simulate typing
    await user.type(nameInput, 'Budi');

    // Check the *last* props received by the mock form
    const lastProps = MockContactForm.mock.calls[MockContactForm.mock.calls.length - 1][0];

    // Verify the formData state in ContactSection was updated
    expect(lastProps.formData.name).toBe('Budi');
  });

  // Test 3: Form Submit (Managed by Formspree)
  it('should call the handleSubmit from useForm when form is submitted', async () => {
    render(<ContactSection />);

    const submitButton = screen.getByRole('button', { name: 'Submit Mock' });

    await user.click(submitButton);

    // Verify the mock handleSubmit from useForm was called
    expect(mockFormspreeHandleSubmit).toHaveBeenCalledTimes(1);
  });

  // Test 4: Formspree Submitting State
  // it("should pass isSubmitting=true to ContactForm when state.submitting is true", () => {
  //   // Arrange: Set mock state
  //   mockFormspreeState = { submitting: true, succeeded: false, errors: null };
  //   vi.mocked(useForm).mockReturnValue([
  //     mockFormspreeState,
  //     mockFormspreeHandleSubmit,
  //   ]);

  //   render(<ContactSection />);

  //   // Assert: Check props passed to ContactForm
  //   expect(MockContactForm).toHaveBeenCalledWith(
  //     expect.objectContaining({
  //       isSubmitting: true,
  //     }),
  //     expect.anything()
  //   );
  // });

  // // Test 5: Formspree Success State (useEffect trigger)
  // it("should call toast.success and reset form when state.succeeded becomes true", () => {
  //   // Arrange: Render component in its initial state
  //   const { rerender } = render(<ContactSection />);

  //   // Act: Type into the form (so it has data to reset)
  //   // We must 'act' here to update the state
  //   act(() => {
  //     const nameInput = screen.getByLabelText("name-input");
  //     // We call the 'onChange' prop directly to simulate typing
  //     nameInput.onchange({ target: { name: "name", value: "Test User" } });
  //   });

  //   // Re-render to reflect the typed state
  //   rerender(<ContactSection />);

  //   // Verify form has data
  //   let lastProps =
  //     MockContactForm.mock.calls[MockContactForm.mock.calls.length - 1][0];
  //   expect(lastProps.formData.name).toBe("Test User");

  //   // --- Act 2: Simulate Formspree success ---
  //   // Change the mock state
  //   mockFormspreeState = { submitting: false, succeeded: true, errors: null };
  //   vi.mocked(useForm).mockReturnValue([
  //     mockFormspreeState,
  //     mockFormspreeHandleSubmit,
  //   ]);

  //   // Re-render the component. This will trigger the useEffect.
  //   rerender(<ContactSection />);

  //   // Assert: Check that the useEffect actions occurred
  //   expect(toast.success).toHaveBeenCalledTimes(1);
  //   expect(toast.success).toHaveBeenCalledWith(
  //     expect.stringContaining("Pesan Anda telah terkirim!"),
  //     expect.any(Object)
  //   );

  //   // Assert: Check that the form data was reset
  //   lastProps =
  //     MockContactForm.mock.calls[MockContactForm.mock.calls.length - 1][0];
  //   expect(lastProps.formData.name).toBe(""); // Form reset
  // });
});
