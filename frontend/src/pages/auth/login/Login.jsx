import React, { useState } from "react";
import LogoWithSlogan from "../../../assets/images/LogoWithSlogan.png";
import { Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Title } from "react-head";
import { toast } from "react-toastify";
import { Icon } from "@iconify/react";

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formValues, setFormValues] = useState({ email: "", password: "" });
  const [formErrors, setFormErrors] = useState({ email: "", password: "" });

  // Validasi
  const validateEmail = (email) => {
    if (!email.trim()) return "Email is required.";
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email) ? "" : "Email is invalid.";
  };

  const validatePassword = (password) => {
    const rules = [
      {
        test: (v) => v.length >= 8,
        message: "Password must be at least 8 characters long.",
      },
      {
        test: (v) => /[A-Z]/.test(v),
        message: "Password must contain at least one uppercase letter.",
      },
      {
        test: (v) => /[a-z]/.test(v),
        message: "Password must contain at least one lowercase letter.",
      },
      {
        test: (v) => /\d/.test(v),
        message: "Password must contain at least one number.",
      },
      {
        test: (v) => /[!@#$%^&*(),.?":{}|<>]/.test(v),
        message: "Password must contain at least one special character.",
      },
    ];
    for (let rule of rules) {
      if (!rule.test(password)) return rule.message;
    }
    return "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormValues((prev) => ({ ...prev, [name]: value }));

    const validators = {
      email: validateEmail,
      password: validatePassword,
    };

    setFormErrors((prev) => ({
      ...prev,
      [name]: validators[name](value),
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    const emailError = validateEmail(formValues.email);
    const passwordError = validatePassword(formValues.password);

    setFormErrors({ email: emailError, password: passwordError });

    if (emailError || passwordError) return;
    toast.success("Anda berhasil login", { position: "top-center" });
    navigate("/");
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
          <form>
            <h1 className="text-center text-[var(--primary-color)] font-semibold text-xl mb-5">
              Masuk
            </h1>
            <div className="mb-4">
              <label
                aria-labelledby="email"
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
                className="w-full px-4 py-1 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
                autoFocus
              />
              {formErrors.email && (
                <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
              )}
            </div>

            <div className="mb-4">
              <div className="flex justify-between mb-1">
                <label
                  aria-labelledby="password"
                  className=" justify-self-start text-sm font-semibold"
                >
                  Password
                </label>
                <a
                  href="#"
                  className="text-sm text-[var(--primary-color)] hover:underline"
                >
                  Lupa kata sandi
                </a>
              </div>
              <div className="relative flex items-center">
                <input
                  name="password"
                  id="password"
                  value={formValues.password}
                  onChange={handleChange}
                  type={showPassword ? "text" : "password"}
                  className="w-full px-4 py-1 border rounded-xl border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-400"
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
                <p className="text-red-600 text-sm">{formErrors.password}</p>
              )}
            </div>
            <button
              type="submit"
              onClick={handleLogin}
              className="w-full py-1 mt-2 bg-[var(--primary-color)] text-white font-semibold border rounded-md hover:bg-[#089db1] transition"
            >
              Masuk
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

          <button className="w-full flex items-center justify-center gap-2 border border-gray-400 rounded-md py-2 hover:bg-gray-100 transition">
            <Icon
              icon="logos:google-icon"
              width="25"
              height="25"
              className="items-start"
            />
            <span className="text-sm font-medium text-gray-700">
              Masuk Dengan Google
            </span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Login;
