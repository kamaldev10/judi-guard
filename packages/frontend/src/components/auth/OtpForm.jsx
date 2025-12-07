import React, { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { useAuthStore } from "@/stores/authStore";
import { useNavigate } from "react-router-dom";

const OtpForm = ({ email }) => {
  const [otp, setOtp] = useState(Array(6).fill(""));
  const [timer, setTimer] = useState(120);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const inputsRef = useRef([]);
  const navigate = useNavigate();
  const { login, verifyOtp, resendOtp } = useAuthStore();

  // Fokus input pertama
  useEffect(() => {
    if (email) inputsRef.current[0]?.focus();
  }, [email]);

  // Timer OTP
  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (e, index) => {
    const value = e.target.value;
    if (!/^[0-9]?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < otp.length - 1) inputsRef.current[index + 1]?.focus();
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      const newOtp = [...otp];
      if (newOtp[index]) newOtp[index] = "";
      else if (index > 0) inputsRef.current[index - 1]?.focus();
      setOtp(newOtp);
    }
  };

  const handleSubmit = async () => {
    const enteredOtp = otp.join("");
    if (enteredOtp.length !== 6) {
      toast.error("Kode OTP harus 6 digit.", { position: "bottom-right" });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await verifyOtp(email, enteredOtp);
      login(response?.data?.user, response?.data?.token);

      toast.success("Verifikasi OTP berhasil!", {
        position: "bottom-right",
        toastId: "toast-send-success",
      });
      setTimeout(() => {
        navigate("/login");
      }, 0);
    } catch (error) {
      toast.error(error.message || "Verifikasi OTP gagal.", {
        position: "bottom-right",
        toastId: "toast-send-error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    try {
      const response = await resendOtp(email);
      toast.success(response.message || "Kode OTP baru telah dikirim.", {
        position: "bottom-right",
        duration: 2000,
        toastId: "toast-resend-success",
      });
      setOtp(Array(6).fill(""));
      setTimer(120);
      inputsRef.current[0]?.focus();
    } catch (error) {
      toast.error(error.message || "Gagal mengirim ulang OTP.", {
        position: "bottom-right",
        toastId: "toast-resend-error",
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="z-10 bg-transparent p-8 rounded-xl w-full max-w-md text-center">
      <h2 className="text-2xl font-bold text-teal-500 mb-10">Masukkan OTP</h2>
      <p className="text-sm text-gray-600 mb-10">
        Ketik 6 digit kode yang dikirimkan ke <strong>{email}</strong>
      </p>

      <div className="flex justify-center gap-2 mb-6">
        {otp.map((digit, i) => (
          <input
            key={i}
            data-cy={`otp-input-${i}`}
            ref={(el) => (inputsRef.current[i] = el)}
            type="text"
            inputMode="numeric"
            maxLength="1"
            className="w-12 h-12 text-center text-2xl bg-white border-2 border-[#6148FF] rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            value={digit}
            onChange={(e) => handleChange(e, i)}
            onKeyDown={(e) => handleKeyDown(e, i)}
            disabled={isSubmitting}
          />
        ))}
      </div>

      {timer > 0 ? (
        <p className="text-sm text-gray-700 mb-6">
          Kirim Ulang OTP dalam{" "}
          <span className="font-semibold" data-cy="otp-timer">
            {Math.floor(timer / 60)
              .toString()
              .padStart(2, "0")}
            :{(timer % 60).toString().padStart(2, "0")}
          </span>
        </p>
      ) : (
        <button
          data-cy="resend-button"
          onClick={handleResend}
          disabled={isResending}
          className="text-sm text-blue-600 hover:underline mb-6 disabled:opacity-50"
        >
          {isResending ? "Mengirim..." : "Kirim Ulang OTP"}
        </button>
      )}

      <button
        data-cy="verify-button"
        onClick={handleSubmit}
        disabled={isSubmitting || otp.join("").length !== 6}
        className="w-full bg-[#09B3A5] text-white px-8 py-3 rounded-xl hover:bg-teal-600 transition-colors font-semibold disabled:opacity-50"
      >
        {isSubmitting ? "Memverifikasi..." : "Verifikasi"}
      </button>
    </div>
  );
};

export default OtpForm;
