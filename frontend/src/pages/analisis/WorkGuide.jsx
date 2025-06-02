import React from "react";
import { motion } from "motion/react";

const WorkGuide = () => {
  return (
    <div>
      {/* Cara Kerja */}
      <motion.section
        id="work-guide"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-transparent  border-2 border-gray-500 shadow-md rounded-xl p-6 mb-6 scroll-mt-10"
      >
        <h2 className="text-center text-xl md:text-2xl font-bold text-[#136854] mb-8">
          Cara Kerja
        </h2>
        <div className="flex flex-col md:flex-row justify-around items-center gap-8">
          <div className="flex flex-col items-center">
            <span className="text-4xl">💬</span>
            <p className="mt-2 text-sm font-semibold">Input Komentar</p>
          </div>
          <div className="text-3xl text-[#136854]">➔</div>
          <div className="flex flex-col items-center">
            <span className="text-4xl">🧠</span>
            <p className="mt-2 text-sm font-semibold">Analisis Komentar</p>
          </div>
          <div className="text-3xl text-[#136854]">➔</div>
          <div className="flex flex-col items-center">
            <span className="text-4xl">🔍</span>
            <p className="mt-2 text-sm font-semibold">Hasil Analisis</p>
          </div>
        </div>
      </motion.section>
    </div>
  );
};

export default WorkGuide;
