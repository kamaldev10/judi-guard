import React from 'react';
import { motion } from 'motion/react';
import { testimonialsData } from '@/constants';
import TestimonialCard from '@/modules/home/components/testimonial/TestimonialCard';

export default function TestimonialsSection() {
  // Duplicate the array to create a seamless infinite scrolling effect
  const marqueeItems = [...testimonialsData, ...testimonialsData, ...testimonialsData];

  return (
    <section className="relative w-full py-24 sm:py-32 overflow-hidden bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-16 text-center">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-4 heading-gradient">
          Testimoni Pengguna
        </h2>
        <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
          Dengarkan dari komunitas yang telah merasakan ruang digital yang lebih aman.
        </p>
      </div>

      {/* Infinite Marquee Container */}
      <div className="relative flex w-full overflow-hidden group">
        {/* Left and Right gradient masks for a fading edge effect */}
        <div className="absolute top-0 bottom-0 left-0 w-24 sm:w-48 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        <div className="absolute top-0 bottom-0 right-0 w-24 sm:w-48 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

        <motion.div
          className="flex gap-6 sm:gap-8 px-4"
          animate={{ x: ['0%', '-50%'] }}
          transition={{
            ease: 'linear',
            duration: 30, // Adjust speed here
            repeat: Infinity,
          }}
        >
          {marqueeItems.map((t, i) => (
            <div key={`${t.id}-${i}`} className="w-[300px] sm:w-[400px] flex-shrink-0">
              <TestimonialCard testimonial={t} />
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
