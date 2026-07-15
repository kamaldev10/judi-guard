import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-toastify';
import {
  validateUserName,
  validateEmail,
  validateRegistrationPassword,
} from '@/shared/utils/formValidators.js';
import { useRegisterMutation } from '../hooks/useAuthMutations.js';
import GoogleSignInButton from './GoogleSignInButton.jsx';

const RegisterForm = () => {
  const registerMutation = useRegisterMutation();

  const [showPassword, setShowPassword] = useState(false);
  const [formValues, setFormValues] = useState({
    userName: '',
    email: '',
    password: '',
  });
  const [formErrors, setFormErrors] = useState({
    userName: '',
    email: '',
    password: '',
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

    let error = '';
    if (name === 'userName') error = validateUserName(value);
    else if (name === 'email') error = validateEmail(value);
    else if (name === 'password') error = validateRegistrationPassword(value);

    setFormErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!validateAllFields()) {
      toast.error('Harap perbaiki semua error pada form.', {
        position: 'bottom-right',
      });
      return;
    }

    try {
      await registerMutation.mutateAsync(formValues);
      navigate('/otp', { state: { email: formValues.email } });
    } catch (error) {
      toast.error(error.message || 'Registrasi gagal. Silakan coba lagi.', {
        position: 'bottom-right',
      });
    }
  };

  const isLoadingAuth = registerMutation.isPending;

  return (
    <>
      <form onSubmit={handleRegister}>
        <h1 className="text-center text-teal-700 font-bold text-xl mb-5">Daftar</h1>

        {/* Username */}
        <div className="mb-4 text-black">
          <label htmlFor="userName" className="block text-sm mb-1 font-semibold">
            Username
          </label>
          <input
            data-cy="username-input"
            type="text"
            name="userName"
            id="userName"
            autoComplete="username"
            value={formValues.userName}
            onChange={handleChange}
            disabled={isLoadingAuth}
            className={`w-full px-4 py-1 border rounded-xl focus:outline-none focus:ring-2 bg-white ${
              formErrors.userName
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:ring-teal-500'
            } ${isLoadingAuth ? 'opacity-50 cursor-not-allowed' : ''}`}
            autoFocus
          />
          {formErrors.userName && (
            <p className="mt-1 text-sm text-red-600">{formErrors.userName}</p>
          )}
        </div>

        {/* Email */}
        <div className="mb-4 text-black">
          <label htmlFor="email" className="block text-sm mb-1 font-semibold">
            Email
          </label>
          <input
            data-cy="email-input"
            id="email"
            name="email"
            type="email"
            value={formValues.email}
            onChange={handleChange}
            disabled={isLoadingAuth}
            autoComplete="email"
            className={`w-full px-4 py-1 border rounded-xl focus:outline-none focus:ring-2 bg-white ${
              formErrors.email
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:ring-teal-500'
            } ${isLoadingAuth ? 'opacity-50 cursor-not-allowed' : ''}`}
          />
          {formErrors.email && <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>}
        </div>

        {/* Password */}
        <div className="mb-4 text-black">
          <div className="flex justify-between mb-1">
            <label htmlFor="password" className="text-sm font-semibold">
              Password
            </label>
          </div>
          <div className="relative flex items-center">
            <input
              data-cy="password-input"
              name="password"
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={formValues.password}
              onChange={handleChange}
              disabled={isLoadingAuth}
              className={`w-full px-4 py-1 border rounded-xl focus:outline-none focus:ring-2 bg-white ${
                formErrors.password
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-teal-500'
              } ${isLoadingAuth ? 'opacity-50 cursor-not-allowed' : ''}`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isLoadingAuth}
              className={`absolute right-3 text-gray-500 hover:text-gray-700 ${
                isLoadingAuth ? 'opacity-50 cursor-not-allowed' : ''
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
            <p className="mt-1 text-sm text-red-600">{formErrors.password}</p>
          )}
        </div>

        {/* Submit */}
        <button
          data-cy="register-button"
          type="submit"
          disabled={isLoadingAuth}
          className="w-full py-1 mt-2 bg-[#25c0d4] text-white font-semibold rounded-xl hover:bg-[#089db1] transition disabled:opacity-50"
        >
          {isLoadingAuth ? 'Mendaftar...' : 'Daftar'}
        </button>

        {/* Redirect to login */}
        <p className="text-center text-sm mt-6 text-black">
          Sudah punya akun?
          <Link
            to="/login"
            className={`ms-1 font-semibold hover:underline ${
              isLoadingAuth ? 'pointer-events-none opacity-50' : ''
            }`}
          >
            Masuk di sini
          </Link>
        </p>
      </form>

      {/* OR divider */}
      <div className="flex items-center my-5">
        <hr className="grow border-gray-400" />
        <span className="mx-2 text-gray-600 text-sm font-medium">OR</span>
        <hr className="grow border-gray-400" />
      </div>

      {/* Google Sign In */}
      <GoogleSignInButton buttonText="Daftar dengan Google" disabled={isLoadingAuth} />
    </>
  );
};

export default RegisterForm;
