import React from 'react';
import { motion } from 'motion/react';

export default function TestimonialCard({ testimonial }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 250, damping: 20 }}
      className="relative w-full h-full p-8 rounded-[2rem] shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05)] border border-border/50 cursor-pointer flex flex-col justify-between glass-surface overflow-hidden group"
    >
      {/* Subtle shimmer effect on hover */}
      <div className="absolute -inset-[1px] bg-gradient-to-br from-brand-500/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[2rem] pointer-events-none" />
      <p className="text-foreground text-xs sm:text-base mb-6 line-clamp-6">
        &ldquo;{testimonial.quote}&rdquo;
      </p>

      <div className="flex items-center gap-4 mt-auto">
        <img
          src={testimonial.avatarUrl}
          alt={testimonial.author}
          className="w-14 h-14 rounded-full object-cover border-2 border-brand-400"
        />
        <div>
          <p className="font-semibold text-brand-700 dark:text-brand-400">{testimonial.author}</p>
          <p className="text-muted-foreground text-sm">{testimonial.title}</p>
        </div>
      </div>
    </motion.div>
  );
}
