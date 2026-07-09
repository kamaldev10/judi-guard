import { Eye, EyeOff, KeyRound } from 'lucide-react';
import React, { memo } from 'react';
import PropTypes from 'prop-types';

export const PasswordInput = memo(
  ({ id, label, value, onChange, show, setShow, isLoading, ...props }) => (
    <div className="relative">
      <label htmlFor={id} className="block text-sm font-semibold text-gray-600 mb-2">
        {label}
      </label>
      <div className="relative">
        <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          {...props}
          type={show ? 'text' : 'password'}
          id={id}
          value={value}
          onChange={onChange}
          required
          disabled={isLoading}
          className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-300 disabled:bg-gray-100"
          placeholder="********"
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-indigo-600 focus:outline-none transition-colors duration-300"
          tabIndex={-1}
        >
          {show ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>
    </div>
  ),
);
PasswordInput.propTypes = {
  id: PropTypes.string,
  label: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func,
  show: PropTypes.bool,
  setShow: PropTypes.func,
  isLoading: PropTypes.bool,
  // Properti lain akan lolos
};
