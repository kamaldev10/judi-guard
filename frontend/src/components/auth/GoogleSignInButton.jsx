// src/components/auth/GoogleSignInButton.jsx
import React from "react";
import { GoogleLogin } from "@react-oauth/google"; // Komponen utama dari library
import { signInWithGoogleApi } from "../../services/api"; // Sesuaikan path jika perlu
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Icon } from "@iconify/react"; // Impor Iconify
import { useAuth } from "../../contexts/AuthContext";

const GoogleSignInButton = ({
  onSuccessCustom,
  onErrorCustom,
  buttonText = "Masuk Dengan Google",
}) => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleGoogleSuccess = async (credentialResponse) => {
    console.log("Google Sign-In Success (Frontend):", credentialResponse);
    const idToken = credentialResponse.credential; // Ini adalah ID Token JWT dari Google

    if (idToken) {
      try {
        const backendResponse = await signInWithGoogleApi(idToken);
        const { token: judiGuardToken, user } = backendResponse.data;

        login(user, judiGuardToken);
        toast.success(
          backendResponse.message || "Login dengan Google berhasil!",
          { position: "bottom-right" }
        );

        if (onSuccessCustom) {
          onSuccessCustom(user);
        } else {
          navigate("/");
        }
      } catch (err) {
        console.error("Error during backend Google sign-in:", err);
        const errorMessage =
          err.message || "Gagal memproses login Google di server kami.";
        toast.error(errorMessage, { position: "bottom-right" });
        if (onErrorCustom) onErrorCustom(err);
      }
    } else {
      const noIdTokenMsg = "Google ID Token tidak diterima dari Google.";
      console.error(noIdTokenMsg);
      toast.error(noIdTokenMsg, { position: "bottom-right" });
      if (onErrorCustom) onErrorCustom(new Error(noIdTokenMsg));
    }
  };

  const handleGoogleFailure = (errorResponse) => {
    console.error("Google Sign-In Failed (Frontend):", errorResponse);
    const message =
      errorResponse?.error === "popup_closed_by_user"
        ? "Proses login Google dibatalkan."
        : "Login dengan Google gagal. Silakan coba lagi.";
    toast.error(message, { position: "bottom-right" });
    if (onErrorCustom) onErrorCustom(errorResponse || new Error(message));
  };

  return (
    <GoogleLogin onSuccess={handleGoogleSuccess} onError={handleGoogleFailure}>
      {({ onClick, disabled }) => (
        <button
          onClick={onClick}
          disabled={disabled}
          className="w-full flex items-center justify-center gap-2 border border-gray-400 rounded-md py-2 hover:bg-gray-100 transition disabled:opacity-50"
        >
          <Icon icon="logos:google-icon" width="25" height="25" />
          <span className="text-sm font-medium text-gray-700">
            {buttonText}
          </span>
        </button>
      )}
    </GoogleLogin>
  );
};

export default GoogleSignInButton;
