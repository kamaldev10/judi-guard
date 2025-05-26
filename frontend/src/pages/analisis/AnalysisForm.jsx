import { motion } from "motion/react";
import React from "react";

const AnalysisForm = () => {
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
              Message:
            </label>
            <input
              id="message"
              type="text"
              placeholder="Contoh: Daftar sekarang di website judi online"
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400"
            />
          </div>
          <div>
            <label
              htmlFor="sumber"
              className="block text-gray-700 font-semibold mb-1"
            >
              Sumber Komentar:
            </label>
            <select
              id="sumber"
              className="w-1/2 border border-gray-300 rounded-md px-4 py-2 bg-[#09B3A5] focus:outline-none focus:ring-2 focus:ring-teal-400"
            >
              <option value="">YouTube</option>
              <option value="">Facebook</option>
              <option value="">Instagram</option>
            </select>
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

export default AnalysisForm;
