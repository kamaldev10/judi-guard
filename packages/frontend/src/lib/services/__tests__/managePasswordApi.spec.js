import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiClient } from '../apiClient';
import { forgotPasswordApi, resetPasswordApi, changePasswordApi } from '../managePasswordApi';

// 3. Mock modul apiClient
vi.mock('../apiClient', () => ({
  apiClient: {
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
  },
}));

// --- Test Suite ---

describe('Password Management API Service Unit Testing', () => {
  // Bersihkan semua mock sebelum setiap tes
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // --- Tests for forgotPasswordApi ---
  describe('forgotPasswordApi', () => {
    const email = 'test@example.com';
    const mockResponse = { data: { message: 'Password reset email sent' } };

    it('should call apiClient.post with the correct endpoint and email', async () => {
      // Arrange
      apiClient.post.mockResolvedValue(mockResponse);

      // Act
      const result = await forgotPasswordApi(email);

      // Assert
      expect(apiClient.post).toHaveBeenCalledTimes(1);
      expect(apiClient.post).toHaveBeenCalledWith('/auth/forgot-password', {
        email,
      });
      expect(result).toEqual(mockResponse.data);
    });

    it('should throw the specific error from the API response if available', async () => {
      // Arrange
      const specificMessage = 'User not found';
      const mockError = { response: { data: { message: specificMessage } } };
      apiClient.post.mockRejectedValue(mockError);

      // Act & Assert
      await expect(forgotPasswordApi(email)).rejects.toThrow(specificMessage);
    });

    it('should throw its custom default error message on failure', async () => {
      // Arrange
      const mockError = new Error('Network Error');
      apiClient.post.mockRejectedValue(mockError);

      // Act & Assert
      await expect(forgotPasswordApi(email)).rejects.toThrow(
        'Terjadi kesalahan saat meminta reset kata sandi.',
      );
    });
  });

  // --- Tests for resetPasswordApi ---
  describe('resetPasswordApi', () => {
    const token = 'fake-token';
    const newPassword = 'newPassword123';
    const confirmNewPassword = 'newPassword123';
    const payload = {
      password: newPassword,
      confirmPassword: confirmNewPassword,
    };
    const mockResponse = { data: { message: 'Password has been reset' } };

    it('should call apiClient.put with the correct endpoint, token, and data', async () => {
      // Arrange
      apiClient.put.mockResolvedValue(mockResponse);

      // Act
      const result = await resetPasswordApi(token, newPassword, confirmNewPassword);

      // Assert
      expect(apiClient.put).toHaveBeenCalledTimes(1);
      expect(apiClient.put).toHaveBeenCalledWith(`/auth/reset-password/${token}`, payload);
      expect(result).toEqual(mockResponse.data);
    });

    it('should throw the specific error from handleApiError on failure', async () => {
      // Arrange
      const specificMessage = 'Token is invalid or has expired';
      const mockError = { response: { data: { message: specificMessage } } };
      apiClient.put.mockRejectedValue(mockError);

      // Act & Assert
      await expect(resetPasswordApi(token, newPassword, confirmNewPassword)).rejects.toThrow(
        specificMessage,
      );
    });

    it('should throw the default error from handleApiError on failure', async () => {
      // Arrange
      const mockError = new Error('Network Error');
      apiClient.put.mockRejectedValue(mockError);

      // Act & Assert
      await expect(resetPasswordApi(token, newPassword, confirmNewPassword)).rejects.toThrow(
        'Terjadi kesalahan saat mereset kata sandi Anda.',
      );
    });
  });

  // --- Tests for changePasswordApi ---
  describe('changePasswordApi', () => {
    const currentPassword = 'oldPassword123';
    const newPassword = 'newPassword123';
    const confirmPassword = 'newPassword123';
    const payload = { currentPassword, newPassword, confirmPassword };
    const mockResponse = { data: { message: 'Password changed successfully' } };

    it('should call apiClient.patch with the correct endpoint and data', async () => {
      // Arrange
      apiClient.patch.mockResolvedValue(mockResponse);

      // Act
      const result = await changePasswordApi(currentPassword, newPassword, confirmPassword);

      // Assert
      expect(apiClient.patch).toHaveBeenCalledTimes(1);
      expect(apiClient.patch).toHaveBeenCalledWith('/auth/change-password', payload);
      expect(result).toEqual(mockResponse.data);
    });

    it('should throw the specific error from handleApiError on failure', async () => {
      // Arrange
      const specificMessage = 'Current password is incorrect';
      const mockError = { response: { data: { message: specificMessage } } };
      apiClient.patch.mockRejectedValue(mockError);

      // Act & Assert
      await expect(
        changePasswordApi(currentPassword, newPassword, confirmPassword),
      ).rejects.toThrow(specificMessage);
    });

    it('should throw the default error from handleApiError on failure', async () => {
      // Arrange
      const mockError = new Error('Network Error');
      apiClient.patch.mockRejectedValue(mockError);

      // Act & Assert
      await expect(
        changePasswordApi(currentPassword, newPassword, confirmPassword),
      ).rejects.toThrow('Gagal mengubah kata sandi.');
    });
  });
});
