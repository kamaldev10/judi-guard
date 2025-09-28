// src/pages/OtpPage/OtpPage.jsx (atau path Anda)
import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import LogoWithSlogan from "../../assets/images/LogoWithSlogan.png";
import { toast } from "react-toastify";
import { verifyOtpApi, resendOtpApi } from "@/lib/services/auth/authApi";
import { useAuth } from "../../contexts/AuthContext";
import { Title } from "react-head";

const OtpPage = () => {
  const [otp, setOtp] = useState(Array(6).fill(""));
  const [timer, setTimer] = useState(120); // Durasi timer awal
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const inputsRef = useRef([]);
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth(); // Dapatkan fungsi login dari AuthContext

  // Ambil email dari state navigasi, atau redirect jika tidak ada
  const email = location.state?.email;

  useEffect(() => {
    if (!email) {
      toast.error("Email tidak ditemukan, harap registrasi ulang.", {
        position: "bottom-right",
      });
      navigate("/register"); // Atau halaman yang sesuai
      return;
    }
    inputsRef.current[0]?.focus();
  }, [email, navigate]);

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    } else if (timer === 0) {
      // Timer habis
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (e, index) => {
    const value = e.target.value;
    if (!/^[0-9]?$/.test(value)) return; // Hanya izinkan angka dan string kosong

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Pindah fokus ke input berikutnya jika field terisi dan bukan input terakhir
    if (value && index < otp.length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      e.preventDefault(); // Cegah perilaku default backspace (navigasi kembali)
      const newOtp = [...otp];
      if (newOtp[index]) {
        // Jika field saat ini ada isinya, hapus isinya
        newOtp[index] = "";
        setOtp(newOtp);
        // Fokus tetap di input saat ini agar user bisa ketik ulang atau backspace lagi
      } else if (index > 0) {
        // Jika field saat ini kosong dan bukan input pertama, pindah fokus ke sebelumnya
        inputsRef.current[index - 1]?.focus();
      }
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
      const response = await verifyOtpApi(email, enteredOtp);
      // response.data berisi { token, user }
      login(response.data.user, response.data.token); // Panggil fungsi login dari context

      toast.success(
        response.message || "Verifikasi OTP berhasil! Silahkan login.",
        {
          position: "bottom-right",
        }
      );
      navigate("/login");
    } catch (error) {
      toast.error(error.message || "Verifikasi OTP gagal.", {
        position: "bottom-right",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    try {
      const response = await resendOtpApi(email);
      toast.success(response.message || "Kode OTP baru telah dikirim.", {
        position: "bottom-right",
      });
      setOtp(Array(6).fill("")); // Kosongkan field OTP
      setTimer(120); // Reset timer
      inputsRef.current[0]?.focus();
    } catch (error) {
      toast.error(error.message || "Gagal mengirim ulang OTP.", {
        position: "bottom-right",
      });
    } finally {
      setIsResending(false);
    }
  };

  if (!email) {
    return <p>Memuat atau terjadi kesalahan...</p>; // Tampilan sementara jika email tidak ada
  }

  return (
    <>
      <Title>Verifikasi OTP | Judi Guard</Title>
      <div className="relative fade-in-transition min-h-screen flex items-center justify-center ">
        <div className="absolute inset-0">
          <div className="h-1/2 bg-blue-200"></div>
          <div className="h-1/2 bg-blue-100"></div>
        </div>

        <img
          src={LogoWithSlogan}
          alt="Judi Guard Logo"
          width={150}
          height={150}
          className="absolute top-5"
        />

        <div className="z-10 bg-transparent p-8 rounded-xl w-full max-w-md text-center">
          <h2 className="text-2xl font-bold text-teal-500 mb-10">
            Masukkan OTP
          </h2>
          <p className="text-sm text-gray-600 mb-10">
            Ketik 6 digit kode yang dikirimkan ke <strong>{email}</strong>
          </p>
          <div className="flex justify-center gap-2 mb-6">
            {otp.map((digit, i) => (
              <input
                key={i}
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
              <span className="font-semibold">
                {Math.floor(timer / 60)
                  .toString()
                  .padStart(2, "0")}
                :{(timer % 60).toString().padStart(2, "0")}
              </span>
            </p>
          ) : (
            <button
              onClick={handleResend}
              disabled={isResending}
              className="text-sm text-blue-600 hover:underline mb-6 disabled:opacity-50"
            >
              {isResending ? "Mengirim..." : "Kirim Ulang OTP"}
            </button>
          )}
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || otp.join("").length !== 6}
            className="w-full bg-[#09B3A5] text-white px-8 py-3 rounded-xl hover:bg-teal-600 transition-colors font-semibold disabled:opacity-50"
          >
            {isSubmitting ? "Memverifikasi..." : "Verifikasi"}
          </button>
        </div>
      </div>
    </>
  );
};

export default OtpPage;
