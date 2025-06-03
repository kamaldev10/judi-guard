import { motion } from "motion/react";
import React from "react";

const AnalysisFormSection = () => {
  return (
    <div>
      <motion.section
        id="analysis-form"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        className="bg-transparent border-2 border-gray-500 shadow-md rounded-xl p-8 max-w-xl mx-auto"
      >
        <h2 className="text-center text-xl md:text-2xl font-bold text-[#136854] mb-6">
          Analisis Komentar
        </h2>
        <div className="space-y-6">
          <div>
            <label
              htmlFor="message"
              className="block text-gray-700 font-semibold mb-1"
            >
              Link Video:<span className="text-teal-800"> Youtube</span>
            </label>
            <input
              id="message"
              type="text"
              placeholder="https://www.youtube.com/watch?v=mnyT6RBYqps&ab_channel=TribunJateng"
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400"
            />
          </div>
          <div className="text-center place-self-end">
            <button className=" bg-[#0f766e] text-white px-6 py-2 rounded-md hover:bg-[#0d5e57] transition-all duration-300">
              Analisis
            </button>
          </div>
        </div>
      </motion.section>
    </div>
  );
};

export default AnalysisFormSection;
