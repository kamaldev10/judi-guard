// src/components/Register.jsx
import React, { useState } from "react"; // Hapus useEffect jika tidak dipakai lagi
import LogoWithSlogan from "../../../assets/images/LogoWithSlogan.png"; // Sesuaikan path
import { Link, useNavigate } from "react-router-dom";
import { Title } from "react-head";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "react-toastify";
import { Icon } from "@iconify/react";
import {
  validateUserName,
  validateEmail,
  validateRegistrationPassword,
} from "../../../utils/FormValidators"; // Impor validateUserName
import { registerUserApi } from "../../../services/api";
import GoogleSignInButton from "../../../components/auth/GoogleSignInButton";
// import GoogleSignInButton from "./GoogleSignInButton";

const Register = () => {
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const validateAllFields = () => {
    const userNameError = validateUserName(formValues.userName); // Validasi userName
    const emailError = validateEmail(formValues.email);
    const passwordError = validateRegistrationPassword(formValues.password);
    setFormErrors({
      userName: userNameError, // Update error untuk userName
      email: emailError,
      password: passwordError,
    });
    return !userNameError && !emailError && !passwordError;
  };

  const handleChange = (e) => {
    const { name, value } = e.target; // 'name' di sini adalah atribut 'name' dari input HTML
    setFormValues((prev) => ({
      ...prev,
      [name]: value, // Ini akan mengupdate formValues.userName, formValues.email, atau formValues.password
    }));

    let error = "";
    if (name === "userName")
      error = validateUserName(value); // Validasi untuk userName
    else if (name === "email") error = validateEmail(value);
    else if (name === "password") error = validateRegistrationPassword(value);

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
    setIsSubmitting(true);
    try {
      // formValues sudah memiliki userName, email, password
      await registerUserApi(formValues);
      toast.success(
        "Anda berhasil mendaftar! Silahkan Verivikasi OTP anda...",
        {
          position: "bottom-right",
        }
      );
      navigate("/otp", { state: { email: formValues.email } });
    } catch (error) {
      toast.error(error.message || "Registrasi gagal. Silakan coba lagi.", {
        position: "bottom-right",
      });
    } finally {
      setIsSubmitting(false);
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
                className={`w-full px-4 py-1 border rounded-xl focus:outline-none focus:ring-2 bg-white ${formErrors.userName ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-[var(--primary-color)]"}`}
                autoFocus
              />
              {formErrors.userName && (
                <p className="mt-1 text-sm text-red-600">
                  {formErrors.userName}
                </p>
              )}
            </div>

            {/* Input Email tetap sama */}
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
                autoComplete="email"
                className={`w-full px-4 py-1 border rounded-xl focus:outline-none focus:ring-2 bg-white ${formErrors.email ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-[var(--primary-color)]"}`}
              />
              {formErrors.email && (
                <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
              )}
            </div>

            {/* Input Password tetap sama */}
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
                  className={`w-full px-4 py-1 border rounded-xl focus:outline-none focus:ring-2 bg-white ${formErrors.password ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-[var(--primary-color)]"}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-gray-500 hover:text-gray-700"
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
              disabled={isSubmitting}
              className="w-full py-1 mt-2 bg-[var(--primary-color)] text-white font-semibold rounded-xl hover:bg-[#089db1] transition disabled:opacity-50"
            >
              {isSubmitting ? "Mendaftar..." : "Daftar"}
            </button>

            <p className="text-center text-sm mt-6">
              Sudah punya akun?
              <Link
                to="/login"
                className="text-[var(--primary-color)] ms-1 font-medium hover:underline"
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
          {/* <GoogleSignInButton /> */}
          <div className="flex w-full justify-center">
            <GoogleSignInButton buttonText="Daftar dengan google" />
          </div>
        </div>
      </div>
    </>
  );
};

export default Register;
