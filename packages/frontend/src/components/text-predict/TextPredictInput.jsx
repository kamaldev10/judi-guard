import React from "react";
import PropTypes from "prop-types";
import { motion } from "framer-motion";
import { SearchIcon } from "@/assets/icons/SearchIcon";
import { LoadingSpinner } from "@/assets/icons/LoadingSpinner";

const TextPredictInput = ({
  value,
  onChange,
  onSubmit,
  isLoading,
  ...props
}) => {
  return (
    <motion.form onSubmit={onSubmit} className="relative mt-4 sm:mt-6">
      <input
        {...props}
        data-cy="text-input"
        type="text"
        value={value}
        onChange={onChange}
        className="w-full px-5 py-3 pr-32 text-sm sm:text-base text-gray-900 placeholder-gray-500 bg-white border border-gray-300 rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:bg-gray-100 transition"
        placeholder="Contoh: Menang judi bola sampai WD 100Jt"
        disabled={isLoading}
        required
      />

      <div className="absolute inset-y-0 right-0 flex py-1.5 pr-1.5">
        <button
          data-cy="analyze-button"
          type="submit"
          disabled={isLoading}
          className="inline-flex items-center justify-center h-full px-4 sm:px-6 py-2 text-sm font-semibold text-white bg-teal-700 rounded-full shadow-sm hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-600 disabled:bg-teal-500 disabled:cursor-not-allowed transition-all duration-300"
        >
          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <>
              <SearchIcon />
              <span className="hidden sm:inline sm:ml-2">Analisis</span>
            </>
          )}
        </button>
      </div>
    </motion.form>
  );
};

TextPredictInput.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
};

export default TextPredictInput;
