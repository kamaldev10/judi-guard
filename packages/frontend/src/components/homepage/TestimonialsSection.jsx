import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { testimonialsData } from "@/constants";
import TestimonialCard from "../testimonial/TestimonialCard";

export default function TestimonialsSection() {
  const [index, setIndex] = useState(0);

  // tampilkan 2 card aktif
  const visibleTestimonials = testimonialsData.slice(index, index + 2);

  const nextTestimonials = () => {
    setIndex((prev) => (prev + 2 >= testimonialsData.length ? 0 : prev + 2));
  };

  return (
    <section
      className="relative flex flex-col items-center justify-center w-full min-h-[90dvh] overflow-hidden 
      bg-linear-to-br to-[#B9E6FD] via-[#caedff] from-slate-100 dark:from-gray-900 dark:to-slate-800 
      transition-colors duration-500 px-4 sm:px-10"
    >
      <h2
        className="text-4xl sm:text-5xl font-extrabold text-center  
        text-teal-700 dark:text-sky-300 mb-2"
      >
        Testimoni Pengguna
      </h2>
      <p className="text-gray-600 text-xs sm:text-sm md:text-lg max-w-full mx-auto mb-6">
        Aplikasi kami telah membantu banyak pengguna dalam mengelola akun
        YouTube
      </p>

      <div className="relative flex gap-4 justify-center items-center w-full h-[65dvh]">
        <AnimatePresence mode="popLayout">
          {visibleTestimonials.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, scale: 0.9, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -50 }}
              transition={{ duration: 0.6 }}
              className="flex-1 flex justify-center items-center"
            >
              <TestimonialCard testimonial={t} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Tombol Next */}
      <button
        onClick={nextTestimonials}
        className="absolute bottom-8 right-8 bg-sky-600 hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-400 
        text-white rounded-full p-4 shadow-lg hover:scale-105 transition-all"
        aria-label="Tampilkan testimonial berikutnya"
      >
        <ChevronRight className="w-6 h-6" />
      </button>
    </section>
  );
}
