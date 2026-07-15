import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { validateEmail, validateLoginPassword } from '@/shared/utils/formValidators.js';
import { useLoginMutation } from '../hooks/useAuthMutations.js';
import GoogleSignInButton from './GoogleSignInButton.jsx';

const LoginForm = () => {
  const navigate = useNavigate();
  const loginMutation = useLoginMutation();

  const [showPassword, setShowPassword] = useState(false);
  const [formValues, setFormValues] = useState({ email: '', password: '' });
  const [formErrors, setFormErrors] = useState({ email: '', password: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));

    let error = '';
    if (name === 'email') error = validateEmail(value);
    else if (name === 'password') error = validateLoginPassword(value);

    setFormErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    const emailError = validateEmail(formValues.email);
    const passwordError = validateLoginPassword(formValues.password);

    setFormErrors({ email: emailError, password: passwordError });

    if (emailError || passwordError) return;

    try {
      await loginMutation.mutateAsync(formValues);

      toast.success('Anda berhasil login!', {
        position: 'bottom-right',
        duration: 2000,
        toastId: 'toast-login-success',
      });

      setTimeout(() => {
        navigate('/');
      }, 0);
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.message || error.toString();
      toast.error(errorMessage, {
        position: 'bottom-right',
        toastId: 'toast-login-error',
      });
    }
  };

  const isLoadingAuth = loginMutation.isPending;

  return (
    <>
      <form onSubmit={handleLogin}>
        <h1 className="text-center text-teal-700 font-bold text-xl mb-5">Masuk</h1>

        {/* Email Input */}
        <div className="mb-4 ">
          <label htmlFor="email" className="block text-sm text-black mb-1 font-semibold">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            data-cy="email-input"
            autoComplete="email"
            value={formValues.email}
            onChange={handleChange}
            disabled={isLoadingAuth}
            className={`w-full px-4 py-1 border rounded-xl focus:outline-none focus:ring-2 bg-white text-black ${
              formErrors.email
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:ring-teal-700'
            } ${isLoadingAuth ? 'opacity-50 cursor-not-allowed' : ''}`}
            autoFocus
          />
          {formErrors.email && <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>}
        </div>

        {/* Password Input */}
        <div className="mb-4">
          <div className="flex justify-between mb-1">
            <label
              htmlFor="password"
              className="justify-self-start text-black text-sm font-semibold"
            >
              Password
            </label>
            <Link
              data-cy="forgot-password-link"
              to="/forgot-password"
              className="text-sm text-black hover:underline"
            >
              Lupa kata sandi
            </Link>
          </div>
          <div className="relative flex items-center">
            <input
              name="password"
              id="password"
              data-cy="password-input"
              value={formValues.password}
              onChange={handleChange}
              type={showPassword ? 'text' : 'password'}
              disabled={isLoadingAuth}
              className={`w-full px-4 py-1 border rounded-xl focus:outline-none focus:ring-2 bg-white text-black ${
                formErrors.password
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-teal-700'
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
                <EyeOff aria-label="Show Password" size={20} />
              ) : (
                <Eye aria-label="Hide Password" size={20} />
              )}
            </button>
          </div>
          {formErrors.password && (
            <p className="text-red-600 text-sm mt-1">{formErrors.password}</p>
          )}
        </div>

        <button
          type="submit"
          data-cy="log-in-button"
          disabled={isLoadingAuth}
          className="w-full py-1 mt-2 bg-[#25c0d4] text-white font-semibold border rounded-xl hover:bg-[#089db1] transition disabled:opacity-50"
        >
          {isLoadingAuth ? 'Memproses...' : 'Masuk'}
        </button>

        <div className="flex gap-3 mt-6">
          <p className="text-center text-sm text-black">
            Belum punya akun?
            <Link to="/register" className=" ms-1 font-semibold hover:underline">
              Daftar disini
            </Link>
          </p>
        </div>
      </form>

      <div className="flex items-center my-10">
        <hr className="grow border-gray-400" />
        <span className="mx-2 text-gray-600 text-sm font-medium">OR</span>
        <hr className="grow border-gray-400" />
      </div>

      <GoogleSignInButton buttonText="Masuk dengan Google" disabled={isLoadingAuth} />
    </>
  );
};

export default LoginForm;
