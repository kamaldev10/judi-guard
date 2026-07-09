import React from 'react';
import { motion } from 'motion/react';
import { Link as ScrollLink } from 'react-scroll';
import { useNavigate } from 'react-router-dom';
import { HeroImage } from '@/assets/images';
import Tagline from '../tagline/Tagline';
import { ScanText, Sparkle } from 'lucide-react';

// Motion variants for staggered waterfall reveals
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, filter: 'blur(10px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { type: 'spring', stiffness: 100, damping: 20 },
  },
};

// Continuous breathing animation for the hero image
const breathingVariants = {
  animate: {
    y: [0, -15, 0],
    rotate: [0, 1, -1, 0],
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

const HeroSection = () => {
  const navigate = useNavigate();
  const handleToAnalysis = () => navigate('/analysis');
  const handleToTextPredict = () => navigate('/#text-predict-section');

  return (
    <section
      id="hero-section"
      className="relative min-h-[100dvh] flex flex-col justify-center pt-24 pb-12 overflow-hidden scroll-mt-18"
    >
      {/* Abstract Background Element for extra depth */}
      <div className="absolute top-1/4 -right-1/4 w-[800px] h-[800px] bg-brand-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-10 sm:px-20 lg:px-25 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center w-full">
          {/* Text Content - Asymmetric left alignment */}
          <motion.div
            className="lg:col-span-7 flex flex-col items-start text-left max-w-3xl"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            <motion.h1
              variants={itemVariants}
              className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tighter leading-[1.1] mb-6"
            >
              Lindungi Ruang Digital dari{' '}
              <span className="heading-gradient text-transparent bg-clip-text">Judi Online</span>
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-base md:text-xl text-muted-foreground leading-relaxed max-w-[55ch] mb-10"
            >
              Sistem deteksi otomatis yang menganalisis, memfilter, dan membersihkan komunitas Anda
              dari komentar spam berbahaya dengan akurasi tinggi.
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-row items-center gap-4">
              <button
                onClick={handleToTextPredict}
                className="flex items-center px-6 py-3 text-sm font-semibold rounded-md border border-transparent bg-brand-600 text-white hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-700 transition-colors cursor-pointer"
              >
                <ScanText className="mr-2" size={16} /> Coba Deteksi Teks
              </button>
              <button
                onClick={handleToAnalysis}
                className="flex items-center px-6 py-3 text-sm font-semibold rounded-md border border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer"
              >
                <Sparkle className="mr-2" size={16} /> Analisis YouTube
              </button>
            </motion.div>
          </motion.div>

          {/* Image Content - Right aligned, dynamic physics */}
          <motion.div
            className="lg:col-span-5 flex justify-center lg:justify-end w-full relative"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ type: 'spring', stiffness: 50, damping: 20, delay: 0.3 }}
          >
            <motion.div variants={breathingVariants} animate="animate" className="relative z-10">
              <img
                src={HeroImage}
                alt="Ilustrasi Deteksi Komentar Judi"
                className="w-full max-w-[500px] object-contain drop-shadow-2xl"
              />
            </motion.div>

            {/* Decorative background element behind image */}
            <div className="absolute inset-0 bg-gradient-to-tr from-brand-500/5 to-transparent rounded-[3rem] -z-10 transform rotate-6 scale-105 backdrop-blur-3xl" />
          </motion.div>
        </div>

        <motion.div
          className="mt-16 lg:mt-28 w-full"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.5 }}
        >
          <Tagline />
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
