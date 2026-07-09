import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useTextPredictStore } from '@/stores/textPredictStore';

import TextPredictInput from './TextPredictInput';
import TextPredictResult from './TextPredictResult';

const TextPredictForm = () => {
  const [inputText, setInputText] = useState('');
  const { prediction, isLoading, error, analyze, clear } = useTextPredictStore();

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!inputText.trim()) return;
    analyze(inputText);
  };

  return (
    <motion.section
      className="min-h-[50vh] w-full px-6 py-6 sm:px-8 sm:py-8 glass-panel rounded-2xl mt-6"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6 }}
    >
      <TextPredictInput
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />

      <TextPredictResult
        prediction={prediction}
        isLoading={isLoading}
        error={error}
        clear={clear}
      />
    </motion.section>
  );
};

export default TextPredictForm;
