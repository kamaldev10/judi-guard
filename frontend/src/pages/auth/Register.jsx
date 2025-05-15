import React, { useState } from "react";
import LogoWithSlogan from "../../assets/images/LogoWithSlogan.png";
import { Link, useNavigate } from "react-router-dom";
import { Title } from "react-head";
import { Eye, EyeOff } from "lucide-react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { toast } from "react-toastify";

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState("");
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
    // Simulate registration process here (e.g., API call)
    // On success, show toast and redirect or clear form
    toast.success("Anda berhasil mendaftar", {
      position: "bottom-right",
    });
    navigate("/otp", { state: { email: formValues.email } });
  };

  return (
    <>
      <Title>Register | Judi Guard</Title>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[--bg-blueOne] from-1/2 to-[--bg-blueSecond] to-1/2">
        <div className="w-full max-w-md bg-transparent p-8 ">
          <div className=" static flex flex-col items-center mb-10 ">
            <img
              src={LogoWithSlogan}
              alt="Judi Guard Logo"
              width={150}
              height={150}
              className="absolute top-0 "
            />
          </div>

          <form>
            <h1 className="text-center text-[var(--primary-color)] font-semibold text-xl mb-5">
              Daftar
            </h1>
            <div className="mb-4">
              <label for="name" className="block text-sm mb-1 font-semibold">
                Nama Lengkap
              </label>
              <input
                type="text"
                name="name"
                autoComplete="name"
                value={formValues.name}
                onChange={handleChange}
                className="w-full px-4 py-1 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
                autoFocus
              />{" "}
              {formErrors.name && (
                <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
              )}
            </div>

            <div className="mb-4">
              <label for="email" className="block text-sm mb-1 font-semibold">
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
              />{" "}
              {formErrors.email && (
                <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
              )}
            </div>

            <div className="mb-4">
              <label for="tel" className="block text-sm mb-1 font-semibold">
                No. Telepon
              </label>
              <PhoneInput
                country="id"
                value={phone}
                onChange={setPhone}
                containerClass="w-full"
                inputClass="w-full focus:outline-none focus:ring-2  focus:ring-[var(--primary-color)]"
                buttonClass="h-full"
                inputProps={{ id: "tel", name: "tel", autoComplete: "tel" }}
              />
            </div>

            <div className="mb-4">
              <div className="flex justify-between mb-1">
                <label
                  for="password"
                  className=" justify-self-start text-sm font-semibold"
                >
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
                    <EyeOff aria-label="Show Password" size={20} />
                  ) : (
                    <Eye aria-label="Hide Password" size={20} />
                  )}
                </button>
              </div>{" "}
              {validationPassword && (
                <p className="mt-1 text-sm text-red-600">
                  {validationPassword}
                </p>
              )}
            </div>
            <button
              type="submit"
              onClick={handleRegister}
              className="w-full py-1 mt-2 bg-[var(--primary-color)] text-white font-semibold rounded-xl hover:bg-[#089db1] transition"
            >
              Daftar
            </button>
          </form>
          <p className="text-center text-sm mt-6">
            Sudah punya akun?
            <Link
              to="/login"
              className="text-[var(--primary-color)] ms-1 font-medium hover:underline"
            >
              Masuk di sini
            </Link>
          </p>
        </div>
      </div>
    </>
  );
};
export default Register;
