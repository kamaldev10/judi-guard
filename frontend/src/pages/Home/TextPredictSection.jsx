import React from "react";
import TextPredictForm from "../../components/textPredict/TextPredictForm";
import FunFacts from "../../components/textPredict/funFacts";

const TextPredictSection = () => {
  return (
    // Container utama dengan background putih dan padding
    <div className="w-full bg-slate-50  sm:py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-0 sm:px-6 lg:px-8">
        {/* Judul Utama Section */}
        <div className="sr-only sm:not-sr-only text-center ">
          <h1 className="text-3xl font-extrabold tracking-tight text-teal-700 sm:text-4xl lg:text-5xl">
            Judi Guard AI
          </h1>
          <p className="max-w-2xl mx-auto mt-4 text-base text-gray-600 sm:text-lg mb-12">
            Alat canggih untuk menganalisis dan memahami teks terkait perjudian.
          </p>
        </div>

        {/* Layout Grid Responsif */}
        {/* 1 kolom di mobile, 2 kolom di layar besar (lg) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 lg:gap-12 items-stretch">
          {/* Kolom Kiri */}
          <FunFacts />

          {/* Kolom Kanan */}
          <TextPredictForm />
        </div>
      </div>
    </div>
  );
};

export default TextPredictSection;
