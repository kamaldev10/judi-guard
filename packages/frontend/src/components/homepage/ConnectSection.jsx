import React from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import IlustrasiAnalisis from "../../assets/images/IlustrasiAnalisis.jpg";
import { Youtube } from "lucide-react";

// Varian animasi untuk Framer Motion
const sectionVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.3, // Munculkan children satu per satu
      duration: 0.5,
    },
  },
};

const itemVariantsLeft = {
  hidden: { opacity: 0, x: -50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: "spring", stiffness: 80, duration: 0.8 },
  },
};

const itemVariantsRight = {
  hidden: { opacity: 0, x: 50, scale: 0.9 },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 80, duration: 0.8 },
  },
};

const buttonVariants = {
  hover: {
    scale: 1.05,
    boxShadow: "0px 0px 12px rgb(20, 184, 166)", // Bayangan dengan warna teal-500
    transition: { type: "spring", stiffness: 300 },
  },
  tap: { scale: 0.95 },
};

const ConnectSection = () => {
  return (
    <section
      id="analisis-section" // ID untuk ScrollLink dari HeroSection
      className="flex py-4 min-h-dvh  items-center lg:ps-24 bg-linear-to-r bg-[#B9E6FD] via-[#caedff] to-slate-100"
    >
      <motion.div
        className="container mx-auto px-4 sm:px-6 lg:px-8 "
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible" // Animasi terpicu saat section masuk viewport
        viewport={{ once: true, amount: 0.2 }} // Picu sekali saat 20% terlihat
      >
        <div className="flex flex-col lg:flex-row items-center justify-center lg:justify-between gap-5 lg:gap-7 ">
          {/* Konten Teks (Mobile: Atas, Desktop: Kiri) */}
          <motion.div
            className="w-full lg:w-1/3 text-center lg:text-left "
            variants={itemVariantsLeft} // Menggunakan variant yang sama atau buat baru jika perlu arah berbeda
          >
            <motion.h2
              className="text-2xl sm:text-3xl md:text-4xl font-bold text-teal-700 mb-3 sm:mb-10 leading-tight text-balance"
              variants={itemVariantsLeft} // Bisa juga varian individual
            >
              Siap Mengamankan Ruang Digital Anda
            </motion.h2>
            <motion.p
              className="text-gray-600 text-sm sm:text-base md:text-lg mb-4 md:mb-8 px-6 md:px-0 leading-6 sm:leading-8 indent-8 md:indent-0 text-justify"
              variants={itemVariantsLeft}
            >
              Fitur analisis canggih kami membantu Anda mengidentifikasi dan
              memahami pola komentar spam judi secara otomatis. Dapatkan wawasan
              mendalam dan ambil tindakan cepat untuk menjaga komunitas Anda
              tetap bersih dan aman.
            </motion.p>
            <motion.div
              className="flex justify-center md:justify-center lg:justify-start "
              variants={itemVariantsLeft}
            >
              <Link to="/profile#connections-heading">
                <motion.button
                  className="flex gap-1 bg-rose-600 text-gray-300 font-semibold px-3 sm:px-4 md:px-5 py-3 sm:py-3 md:py-4 rounded-lg text-sm sm:text-base  mx-6
                             hover:bg-rose-700 shadow-md hover:shadow-lg
                             focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50
                             transition-all duration-300 ease-in-out align-middle
                             "
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  <Youtube className="" />
                  Hubungkan youtube anda sekarang
                </motion.button>
              </Link>
            </motion.div>
          </motion.div>

          {/* Gambar Ilustrasi (Mobile: Bawah, Desktop: Kanan) */}
          <motion.div
            className="flex-1 w-full sm:w-3/4 md:w-2/3 lg:w-1/2 mt-5 lg:mt-0 lg:pe-10 flex justify-center lg:justify-end"
            variants={itemVariantsRight}
          >
            <img
              src={IlustrasiAnalisis}
              alt="Ilustrasi Analisis Komentar Judi Guard"
              className="rounded-lg shadow-xl object-cover max-h-[300px] sm:max-h-[350px] md:max-h-[400px] lg:max-h-[500px] w-auto"
              style={{
                filter:
                  "drop-shadow(0 10px 8px rgba(0,0,0,0.04)) drop-shadow(0 4px 3px rgba(0,0,0,0.1))",
              }}
            />
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};

export default ConnectSection;
