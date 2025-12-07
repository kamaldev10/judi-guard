import { describe, it, expect, vi, beforeEach } from "vitest";
import { apiClient } from "../apiClient";
import {
  registerUserApi,
  loginUserApi,
  signInWithGoogleApi,
  verifyOtpApi,
  resendOtpApi,
} from "../authApi";

// 3. Mock the apiClient module
vi.mock("../apiClient", () => ({
  apiClient: {
    post: vi.fn(),
  },
}));

// --- Test Suite ---

describe("Auth API Service Unit Testing", () => {
  // Bersihkan semua mock sebelum setiap tes
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // --- Tests for registerUserApi ---
  describe("registerUserApi", () => {
    const userData = {
      userName: "testuser",
      email: "test@example.com",
      password: "password123",
    };
    const expectedPayload = {
      username: "testuser",
      email: "test@example.com",
      password: "password123",
    };
    const mockResponse = { data: { message: "Success" } };

    it("should call apiClient.post with correct payload and return data", async () => {
      apiClient.post.mockResolvedValue(mockResponse);

      const result = await registerUserApi(userData);

      expect(apiClient.post).toHaveBeenCalledTimes(1);
      expect(apiClient.post).toHaveBeenCalledWith(
        "/auth/register",
        expectedPayload
      );
      expect(result).toEqual(mockResponse.data);
    });

    it("should throw the specific error from handleApiError on failure", async () => {
      const specificMessage = "Email already exists";
      const mockError = { response: { data: { message: specificMessage } } };
      apiClient.post.mockRejectedValue(mockError);

      await expect(registerUserApi(userData)).rejects.toThrow(specificMessage);
    });

    it("should throw the default error from handleApiError on failure", async () => {
      apiClient.post.mockRejectedValue(new Error("Network Error"));
      await expect(registerUserApi(userData)).rejects.toThrow(
        "Gagal melakukan pendaftaran."
      );
    });
  });

  // --- Tests for loginUserApi ---
  describe("loginUserApi", () => {
    const credentials = { email: "test@example.com", password: "password123" };
    const mockResponse = { data: { user: { id: 1 }, token: "123" } };

    it("should call apiClient.post with credentials and return data", async () => {
      apiClient.post.mockResolvedValue(mockResponse);

      const result = await loginUserApi(credentials);

      expect(apiClient.post).toHaveBeenCalledTimes(1);
      expect(apiClient.post).toHaveBeenCalledWith("/auth/login", credentials);
      expect(result).toEqual(mockResponse.data);
    });

    it("should throw the specific error from handleApiError on failure", async () => {
      const specificMessage = "Invalid credentials";
      const mockError = { response: { data: { message: specificMessage } } };
      apiClient.post.mockRejectedValue(mockError);

      await expect(loginUserApi(credentials)).rejects.toThrow(specificMessage);
    });
  });

  // --- Tests for signInWithGoogleApi ---
  describe("signInWithGoogleApi", () => {
    const idToken = "google-token-123";
    const mockResponse = { data: { user: { id: 2 }, token: "456" } };

    it("should call apiClient.post with idToken and return data", async () => {
      apiClient.post.mockResolvedValue(mockResponse);

      const result = await signInWithGoogleApi(idToken);

      expect(apiClient.post).toHaveBeenCalledTimes(1);
      expect(apiClient.post).toHaveBeenCalledWith("/auth/google/signin", {
        idToken,
      });
      expect(result).toEqual(mockResponse.data);
    });

    it("should throw the default error from handleApiError on failure", async () => {
      apiClient.post.mockRejectedValue(new Error("Network Error"));
      await expect(signInWithGoogleApi(idToken)).rejects.toThrow(
        "Login Google gagal."
      );
    });
  });

  // --- Tests for verifyOtpApi ---
  describe("verifyOtpApi", () => {
    const email = "test@example.com";
    const otpCode = "123456";
    const mockResponse = { data: { message: "Verified" } };

    it("should call apiClient.post with email/otp and return data", async () => {
      apiClient.post.mockResolvedValue(mockResponse);

      const result = await verifyOtpApi(email, otpCode);

      expect(apiClient.post).toHaveBeenCalledTimes(1);
      expect(apiClient.post).toHaveBeenCalledWith("/auth/verify-otp", {
        email,
        otpCode,
      });
      expect(result).toEqual(mockResponse.data);
    });

    it("should throw the specific error from handleApiError on failure", async () => {
      const specificMessage = "Invalid OTP";
      const mockError = { response: { data: { message: specificMessage } } };
      apiClient.post.mockRejectedValue(mockError);

      await expect(verifyOtpApi(email, otpCode)).rejects.toThrow(
        specificMessage
      );
    });
  });

  // --- Tests for resendOtpApi ---
  describe("resendOtpApi", () => {
    const email = "test@example.com";
    const mockResponse = { data: { message: "OTP Resent" } };

    it("should call apiClient.post with email and return data", async () => {
      apiClient.post.mockResolvedValue(mockResponse);

      const result = await resendOtpApi(email);

      expect(apiClient.post).toHaveBeenCalledTimes(1);
      expect(apiClient.post).toHaveBeenCalledWith("/auth/resend-otp", {
        email,
      });
      expect(result).toEqual(mockResponse.data);
    });

    it("should throw the default error from handleApiError on failure", async () => {
      apiClient.post.mockRejectedValue(new Error("Network Error"));
      await expect(resendOtpApi(email)).rejects.toThrow(
        "Gagal mengirim ulang OTP."
      );
    });
  });
});
