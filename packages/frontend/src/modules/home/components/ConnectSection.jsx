import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Youtube } from 'lucide-react';
import { IlustrasiAnalisis } from '@/assets/images';
import { viewportOnce } from '@/shared/utils/motion';

export default function ConnectSection() {
  return (
    <section
      id="analisis-section"
      className="w-full py-24 sm:py-32 flex items-center justify-center"
    >
      <div className="max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewportOnce}
          transition={{ type: 'spring', stiffness: 60, damping: 20 }}
          className="relative w-full rounded-[2.5rem] glass-surface border border-border/50 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] overflow-hidden"
        >
          <div className="absolute inset-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] rounded-[2.5rem] pointer-events-none z-20" />

          <div className="grid grid-cols-1 lg:grid-cols-2 h-full">
            <div className="p-8 sm:p-12 md:p-16 flex flex-col justify-center relative z-10">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={viewportOnce}
                transition={{ delay: 0.2, type: 'spring', stiffness: 80, damping: 20 }}
              >
                <div className="inline-flex items-center px-3 py-1 mb-6 rounded-full bg-accent text-accent-foreground text-xs font-semibold tracking-wide uppercase">
                  Integrasi Otomatis
                </div>

                <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-6 leading-tight tracking-tight text-balance heading-gradient">
                  Siap Mengamankan Ruang Digital Anda
                </h2>

                <p className="text-muted-foreground text-base md:text-lg mb-10 leading-relaxed text-balance">
                  Fitur analisis canggih kami membantu Anda mengidentifikasi dan memahami pola
                  komentar spam judi secara otomatis. Dapatkan wawasan mendalam dan ambil tindakan
                  cepat untuk menjaga komunitas Anda tetap bersih.
                </p>

                <div>
                  <Link to="/dashboard/profile" className="inline-block">
                    <motion.button
                      className="group relative flex items-center gap-3 px-6 py-4 bg-foreground text-background rounded-2xl font-semibold overflow-hidden shadow-lg shadow-foreground/10 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.96 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    >
                      <div className="absolute inset-0 bg-brand-500 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300 ease-out" />

                      <Youtube className="w-5 h-5 relative z-10 transition-colors duration-300 group-hover:text-white" />
                      <span className="relative z-10 transition-colors duration-300 group-hover:text-white">
                        Hubungkan YouTube
                      </span>
                    </motion.button>
                  </Link>
                </div>
              </motion.div>
            </div>

            <div className="relative flex items-center justify-center p-8 lg:p-0 min-h-[300px] lg:min-h-[500px] bg-muted/20 dark:bg-muted/10">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-brand-500/10 rounded-full blur-3xl" />

              <motion.div
                className="relative z-10 w-full max-w-[400px] lg:max-w-none lg:w-[120%] lg:-mr-[10%] drop-shadow-2xl"
                initial={{ opacity: 0, scale: 0.9, x: 30 }}
                whileInView={{ opacity: 1, scale: 1, x: 0 }}
                viewport={viewportOnce}
                transition={{ delay: 0.3, type: 'spring', stiffness: 60, damping: 15 }}
              >
                <img
                  src={IlustrasiAnalisis}
                  alt="Ilustrasi Analisis Komentar Judi Guard"
                  className="rounded-xl object-cover w-full h-auto transform lg:translate-x-4 lg:-translate-y-4 shadow-2xl border border-border/40"
                />
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
