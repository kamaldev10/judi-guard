import React from "react";
import TextPredictForm from "@/components/text-predict/TextPredictForm";
import FunFacts from "@/components/text-predict/FunFacts";

const TextPredictSection = () => {
  return (
    // Container utama dengan background putih dan padding
    <div className="w-full bg-[#B9E6FD] sm:bg-linear-90 sm:from-[#B9E6FD] sm:to-slate-100   py-4 sm:py-8">
      <div className="max-w-7xl mx-auto px-0 sm:px-6 lg:px-8">
        {/* Judul Utama Section */}
        <div className="text-center ">
          <h1 className="text-3xl font-extrabold tracking-tight text-teal-700 sm:text-4xl lg:text-5xl">
            Judi Guard AI
          </h1>
          <p className="max-w-2xl mx-auto mt-4 text-base text-gray-600 sm:text-lg sm:mb-12">
            Alat canggih untuk menganalisis dan memahami teks terkait perjudian.
          </p>
        </div>

        {/* Layout Grid Responsif */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-12 items-stretch">
          <FunFacts />
          <TextPredictForm />
        </div>
      </div>
    </div>
  );
};

export default TextPredictSection;
