import React, { useState } from "react";
import { motion } from "framer-motion";
import { useTextPredictStore } from "@/stores/textPredictStore";

import TextPredictInput from "./TextPredictInput";
import TextPredictResult from "./TextPredictResult";

const TextPredictForm = () => {
  const [inputText, setInputText] = useState("");
  const { prediction, isLoading, error, analyze, clear } =
    useTextPredictStore();

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!inputText.trim()) return;
    analyze(inputText);
  };

  return (
    <motion.section
      className="min-h-[50vh] w-full px-6 py-4 sm:px-8 sm:py-6 bg-teal-50 rounded-2xl shadow-md"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.7, delay: 0.2 }}
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
