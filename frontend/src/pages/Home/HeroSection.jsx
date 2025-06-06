import React from "react";
import heroImage from "../../assets/images/HeroImage.png";
import Tagline from "../../components/tagline/Tagline";
import { motion } from "motion/react";
import { Link as ScrollLink } from "react-scroll";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

const imageVariants = {
  hidden: { opacity: 0, x: 50, scale: 0.8 },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      duration: 0.8,
      ease: [0.6, 0.05, -0.01, 0.9],
      type: "spring",
      stiffness: 50,
    },
  },
};

const HeroSection = () => {
  return (
    <motion.section
      id="hero-section"
      className="bg-gradient-to-r from-white via-blue-50 to-[#E1F2FF] min-h-screen flex flex-col justify-center items-center px-4 pt-24 pb-12 sm:px-6 lg:px-8 overflow-hidden  border-b-4 border-b-teal-800" // pt lebih besar untuk memberi ruang Header
    >
      <div className="container mx-auto">
        <div className="flex flex-col-reverse lg:flex-row items-center justify-between gap-8 lg:gap-16 w-full">
          <motion.div
            className="text-center lg:text-left max-w-md lg:max-w-md xl:max-w-md flex-1 md:ms-10" // max-w dan flex-1
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            <motion.h1
              variants={itemVariants}
              className="text-3xl font-bold text-teal-700 leading-tight mb-4 
                         sm:text-4xl 
                         md:text-5xl 
                         lg:text-7xl lg:leading-tight"
            >
              Pendeteksi Komentar Judi Online
            </motion.h1>
            <motion.p
              variants={itemVariants}
              className="text-base text-gray-600 italic mb-8 
                         sm:text-lg 
                         md:text-xl"
            >
              Dengan Cepat Dan Akurat Melindungi Ruang Digital Anda.
            </motion.p>
            <motion.div variants={itemVariants}>
              <ScrollLink
                to="analisis-section"
                spy={true}
                smooth={true}
                offset={-70}
                duration={500}
                className="inline-block bg-teal-600 text-white px-8 py-3 rounded-lg text-sm sm:text-base font-semibold hover:bg-teal-700 transition-colors shadow-md hover:shadow-lg cursor-pointer"
              >
                Deteksi Sekarang
              </ScrollLink>
            </motion.div>
          </motion.div>

          <motion.div
            className="flex justify-center lg:justify-end flex-1 w-full lg:w-auto" // flex-1 dan w-full untuk mobile
            variants={imageVariants}
            initial="hidden"
            animate="visible"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            <img
              src={heroImage}
              alt="Ilustrasi Deteksi Komentar Judi"
              className="w-3/4 max-w-[280px] 
                         sm:w-3/5 sm:max-w-sm 
                         md:w-1/2 md:max-w-md 
                         lg:w-full lg:max-w-lg xl:max-w-xl object-contain" // object-contain
            />
          </motion.div>
        </div>

        <motion.div
          className="mt-16 lg:mt-24 w-full"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
        >
          <Tagline />
        </motion.div>
      </div>
    </motion.section>
  );
};

export default HeroSection;
