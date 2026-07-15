import React from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'motion/react';

const classificationStyles = {
  JUDI: {
    tile: 'bg-red-500/10 border border-red-500/30',
    text: 'text-red-600 dark:text-red-400',
    bar: 'linear-gradient(to right, #f87171, #ef4444)',
  },
  NON_JUDI: {
    tile: 'bg-green-500/10 border border-green-500/30',
    text: 'text-green-600 dark:text-green-400',
    bar: 'linear-gradient(to right, #34d399, #10b981)',
  },
  OTHER: {
    tile: 'bg-yellow-400/10 border border-yellow-500/30',
    text: 'text-yellow-600 dark:text-yellow-400',
    bar: 'linear-gradient(to right, #facc15, #f59e0b)',
  },
};

const TextPredictResult = ({ prediction, isLoading, error, clear }) => {
  return (
    <div className="mt-6">
      <AnimatePresence mode="wait">
        {isLoading && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center gap-4 py-20"
          >
            <div className="scan-pulse w-12 h-12 rounded-full border-2 border-brand-500 flex items-center justify-center">
              <span className="w-2.5 h-2.5 rounded-full bg-brand-500" />
            </div>
            <p className="text-brand-600 dark:text-brand-400">Menganalisis dengan model AI...</p>
          </motion.div>
        )}

        {error && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-4 font-semibold text-center text-destructive bg-destructive/10 border border-destructive/30 rounded-lg"
            role="alert"
          >
            Error: {error}
          </motion.div>
        )}

        {prediction && (
          <motion.div
            data-cy="prediction-result-container"
            key="prediction"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <ResultCard prediction={prediction} clear={clear} />
          </motion.div>
        )}

        {!prediction && !isLoading && !error && (
          <motion.div
            key="initial"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-center py-10 text-muted-foreground"
          >
            ⚠️ Tidak ada teks yang diprediksi. Silahkan masukkan teks Anda.
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

TextPredictResult.propTypes = {
  prediction: PropTypes.object,
  isLoading: PropTypes.bool.isRequired,
  error: PropTypes.string,
  clear: PropTypes.func.isRequired,
};

const ResultCard = ({ prediction, clear }) => {
  const { classification, confidenceScore, modelVersion } = prediction;
  const style = classificationStyles[classification] || classificationStyles.OTHER;
  const pct = (confidenceScore * 100).toFixed(1);

  return (
    <div className="mx-auto rounded-xl p-6 shadow-xl bg-card border border-border">
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-1">
          <h3 className="text-xl sm:text-2xl font-bold heading-gradient">Hasil Prediksi</h3>
          <p className="text-sm text-muted-foreground">Model: {modelVersion}</p>
        </div>
        <div className="flex items-center space-x-2 bg-brand-50 dark:bg-brand-100/10 px-3 py-1 rounded-full">
          <span className="w-2 h-2 bg-brand-600 dark:bg-brand-400 rounded-full animate-pulse" />
          <span className="text-sm text-brand-700 dark:text-brand-400 font-medium">Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
        <div className={`rounded-lg p-4 flex flex-col justify-center items-center ${style.tile}`}>
          <span className={`block text-2xl sm:text-3xl font-bold ${style.text}`}>
            {classification}
          </span>
          <span className="text-sm text-muted-foreground mt-1">Classification</span>
        </div>

        <div className="sm:col-span-2 rounded-lg p-4 bg-muted/50">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium text-foreground">Confidence Score</span>
            <span className="text-sm font-bold text-foreground">{pct}%</span>
          </div>
          <div className="w-full h-4 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${pct}%`, background: style.bar }}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-center sm:justify-start">
        <button
          onClick={clear}
          className="btn-brand px-6 py-2 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          Reset Hasil
        </button>
      </div>
    </div>
  );
};

ResultCard.propTypes = {
  prediction: PropTypes.shape({
    classification: PropTypes.string.isRequired,
    confidenceScore: PropTypes.number.isRequired,
    modelVersion: PropTypes.string.isRequired,
  }).isRequired,
  clear: PropTypes.func.isRequired,
};

export default TextPredictResult;
