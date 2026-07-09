import React from 'react';
import { motion } from 'motion/react';
import { fadeIn } from '@/lib/utils/motion';

const Tagline = ({ className = '' }) => {
  return (
    <motion.p
      variants={fadeIn}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.6 }}
      className={`text-center text-xs sm:text-sm md:text-base italic py-3 sm:py-4 md:py-5 font-semibold leading-relaxed text-brand-700 dark:text-brand-400 ${className}`}
    >
      Membantu Anda Menjaga Ruang Digital Tetap Aman
    </motion.p>
  );
};

export default Tagline;
