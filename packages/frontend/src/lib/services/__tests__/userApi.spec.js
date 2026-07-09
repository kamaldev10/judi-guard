import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiClient } from '../apiClient';
import { getCurrentUserApi, deleteMyAccountApi, updateMyProfileApi } from '../userApi';

// 3. Mock modul apiClient
vi.mock('../apiClient', () => ({
  apiClient: {
    get: vi.fn(),
    delete: vi.fn(),
    patch: vi.fn(),
  },
}));

// --- Test Suite ---

describe('User API Service Unit Testing', () => {
  // Bersihkan semua mock sebelum setiap tes
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // --- Tes untuk getCurrentUserApi ---
  describe('getCurrentUserApi', () => {
    it('should call apiClient.get with the correct endpoint and return data on success', async () => {
      // Arrange (Persiapan)
      const mockUserData = { user: { id: 1, name: 'Test User' } };
      apiClient.get.mockResolvedValue({ data: mockUserData });

      // Act (Tindakan)
      const result = await getCurrentUserApi();

      // Assert (Verifikasi)
      expect(apiClient.get).toHaveBeenCalledTimes(1);
      expect(apiClient.get).toHaveBeenCalledWith('/users/me');
      expect(result).toEqual(mockUserData);
    });

    it('should throw a default error message if the API fails without a specific message', async () => {
      // Arrange
      const mockError = new Error('Network Error');
      apiClient.get.mockRejectedValue(mockError);

      // Act & Assert
      const expectedErrorMessage =
        'Gagal mengambil data pengguna. Sesi Anda mungkin telah berakhir, silakan login kembali.';
      await expect(getCurrentUserApi()).rejects.toThrow(expectedErrorMessage);
    });

    it('should throw the specific error message from the API response if available', async () => {
      // Arrange
      const specificMessage = 'Token tidak valid';
      // Simulasikan error response Axios
      const mockError = { response: { data: { message: specificMessage } } };
      apiClient.get.mockRejectedValue(mockError);

      // Act & Assert
      await expect(getCurrentUserApi()).rejects.toThrow(specificMessage);
    });
  });

  // --- Tes untuk deleteMyAccountApi ---
  describe('deleteMyAccountApi', () => {
    it('should call apiClient.delete with the correct endpoint and return data', async () => {
      // Arrange
      const mockResponse = { message: 'Akun berhasil dihapus' };
      apiClient.delete.mockResolvedValue({ data: mockResponse });

      // Act
      const result = await deleteMyAccountApi();

      // Assert
      expect(apiClient.delete).toHaveBeenCalledTimes(1);
      expect(apiClient.delete).toHaveBeenCalledWith('/users/deleteMe');
      expect(result).toEqual(mockResponse);
    });

    it('should throw a default error message if the API fails', async () => {
      // Arrange
      apiClient.delete.mockRejectedValue(new Error('Server Down'));

      // Act & Assert
      const expectedErrorMessage = 'Gagal menghapus akun. Silakan coba lagi nanti.';
      await expect(deleteMyAccountApi()).rejects.toThrow(expectedErrorMessage);
    });

    it('should throw the specific error message from the API response', async () => {
      // Arrange
      const specificMessage = 'Otentikasi gagal';
      const mockError = { response: { data: { message: specificMessage } } };
      apiClient.delete.mockRejectedValue(mockError);

      // Act & Assert
      await expect(deleteMyAccountApi()).rejects.toThrow(specificMessage);
    });
  });

  // --- Tes untuk updateMyProfileApi ---
  describe('updateMyProfileApi', () => {
    const profileData = { username: 'user-baru' };

    it('should call apiClient.patch with the correct endpoint and data', async () => {
      // Arrange
      const mockResponse = { data: { user: { ...profileData } } };
      apiClient.patch.mockResolvedValue({ data: mockResponse });

      // Act
      const result = await updateMyProfileApi(profileData);

      // Assert
      expect(apiClient.patch).toHaveBeenCalledTimes(1);
      expect(apiClient.patch).toHaveBeenCalledWith('/users/updateMe', profileData);
      expect(result).toEqual(mockResponse);
    });

    it('should throw a default error message if the API fails', async () => {
      // Arrange
      apiClient.patch.mockRejectedValue(new Error('Server Down'));

      // Act & Assert
      const expectedErrorMessage = 'Gagal memperbarui profil. Silakan coba lagi nanti.';
      await expect(updateMyProfileApi(profileData)).rejects.toThrow(expectedErrorMessage);
    });

    it('should throw the specific error message from the API response', async () => {
      // Arrange
      const specificMessage = 'Username sudah ada';
      const mockError = { response: { data: { message: specificMessage } } };
      apiClient.patch.mockRejectedValue(mockError);

      // Act & Assert
      await expect(updateMyProfileApi(profileData)).rejects.toThrow(specificMessage);
    });
  });
});
