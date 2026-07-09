import React from 'react';
import { motion } from 'motion/react';
import TextPredictForm from '@/components/text-predict/TextPredictForm';
import { fadeUp, viewportOnce } from '@/lib/utils/motion';

const TextPredictSection = () => {
  return (
    <section id="text-predict-section" className="w-full py-24 sm:py-32 relative">
      {/* Decorative background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] bg-brand-500/5 rounded-full blur-[100px] pointer-events-none -z-10" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <motion.div
          className="text-center mb-16"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
        >
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl heading-gradient">
            Judi Guard AI
          </h2>
          <p className="max-w-2xl mx-auto mt-4 text-base text-muted-foreground sm:text-lg">
            Alat canggih untuk menganalisis dan memahami teks terkait perjudian secara real-time.
          </p>
        </motion.div>

        {/* Focus Mode Glass Container */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={viewportOnce}
          transition={{ type: 'spring', stiffness: 80, damping: 20, delay: 0.2 }}
          className="relative group"
        >
          {/* Shimmer effect border (perpetual micro-interaction) */}
          <div className="absolute -inset-[1px] rounded-[2.5rem] bg-gradient-to-r from-transparent via-brand-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 -z-10 blur-sm group-hover:animate-pulse" />

          <div className="glass-surface border border-border/50 rounded-[2.5rem] p-6 sm:p-10 md:p-12 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] relative overflow-hidden z-10">
            {/* Subtle inner reflection */}
            <div className="absolute inset-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] rounded-[2.5rem] pointer-events-none" />

            <TextPredictForm />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default TextPredictSection;
