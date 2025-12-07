import React from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ProfileHeader } from "../ProfileHeader";

import { useProfilePresenter } from "@/hooks/profile/useProfilePresenter";
import * as FramerMotion from "framer-motion";
import * as LucideReact from "lucide-react";

// --- 2. Mocking Dependencies ---

// Mock framer-motion
// We mock all motion components to render plain divs/buttons
vi.mock("framer-motion", () => ({
  motion: {
    div: React.forwardRef(({ children, ...props }, ref) => (
      <div ref={ref} {...props}>
        {children}
      </div>
    )),
    section: React.forwardRef(({ children, ...props }, ref) => (
      <section ref={ref} {...props}>
        {children}
      </section>
    )),
    h1: React.forwardRef(({ children, ...props }, ref) => (
      <h1 ref={ref} {...props}>
        {children}
      </h1>
    )),
    p: React.forwardRef(({ children, ...props }, ref) => (
      <p ref={ref} {...props}>
        {children}
      </p>
    )),
    button: React.forwardRef(({ children, ...props }, ref) => (
      <button ref={ref} {...props}>
        {children}
      </button>
    )),
  },
}));

// Mock lucide-react icons (return simple text/testid)
vi.mock("lucide-react", () => ({
  User: (props) => <svg data-testid="user-icon" {...props} />,
  ShieldCheck: (props) => <svg data-testid="shield-icon" {...props} />,
  Mail: (props) => <svg data-testid="mail-icon" {...props} />,
  CalendarDays: (props) => <svg data-testid="calendar-icon" {...props} />,
  Edit3: (props) => <svg data-testid="edit-icon" {...props} />,
}));

// Mock the custom hook
vi.mock("@/hooks/profile/useProfilePresenter", () => ({
  useProfilePresenter: vi.fn(),
}));

// --- 3. Get Typed References ---
/** @type {import('vitest').Mock<[], ReturnType<typeof useProfilePresenter>>} */
const mockedUseProfilePresenter = useProfilePresenter;

// --- Test Suite ---
describe("Profile Header Integration Testing", () => {
  const user = userEvent.setup();

  // Mock handler from the hook
  const mockHandleEditProfile = vi.fn();

  // Mock user data for different scenarios
  const mockVerifiedUser = {
    id: "123",
    username: "VerifiedUser",
    email: "verified@example.com",
    isVerified: true,
    createdAt: "2024-01-01T10:00:00Z", // Jan 1, 2024
  };

  const mockUnverifiedUser = {
    id: "456",
    username: "NewUser",
    email: "new@example.com",
    isVerified: false,
    createdAt: "2025-03-15T14:30:00Z", // Mar 15, 2025
  };

  // Helper render
  const renderHeader = (currentUser) => {
    // Setup the hook's return value *before* render
    mockedUseProfilePresenter.mockReturnValue({
      user: currentUser,
      handleEditProfile: mockHandleEditProfile,
    });

    return render(<ProfileHeader />);
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Test 1: Verified User
  describe("when user is verified", () => {
    beforeEach(() => {
      renderHeader(mockVerifiedUser);
    });

    it("should render username, email, and joined date", () => {
      // Check username heading
      expect(
        screen.getByRole("heading", {
          level: 1,
          name: mockVerifiedUser.username,
        })
      ).toBeInTheDocument();
      // Check email info
      expect(screen.getByText("Email")).toBeInTheDocument();
      expect(screen.getByText(mockVerifiedUser.email)).toBeInTheDocument();
      // Check joined date (formatted)
      expect(screen.getByText("Bergabung Sejak")).toBeInTheDocument();
      expect(screen.getByText("1 Januari 2024")).toBeInTheDocument();
    });

    it("should render verification icons and messages", () => {
      // Check big avatar shield icon
      const avatar = screen
        .getByRole("heading", { name: mockVerifiedUser.username })
        .closest("div");
      expect(within(avatar).getByTestId("shield-icon")).toBeInTheDocument(); // Icon on avatar

      // Check verification message banner
      expect(
        screen.getByText(/akun email ini telah diverifikasi/i)
      ).toBeInTheDocument();
      // Check shield icon in the banner (will find 2 total with the avatar one)
      expect(
        screen.getAllByTestId("shield-icon").length
      ).toBeGreaterThanOrEqual(2);
    });

    it("should render the 'Edit Profil' button and call handler on click", async () => {
      const editButton = screen.getByRole("button", { name: /edit profil/i });
      expect(editButton).toBeInTheDocument();
      expect(within(editButton).getByTestId("edit-icon")).toBeInTheDocument();

      // Simulate click
      await user.click(editButton);

      // Verify hook's handler was called
      expect(mockHandleEditProfile).toHaveBeenCalledTimes(1);
    });
  });

  // Test 2: Unverified User
  describe("when user is unverified", () => {
    beforeEach(() => {
      renderHeader(mockUnverifiedUser);
    });

    it("should render username and formatted date (N/A if invalid)", () => {
      expect(
        screen.getByRole("heading", {
          level: 1,
          name: mockUnverifiedUser.username,
        })
      ).toBeInTheDocument();
      expect(screen.getByText("15 Maret 2025")).toBeInTheDocument();
    });

    it("should NOT render verification icons or messages", () => {
      // Check big avatar shield icon
      const avatar = screen
        .getByRole("heading", { name: mockUnverifiedUser.username })
        .closest("div");
      // Check shield icon on avatar is NOT present
      expect(
        within(avatar).queryByTestId("shield-icon")
      ).not.toBeInTheDocument();

      // Check verification message banner is NOT present
      expect(
        screen.queryByText(/akun email ini telah diverifikasi/i)
      ).not.toBeInTheDocument();
    });
  });

  // Test 3: Fallback/Default values
  it("should render default values if user data is minimal", () => {
    // Arrange
    const minimalUser = {
      isVerified: false,
      // no username, email, or createdAt
    };
    renderHeader(minimalUser);

    // Check fallback username
    expect(
      screen.getByRole("heading", { level: 1, name: /nama pengguna/i })
    ).toBeInTheDocument();

    // Check N/A for email (specifically)
    const emailLabel = screen.getByText("Email");
    // Find the parent container of the "Email" label
    const emailContainer = emailLabel.closest('div[class*="flex items-start"]');
    // Check for "N/A" *only* within that container
    expect(within(emailContainer).getByText("N/A")).toBeInTheDocument();

    // Check N/A for joined date (specifically)
    const dateLabel = screen.getByText("Bergabung Sejak");
    // Find the parent container of the "Bergabung Sejak" label
    const dateContainer = dateLabel.closest('div[class*="flex items-start"]');
    // Check for "N/A" *only* within that container
    expect(within(dateContainer).getByText("N/A")).toBeInTheDocument();
  });
});
