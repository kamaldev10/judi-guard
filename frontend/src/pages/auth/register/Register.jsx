import React, { useState } from "react";
import LogoWithSlogan from "../../../assets/images/LogoWithSlogan.png";
import { Link, useNavigate } from "react-router-dom";
import { Title } from "react-head";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "react-toastify";
import { Icon } from "@iconify/react";

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [validationPassword, setValidationPassword] = useState();
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const validateName = (name) => {
    if (!name.trim()) return "Name is required.";
    const hasNumbers = /\d/.test(name);
    if (hasNumbers) return "Name cannot contain number.";
    return;
  };

  const validateEmail = (email) => {
    if (!email.trim()) return "Email is required.";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return "Email is invalid.";
    return;
  };

  const validatePassword = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length < minLength) {
      return `Password must be at least ${minLength} characters long.`;
    }
    if (!hasUpperCase) {
      return "Password must contain at least one uppercase letter.";
    }
    if (!hasLowerCase) {
      return "Password must contain at least one lowercase letter.";
    }
    if (!hasNumbers) {
      return "Password must contain at least one number.";
    }
    if (!hasSpecialChars) {
      return "Password must contain at least one special character.";
    }
    return;
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    const validationError = validatePassword(newPassword);
    setValidationPassword(validationError);
  };

  const [formValues, setFormValues] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [formErrors, setFormErrors] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({
      ...prev,
      [name]: value,
    }));

    let error = "";
    if (name === "name") error = validateName(value);
    else if (name === "email") error = validateEmail(value);
    else if (name === "password") error = validatePassword(value);
    setFormErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  };

  const handleRegister = (e) => {
    e.preventDefault();
    toast.success("Anda berhasil mendaftar", {
      position: "bottom-right",
    });
    navigate("/otp", { state: { email: formValues.email } });
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
                htmlFor="name"
                className="block text-sm mb-1 font-semibold"
              >
                Nama Lengkap
              </label>
              <input
                type="text"
                name="name"
                id="name"
                autoComplete="name"
                value={formValues.name}
                onChange={handleChange}
                className="w-full px-4 py-1 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] bg-white"
                autoFocus
              />
              {formErrors.name && (
                <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
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
                autoComplete="email"
                className="w-full px-4 py-1 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
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
                  value={password}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-1 border rounded-xl border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-400"
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
              {validationPassword && (
                <p className="mt-1 text-sm text-red-600">
                  {validationPassword}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-1 mt-2 bg-[var(--primary-color)] text-white font-semibold rounded-xl hover:bg-[#089db1] transition"
            >
              Daftar
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

          <button className="w-full flex items-center justify-center gap-2 border border-gray-400 rounded-md py-2 hover:bg-gray-100 transition">
            <Icon icon="logos:google-icon" width="25" height="25" />
            <span className="text-sm font-medium text-gray-700">
              Masuk Dengan Google
            </span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Register;
