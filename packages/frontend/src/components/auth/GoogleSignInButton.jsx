// src/components/auth/GoogleSignInButton.jsx
import React from "react";
import { GoogleLogin } from "@react-oauth/google";
import { signInWithGoogleApi } from "@/lib/services/auth/authApi";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Icon } from "@iconify/react";
import PropTypes from "prop-types";
import { useAuthStore } from "@/stores/auth/authStore";

const GoogleSignInButton = ({
  onSuccessCustom,
  onErrorCustom,
  buttonText = "Masuk dengan Google",
}) => {
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleGoogleSuccess = async (credentialResponse) => {
    const idToken = credentialResponse?.credential;

    if (!idToken) {
      const errorMsg = "Google ID Token tidak diterima dari Google.";
      console.error(errorMsg);
      toast.error(errorMsg, { position: "bottom-right" });
      onErrorCustom?.(new Error(errorMsg));
      return;
    }

    try {
      const backendResponse = await signInWithGoogleApi(idToken);
      const { token: judiGuardToken, user } = backendResponse.data;

      // Update auth state
      login(user, judiGuardToken);

      // Show success message
      toast.success(
        backendResponse.message || "Login dengan Google berhasil!",
        { position: "bottom-right" }
      );

      // Handle success callback or navigation
      if (onSuccessCustom) {
        onSuccessCustom(user);
      } else {
        navigate("/");
      }
    } catch (error) {
      console.error("Error during backend Google sign-in:", error);

      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage, { position: "bottom-right" });

      onErrorCustom?.(error);
    }
  };

  const handleGoogleFailure = (errorResponse) => {
    console.error("Google Sign-In Failed (Frontend):", errorResponse);

    const message = getGoogleErrorMessage(errorResponse);
    toast.error(message, { position: "bottom-right" });

    onErrorCustom?.(errorResponse || new Error(message));
  };

  const getErrorMessage = (error) => {
    return (
      error.response?.data?.message ||
      error.message ||
      "Gagal memproses login Google di server kami."
    );
  };

  const getGoogleErrorMessage = (errorResponse) => {
    if (errorResponse?.error === "popup_closed_by_user") {
      return "Proses login Google dibatalkan.";
    }
    return "Login dengan Google gagal. Silakan coba lagi.";
  };

  return (
    <GoogleLogin
      onSuccess={handleGoogleSuccess}
      onError={handleGoogleFailure}
      useOneTap={false} // Optional: disable one-tap if needed
    >
      {({ onClick, disabled }) => (
        <button
          onClick={onClick}
          disabled={disabled}
          className="w-full flex items-center justify-center gap-3 border border-gray-300 rounded-lg py-3 px-4 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          type="button"
        >
          <Icon
            icon="logos:google-icon"
            width="20"
            height="20"
            className="flex-shrink-0"
          />
          <span className="text-sm font-medium text-gray-700">
            {buttonText}
          </span>
        </button>
      )}
    </GoogleLogin>
  );
};

GoogleSignInButton.propTypes = {
  onSuccessCustom: PropTypes.func,
  onErrorCustom: PropTypes.func,
  buttonText: PropTypes.string,
};

GoogleSignInButton.defaultProps = {
  onSuccessCustom: null,
  onErrorCustom: null,
  buttonText: "Masuk dengan Google",
};

export default GoogleSignInButton;
