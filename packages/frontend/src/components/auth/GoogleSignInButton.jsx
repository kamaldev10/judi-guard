import React from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Icon } from "@iconify/react";
import PropTypes from "prop-types";
import { useAuthStore } from "@/stores/authStore";

const GoogleSignInButton = ({
  buttonText = "Masuk dengan Google",
  disabled = false,
  onSuccessCustom,
  onErrorCustom,
}) => {
  const { signInWithGoogle } = useAuthStore();
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);

  const handleGoogleSuccess = async (credentialResponse) => {
    const idToken = credentialResponse?.credential;

    if (!idToken) {
      toast.error("Google ID Token tidak diterima", {
        position: "bottom-right",
      });
      onErrorCustom?.(new Error("Google ID Token tidak diterima"));
      return;
    }

    try {
      setLoading(true);

      // Panggil store action, store yang akan panggil API & set session
      await signInWithGoogle(idToken);
      toast.success("Login dengan Google berhasil!", {
        position: "bottom-right",
        duration: 2000,
        toastId: "toast-login-success",
      });

      if (onSuccessCustom) {
        const user = JSON.parse(localStorage.getItem("judiGuardUser"));
        onSuccessCustom(user);
      }

      setTimeout(() => {
        navigate("/");
      });
    } catch (error) {
      toast.error(error.message || "Gagal login Google", {
        position: "bottom-right",
      });
      onErrorCustom?.(error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleFailure = (errorResponse) => {
    const message =
      errorResponse?.error === "popup_closed_by_user"
        ? "Proses login Google dibatalkan."
        : "Login dengan Google gagal. Silakan coba lagi.";
    toast.error(message, { position: "bottom-right" });
    onErrorCustom?.(errorResponse || new Error(message));
  };

  return (
    <div className="w-full" data-cy="log-in-with-google-button">
      {window.Cypress && (
        <button
          data-cy="google-login-mock-btn"
          onClick={() =>
            handleGoogleSuccess({ credential: "mock-google-token-123" })
          }
          style={{ position: "absolute", opacity: 0, height: 0, width: 0 }} // Tidak terlihat user
        >
          Test Google Login
        </button>
      )}
      <GoogleLogin
        onSuccess={handleGoogleSuccess}
        onError={handleGoogleFailure}
        useOneTap={false}
        render={({ onClick, disabled: googleDisabled }) => (
          <button
            onClick={onClick}
            disabled={disabled || googleDisabled || loading}
            type="button"
            className="w-full flex items-center justify-center gap-3 border border-gray-300 rounded-lg py-3 px-4 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <Icon icon="logos:google-icon" width={20} height={20} />
            <span className="text-sm font-medium">{buttonText}</span>
            {loading && (
              <svg
                className="animate-spin h-5 w-5 text-gray-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                ></path>
              </svg>
            )}
          </button>
        )}
      />
    </div>
  );
};

GoogleSignInButton.propTypes = {
  buttonText: PropTypes.string,
  disabled: PropTypes.bool,
  onSuccessCustom: PropTypes.func,
  onErrorCustom: PropTypes.func,
};

export default GoogleSignInButton;
