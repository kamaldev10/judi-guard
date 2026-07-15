import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { HeroImage } from '@/assets/images';
import Tagline from '@/modules/home/components/tagline/Tagline';
import { ScanText, Sparkle } from 'lucide-react';

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
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 15,
      duration: 0.5,
    },
  },
};

const imageVariants = {
  hidden: { opacity: 0, scale: 0.9, rotateY: -10 },
  visible: {
    opacity: 1,
    scale: 1,
    rotateY: 0,
    transition: {
      type: 'spring',
      stiffness: 70,
      damping: 18,
      duration: 0.8,
      delay: 0.3,
    },
  },
};

export default function HeroSection() {
  const navigate = useNavigate();
  const handleToAnalysis = () => navigate('/dashboard/analysis');
  const handleToTextPredict = () => navigate('/#text-predict-section');

  return (
    <section
      id="hero-section"
      className="relative min-h-[100dvh] flex flex-col justify-center pt-24 pb-12 overflow-hidden scroll-mt-18"
    >
      <div className="absolute top-1/4 -right-1/4 w-[800px] h-[800px] bg-brand-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-10 sm:px-20 lg:px-25 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center w-full">
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

          <motion.div
            className="lg:col-span-5 flex justify-center lg:justify-end"
            variants={imageVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <div className="relative group w-full max-w-[450px]">
              <div className="absolute -inset-4 bg-linear-to-r from-brand-500 to-indigo-500 rounded-3xl opacity-20 group-hover:opacity-35 blur-2xl transition-opacity duration-500" />
              <motion.img
                src={HeroImage}
                alt="Judi Guard Security Portal"
                className="relative rounded-2xl shadow-2xl w-full h-auto object-cover"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              />
            </div>
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
}
