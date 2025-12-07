import React from "react";
import { motion } from "framer-motion";

export default function TestimonialCard({ testimonial }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.97 }}
      className="relative w-[90%] sm:w-[70%] max-w-md h-[85%] sm:h-[90%] p-8 
      rounded-2xl shadow-2xl cursor-pointer flex flex-col justify-between 
      bg-white/70 dark:bg-gray-800/70 backdrop-blur-md border border-slate-200 dark:border-gray-700
      transition-all duration-300"
    >
      <p className="text-gray-800 dark:text-gray-100 text-xs sm:text-base mb-6 line-clamp-6">
        “{testimonial.quote}”
      </p>

      <div className="flex items-center gap-4 mt-auto">
        <img
          src={testimonial.avatarUrl}
          alt={testimonial.author}
          className="w-14 h-14 rounded-full object-cover border-2 border-sky-400"
        />
        <div>
          <p className="font-semibold text-sky-700 dark:text-sky-300">
            {testimonial.author}
          </p>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            {testimonial.title}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
