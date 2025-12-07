import React from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { MemoryRouter } from "react-router-dom"; // 1. Import MemoryRouter
import { ProfileSetting } from "../ProfileSetting"; // <-- Adjust path

// --- 2. Import Mocks ---
import { useProfilePresenter } from "@/hooks/profile/useProfilePresenter";
import Swal from "sweetalert2";
import * as FramerMotion from "framer-motion";
import * as LucideReact from "lucide-react";

// --- 3. Mocking Dependencies ---

// Mock framer-motion
vi.mock("framer-motion", () => ({
  motion: {
    section: React.forwardRef(({ children, ...props }, ref) => (
      <section ref={ref} {...props}>
        {children}
      </section>
    )),
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

// Mock lucide-react icons
vi.mock("lucide-react", () => ({
  Trash2: (props) => <svg data-testid="trash-icon" {...props} />,
  Loader2: (props) => <svg data-testid="loader-icon" {...props} />,
  ChevronRight: (props) => <svg data-testid="chevron-icon" {...props} />,
  KeyRound: (props) => <svg data-testid="key-icon" {...props} />,
  Settings: (props) => <svg data-testid="settings-icon" {...props} />,
  AlertTriangle: (props) => <svg data-testid="alert-icon" {...props} />,
}));

// Mock SweetAlert2
vi.mock("sweetalert2", () => ({
  default: {
    fire: vi.fn(), // Mock the .fire() method
  },
}));

// Mock the custom hook
vi.mock("@/hooks/profile/useProfilePresenter", () => ({
  useProfilePresenter: vi.fn(),
}));

// --- 4. Get Typed References ---
/** @type {import('vitest').Mock<[], ReturnType<typeof useProfilePresenter>>} */
const mockedUseProfilePresenter = useProfilePresenter;
/** @type {import('vitest').Mock} */
const mockedSwalFire = Swal.fire;

// --- Test Suite ---
describe("Profile Setting Integration Testing", () => {
  const user = userEvent.setup();

  // Mock hook return values
  const mockExecuteDeleteAccount = vi.fn();

  // Helper render
  const renderSettings = (isLoading = false) => {
    // Setup the mock return value *before* render
    mockedUseProfilePresenter.mockReturnValue({
      isDeleting: isLoading,
      executeDeleteAccount: mockExecuteDeleteAccount,
      // Add other hook properties if needed by other parts of ProfileSetting
    });

    return render(
      <MemoryRouter>
        <ProfileSetting />
      </MemoryRouter>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Test 1: Initial Render (Not Deleting)
  it("should render the component correctly in normal state", () => {
    renderSettings(false);

    // Check main heading
    expect(
      screen.getByRole("heading", { level: 1, name: /pengaturan akun/i })
    ).toBeInTheDocument();
    expect(screen.getByTestId("settings-icon")).toBeInTheDocument();

    // Check 'Change Password' link
    const changePassLink = screen.getByRole("link", {
      name: /ganti kata sandi/i,
    });
    expect(changePassLink).toBeInTheDocument();
    expect(changePassLink).toHaveAttribute("href", "/change-password");
    expect(within(changePassLink).getByTestId("key-icon")).toBeInTheDocument();
    expect(
      within(changePassLink).getByTestId("chevron-icon")
    ).toBeInTheDocument();

    // Check 'Danger Zone'
    expect(
      screen.getByRole("heading", { level: 3, name: /zona berbahaya/i })
    ).toBeInTheDocument();
    expect(screen.getByTestId("alert-icon")).toBeInTheDocument();

    // Check 'Delete Account' button
    const deleteButton = screen.getByRole("button", {
      name: /hapus akun saya/i,
    });
    expect(deleteButton).toBeInTheDocument();
    expect(deleteButton).toBeEnabled();
    expect(within(deleteButton).getByTestId("trash-icon")).toBeInTheDocument();
    expect(
      within(deleteButton).queryByTestId("loader-icon")
    ).not.toBeInTheDocument();
  });

  // Test 2: Deleting State
  it("should render the component in deleting state when isDeleting is true", () => {
    renderSettings(true); // Render with isDeleting = true

    // Check 'Delete Account' button
    const deleteButton = screen.getByRole("button", {
      name: /menghapus akun.../i,
    });
    expect(deleteButton).toBeInTheDocument();
    expect(deleteButton).toBeDisabled(); // Button is disabled
    expect(within(deleteButton).getByTestId("loader-icon")).toBeInTheDocument(); // Spinner is present
    expect(
      within(deleteButton).queryByTestId("trash-icon")
    ).not.toBeInTheDocument(); // Trash icon is gone
  });

  // Test 3: Delete Click -> Confirm
  it("should call executeDeleteAccount when confirmation modal is confirmed", async () => {
    // Arrange: Mock Swal to return 'isConfirmed: true'
    mockedSwalFire.mockResolvedValue({
      isConfirmed: true,
    });

    renderSettings(false);
    const deleteButton = screen.getByRole("button", {
      name: /hapus akun saya/i,
    });

    // Act: Click the delete button
    await user.click(deleteButton);

    // Assert: Swal.fire was called once
    expect(mockedSwalFire).toHaveBeenCalledTimes(1);
    expect(mockedSwalFire).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Konfirmasi Hapus Akun",
        icon: "warning",
      })
    );

    // Assert: Because Swal was confirmed, executeDeleteAccount (from hook) was called
    expect(mockExecuteDeleteAccount).toHaveBeenCalledTimes(1);
  });

  // Test 4: Delete Click -> Cancel
  it("should NOT call executeDeleteAccount when confirmation modal is cancelled", async () => {
    // Arrange: Mock Swal to return 'isConfirmed: false'
    mockedSwalFire.mockResolvedValue({
      isConfirmed: false, // User clicked "Batal"
    });

    renderSettings(false);
    const deleteButton = screen.getByRole("button", {
      name: /hapus akun saya/i,
    });

    // Act: Click the delete button
    await user.click(deleteButton);

    // Assert: Swal.fire was called once
    expect(mockedSwalFire).toHaveBeenCalledTimes(1);

    // Assert: Because Swal was cancelled, executeDeleteAccount was NOT called
    expect(mockExecuteDeleteAccount).not.toHaveBeenCalled();
  });

  // Test 5: Delete button disabled while deleting
  it("should not trigger Swal if delete button is clicked while already deleting", async () => {
    renderSettings(true); // Render in deleting state

    const deleteButton = screen.getByRole("button", {
      name: /menghapus akun.../i,
    });
    expect(deleteButton).toBeDisabled();

    // Act: Attempt to click the disabled button
    await user.click(deleteButton).catch(() => {}); // userEvent might throw on disabled

    // Assert: No modal appears, no second delete call
    expect(mockedSwalFire).not.toHaveBeenCalled();
    expect(mockExecuteDeleteAccount).not.toHaveBeenCalled();
  });
});
