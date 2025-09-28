// src/components/Register.jsx
import React, { useState } from "react";
import { LogoWithSlogan } from "@/assets/images/index";
import { Link, useNavigate } from "react-router-dom";
import { Title } from "react-head";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "react-toastify";
import {
  validateUserName,
  validateEmail,
  validateRegistrationPassword,
} from "@/lib/utils/form-validators";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";
import { useAuthStore } from "@/stores";

const Register = () => {
  const { register, isLoadingAuth } = useAuthStore();

  const [showPassword, setShowPassword] = useState(false);
  const [formValues, setFormValues] = useState({
    userName: "",
    email: "",
    password: "",
  });
  const [formErrors, setFormErrors] = useState({
    userName: "",
    email: "",
    password: "",
  });

  const navigate = useNavigate();

  const validateAllFields = () => {
    const userNameError = validateUserName(formValues.userName);
    const emailError = validateEmail(formValues.email);
    const passwordError = validateRegistrationPassword(formValues.password);
    setFormErrors({
      userName: userNameError,
      email: emailError,
      password: passwordError,
    });
    return !userNameError && !emailError && !passwordError;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({
      ...prev,
      [name]: value,
    }));

    let error = "";
    if (name === "userName") {
      error = validateUserName(value);
    } else if (name === "email") {
      error = validateEmail(value);
    } else if (name === "password") {
      error = validateRegistrationPassword(value);
    }

    setFormErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!validateAllFields()) {
      toast.error("Harap perbaiki semua error pada form.", {
        position: "bottom-right",
      });
      return;
    }

    try {
      await register(formValues);

      toast.success("Anda berhasil mendaftar! Silahkan Login", {
        position: "bottom-right",
      });

      // UNTUK OTP DI TANGGUHKAN DULU
      // navigate("/otp", { state: { email: formValues.email } });
      navigate("/login");
    } catch (error) {
      toast.error(error.message || "Registrasi gagal. Silakan coba lagi.", {
        position: "bottom-right",
      });
    }
  };

  return (
    <>
      <Title>Register | Judi Guard</Title>
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
        <div className="z-10 w-full max-w-md bg-transparent p-8">
          <form onSubmit={handleRegister}>
            <h1 className="text-center text-[var(--primary-color)] font-semibold text-xl mb-5">
              Daftar
            </h1>

            <div className="mb-4">
              <label
                htmlFor="userName"
                className="block text-sm mb-1 font-semibold"
              >
                Username
              </label>
              <input
                type="text"
                name="userName"
                id="userName"
                autoComplete="username"
                value={formValues.userName}
                onChange={handleChange}
                disabled={isLoadingAuth}
                className={`w-full px-4 py-1 border rounded-xl focus:outline-none focus:ring-2 bg-white ${
                  formErrors.userName
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-[var(--primary-color)]"
                } ${isLoadingAuth ? "opacity-50 cursor-not-allowed" : ""}`}
                autoFocus
              />
              {formErrors.userName && (
                <p className="mt-1 text-sm text-red-600">
                  {formErrors.userName}
                </p>
              )}
            </div>

            <div className="mb-4">
              <label
                htmlFor="email"
                className="block text-sm mb-1 font-semibold"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formValues.email}
                onChange={handleChange}
                disabled={isLoadingAuth}
                autoComplete="email"
                className={`w-full px-4 py-1 border rounded-xl focus:outline-none focus:ring-2 bg-white ${
                  formErrors.email
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-[var(--primary-color)]"
                } ${isLoadingAuth ? "opacity-50 cursor-not-allowed" : ""}`}
              />
              {formErrors.email && (
                <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
              )}
            </div>

            <div className="mb-4">
              <div className="flex justify-between mb-1">
                <label htmlFor="password" className="text-sm font-semibold">
                  Password
                </label>
              </div>
              <div className="relative flex items-center">
                <input
                  name="password"
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formValues.password}
                  onChange={handleChange}
                  disabled={isLoadingAuth}
                  className={`w-full px-4 py-1 border rounded-xl focus:outline-none focus:ring-2 bg-white ${
                    formErrors.password
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:ring-[var(--primary-color)]"
                  } ${isLoadingAuth ? "opacity-50 cursor-not-allowed" : ""}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoadingAuth}
                  className={`absolute right-3 text-gray-500 hover:text-gray-700 ${
                    isLoadingAuth ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {showPassword ? (
                    <EyeOff aria-label="Hide Password" size={20} />
                  ) : (
                    <Eye aria-label="Show Password" size={20} />
                  )}
                </button>
              </div>
              {formErrors.password && (
                <p className="mt-1 text-sm text-red-600">
                  {formErrors.password}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoadingAuth}
              className="w-full py-1 mt-2 bg-[#25c0d4] text-white font-semibold rounded-xl hover:bg-[#089db1] transition disabled:opacity-50"
            >
              {isLoadingAuth ? "Mendaftar..." : "Daftar"}
            </button>

            <p className="text-center text-sm mt-6">
              Sudah punya akun?
              <Link
                to="/login"
                className={`text-[var(--primary-color)] ms-1 font-medium hover:underline ${
                  isLoadingAuth ? "pointer-events-none opacity-50" : ""
                }`}
              >
                Masuk di sini
              </Link>
            </p>
          </form>

          <div className="flex items-center my-5">
            <hr className="flex-grow border-gray-400" />
            <span className="mx-2 text-gray-600 text-sm font-medium">OR</span>
            <hr className="flex-grow border-gray-400" />
          </div>

          <div className="flex w-full justify-center">
            {/* ✅ GoogleSignInButton akan handle loading state sendiri */}
            <GoogleSignInButton
              buttonText="Daftar dengan google"
              // Google button bisa disabled jika regular register sedang loading
              disabled={isLoadingAuth}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default Register;
