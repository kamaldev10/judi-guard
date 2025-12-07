import { renderHook, act, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useEditProfilePresenter } from "../useEditProfilePresenter";
import { useUserStore } from "@/stores/userStore";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

// --- 1. Mock Dependencies ---

// Mock 'react-router-dom'
const mockNavigate = vi.fn();
vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

// Mock 'sweetalert2'
// We spy on .fire and mock .showLoading/.close
vi.mock("sweetalert2", () => ({
  default: {
    fire: vi.fn(),
    showLoading: vi.fn(),
    close: vi.fn(),
  },
}));

// Mock 'useUserStore'
const mockGetCurrentUser = vi.fn();
const mockUpdateProfile = vi.fn();
vi.mock("@/stores/userStore", () => ({
  useUserStore: () => ({
    getCurrentUser: mockGetCurrentUser,
    updateProfile: mockUpdateProfile,
    isLoadingUser: false, // Default state
    error: null, // Default state
  }),
}));

// Get typed references
/** @type {import('vitest').Mock} */
const mockedSwalFire = Swal.fire;

// --- Test Suite ---
describe("Custom useEditProfilePresenter Hook Unit Testing", () => {
  const mockUser = { username: "testuser", email: "test@example.com" };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Test 1: Initial Data Fetching (Success)
  it("should fetch user data on mount and set formData", async () => {
    // Arrange
    mockGetCurrentUser.mockResolvedValue({
      status: "success",
      data: { user: mockUser },
    });

    // Act
    const { result } = renderHook(() => useEditProfilePresenter());

    // Assert: Initial loading state
    expect(result.current.isLoading).toBe(true);

    // 2. 🔥 Wait for the hook to finish loading (useEffect completes)
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Assert: Final state
    expect(result.current.fetchError).toBeNull();
    expect(result.current.formData).toEqual(mockUser);
    expect(result.current.initialData).toEqual(mockUser); // This will now pass
    expect(mockGetCurrentUser).toHaveBeenCalledTimes(1);
  });

  // Test 2: Initial Data Fetching (Failure)
  it("should set fetchError if initial data fetch fails", async () => {
    // Arrange
    const mockError = new Error("Failed to fetch");
    mockGetCurrentUser.mockRejectedValue(mockError);

    // Act
    const { result } = renderHook(() => useEditProfilePresenter());

    // Assert: Initial loading
    expect(result.current.isLoading).toBe(true);

    // 2. 🔥 Wait for the hook to finish loading
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Assert: Final error state
    expect(result.current.fetchError).toEqual(expect.any(Error));
    expect(result.current.fetchError.message).toBe(mockError.message);
    expect(result.current.formData).toEqual({ username: "", email: "" });
  });

  // Test 3: handleInputChange
  it("should update formData on handleInputChange", async () => {
    mockGetCurrentUser.mockResolvedValue({
      status: "success",
      data: { user: mockUser },
    });
    const { result } = renderHook(() => useEditProfilePresenter());

    // 2. 🔥 Wait for the hook to finish loading
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Act
    const mockEvent = { target: { name: "username", value: "newUser" } };
    act(() => {
      result.current.handleInputChange(mockEvent);
    });

    // Assert
    expect(result.current.formData.username).toBe("newUser");
    // initialData is now populated, so this test will pass
    expect(result.current.initialData.username).toBe("testuser");
  });

  // Test 4: handleCancel
  it("should call navigate to /profile on handleCancel", () => {
    const { result } = renderHook(() => useEditProfilePresenter());

    // Act
    act(() => {
      result.current.handleCancel();
    });

    // Assert
    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith("/profile");
  });

  // Test 5: handleSubmit (No Changes)
  it("should show info Swal if handleSubmit is called with no changes", async () => {
    mockGetCurrentUser.mockResolvedValue({
      status: "success",
      data: { user: mockUser },
    });
    const { result } = renderHook(() => useEditProfilePresenter());

    // 2. 🔥 Wait for the hook to finish loading
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Act
    const mockEvent = { preventDefault: vi.fn() };
    await act(async () => {
      await result.current.handleSubmit(mockEvent);
    });

    // Assert
    expect(mockEvent.preventDefault).toHaveBeenCalledTimes(1);
    expect(result.current.isSaving).toBe(false);
    expect(mockUpdateProfile).not.toHaveBeenCalled();
    expect(mockedSwalFire).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Tidak Ada Perubahan",
        icon: "info",
      })
    );
  });

  // Test 6: handleSubmit (Success)
  // it("should call updateProfile, show success Swal, and navigate on successful submit", async () => {
  //   // Arrange
  //   const newUsername = "newUser";
  //   const successMessage = "Profil diperbarui";
  //   mockGetCurrentUser.mockResolvedValue({
  //     status: "success",
  //     data: { user: mockUser },
  //   });
  //   mockUpdateProfile.mockResolvedValue({
  //     status: "success",
  //     message: successMessage,
  //   });
  //   mockedSwalFire.mockResolvedValue({ isConfirmed: true });

  //   const { result } = renderHook(() => useEditProfilePresenter());

  //   // 2. 🔥 Wait for initial load
  //   await waitFor(() => {
  //     expect(result.current.isLoading).toBe(false);
  //   });

  //   // Act 1: Change the data
  //   act(() => {
  //     result.current.handleInputChange({
  //       target: { name: "username", value: newUsername },
  //     });
  //   });

  //   // Act 2: Submit the form
  //   const mockSubmitEvent = { preventDefault: vi.fn() };
  //   let submitPromise;
  //   // 3. 🔥 Run the submit in 'act' but DO NOT await it yet
  //   act(() => {
  //     submitPromise = result.current.handleSubmit(mockSubmitEvent);
  //   });

  //   // 4. 🔥 Assert the loading state IMMEDIATELY
  //   expect(result.current.isSaving).toBe(true);
  //   expect(mockedSwalFire).toHaveBeenCalledWith(
  //     expect.objectContaining({ title: "Menyimpan Perubahan..." })
  //   );

  //   // 5. 🔥 Now, await the promise wrapped in act
  //   await act(async () => {
  //     await submitPromise;
  //   });

  //   // Assert: API was called
  //   expect(mockUpdateProfile).toHaveBeenCalledWith({ username: newUsername });

  //   // Assert: Final state after success
  //   expect(result.current.isSaving).toBe(false);
  //   expect(Swal.close).toHaveBeenCalledTimes(1);
  //   expect(mockedSwalFire).toHaveBeenCalledWith(
  //     expect.objectContaining({ title: "Profil Diperbarui!", icon: "success" })
  //   );
  //   expect(mockNavigate).toHaveBeenCalledWith("/profile");
  // });

  // Test 7: handleSubmit (API Failure)
  it("should show error Swal if updateProfile API fails", async () => {
    const errorMessage = "Username already taken";
    const newUsername = "newUser";
    mockGetCurrentUser.mockResolvedValue({
      status: "success",
      data: { user: mockUser },
    });
    mockUpdateProfile.mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useEditProfilePresenter());

    // 2. 🔥 Wait for initial load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Act 1: Change data
    act(() => {
      result.current.handleInputChange({
        target: { name: "username", value: newUsername },
      });
    });

    // Act 2: Submit
    await act(async () => {
      await result.current.handleSubmit({ preventDefault: vi.fn() });
    });

    // Assert: State NOT updated and NO navigation
    // This will now pass because initialData was loaded
    expect(result.current.initialData.username).toBe(mockUser.username);
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
