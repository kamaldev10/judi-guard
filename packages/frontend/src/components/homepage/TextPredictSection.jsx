import React from "react";
import TextPredictForm from "@/components/text-predict/TextPredictForm";

const TextPredictSection = () => {
  return (
    // Container utama dengan background putih dan padding
    <div className="w-full h-dvh bg-linear-to-b from-[#B9E6FD] via-[#caedff] to-slate-100 py-4 sm:py-8">
      <div className="max-w-7xl mx-auto px-0 sm:px-6">
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
        <div>
          <TextPredictForm />
        </div>
      </div>
    </div>
  );
};

export default TextPredictSection;
