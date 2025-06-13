// src/components/Login.jsx
import React, { useState } from "react";
import LogoWithSlogan from "../../../assets/images/LogoWithSlogan.png"; // Sesuaikan path
import { Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Title } from "react-head";
import { toast } from "react-toastify";

import { loginUserApi } from "../../../services/api";
import { useAuth } from "../../../contexts/AuthContext";

import {
  validateEmail,
  validateLoginPassword,
} from "../../../utils/FormValidators";
import GoogleSignInButton from "../../../components/auth/GoogleSignInButton";
import Swal from "sweetalert2";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [formValues, setFormValues] = useState({ email: "", password: "" });
  const [formErrors, setFormErrors] = useState({ email: "", password: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  // const [errorServer, setErrorServer] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));

    let error = "";
    if (name === "email")
      error = validateEmail(value); // Gunakan validateEmail yang sudah ada
    else if (name === "password") error = validateLoginPassword(value); // Gunakan validasi password login yang sederhana

    setFormErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    const emailError = validateEmail(formValues.email);
    const passwordError = validateLoginPassword(formValues.password); // Validasi sederhana sebelum submit

    setFormErrors({ email: emailError, password: passwordError });

    if (emailError || passwordError) {
      return;
    }

    setIsSubmitting(true);
    // setErrorServer("");

    try {
      const response = await loginUserApi(formValues);
      login(response.data.user, response.data.token);
      navigate("/"); // Arahkan ke dashboard atau halaman utama
      toast.success("Anda berhasil login!", { position: "bottom-right" });
    } catch (error) {
      console.error("Login error:", error);
      const errorMessage =
        "Login gagal.Anda Mendaftarkan akun ini dengan Google.";
      //karena ketika dengan google, password itu tidak wajib
      // Tampilkan error dari server di toast atau di bawah form
      toast.error(errorMessage, { position: "bottom-right" });
      // setErrorServer(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleComingSoon = () => {
    Swal.fire("Coming Soon!");
  };
  return (
    <>
      <Title>Login | Judi Guard</Title>
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
        <div className="z-10 w-full max-w-md bg-transparent p-8 ">
          <form onSubmit={handleLogin}>
            <h1 className="text-center text-[var(--primary-color)] font-semibold text-xl mb-5">
              Masuk
            </h1>
            {/* {errorServer && (
              <p
                style={{
                  color: "red",
                  textAlign: "center",
                  marginBottom: "1rem",
                }}
              >
                {errorServer}
              </p>
            )} */}
            <div className="mb-4">
              <label
                htmlFor="email"
                className="block text-sm mb-1 font-semibold"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                autoComplete="email"
                value={formValues.email}
                onChange={handleChange}
                className={`w-full px-4 py-1 border bg-white rounded-xl focus:outline-none focus:ring-2 ${formErrors.email ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-[var(--primary-color)]"}`}
                autoFocus
              />
              {formErrors.email && (
                <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
              )}
            </div>

            <div className="mb-4">
              <div className="flex justify-between mb-1">
                <label
                  htmlFor="password"
                  className=" justify-self-start text-sm font-semibold"
                >
                  Password
                </label>
                <Link
                  onClick={handleComingSoon}
                  // to="/forgot-password"
                  className="text-sm text-[var(--primary-color)] hover:underline"
                >
                  Lupa kata sandi
                </Link>
              </div>
              <div className="relative flex items-center">
                <input
                  name="password"
                  id="password"
                  value={formValues.password}
                  onChange={handleChange}
                  type={showPassword ? "text" : "password"}
                  className={`w-full px-4 py-1 border rounded-xl bg-white focus:outline-none focus:ring-2 ${formErrors.password ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-[var(--primary-color)]"}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? (
                    <EyeOff aria-label="Show Password" size={20} />
                  ) : (
                    <Eye aria-label="Hide Password" size={20} />
                  )}
                </button>
              </div>
              {formErrors.password && (
                <p className="text-red-600 text-sm mt-1">
                  {formErrors.password}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-1 mt-2 bg-[var(--primary-color)] text-white font-semibold border rounded-xl hover:bg-[#089db1] transition disabled:opacity-50"
            >
              {isSubmitting ? "Memproses..." : "Masuk"}
            </button>

            <p className="text-center text-sm mt-6">
              Belum punya akun?
              <Link
                to="/register"
                className="text-[var(--primary-color)] ms-1 font-medium hover:underline"
              >
                Daftar di sini
              </Link>
            </p>
          </form>

          <div className="flex items-center my-10">
            <hr className="flex-grow border-gray-400" />
            <span className="mx-2 text-gray-600 text-sm font-medium">OR</span>
            <hr className="flex-grow border-gray-400" />
          </div>

          {/* <GoogleSignInButton /> */}
          <div className="flex w-full justify-center">
            <GoogleSignInButton buttonText="Masuk dengan google" />
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
