import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'motion/react';
import { SearchIcon } from '@/assets/icons/SearchIcon';
import { LoadingSpinner } from '@/assets/icons/LoadingSpinner';

const TextPredictInput = ({ value, onChange, onSubmit, isLoading, ...props }) => {
  return (
    <motion.form onSubmit={onSubmit} className="relative">
      <input
        {...props}
        data-cy="text-input"
        type="text"
        value={value}
        onChange={onChange}
        className="w-full px-5 py-3 pr-32 text-sm sm:text-base text-foreground placeholder-muted-foreground bg-background border border-input rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring disabled:opacity-60 transition"
        placeholder="Contoh: Menang judi bola sampai WD 100Jt"
        disabled={isLoading}
        required
      />

      <div className="absolute inset-y-0 right-0 flex py-1.5 pr-1.5">
        <motion.button
          data-cy="analyze-button"
          type="submit"
          disabled={isLoading}
          whileHover={{ scale: isLoading ? 1 : 1.04 }}
          whileTap={{ scale: isLoading ? 1 : 0.96 }}
          className="btn-brand h-full px-4 sm:px-6 py-2 text-sm rounded-full focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <>
              <SearchIcon />
              <span className="hidden sm:inline sm:ml-2">Analisis</span>
            </>
          )}
        </motion.button>
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
