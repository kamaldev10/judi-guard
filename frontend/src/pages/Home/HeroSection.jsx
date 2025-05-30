import heroImage from "../../assets/images/HeroImage.png";
import Tagline from "../../components/tagline/Tagline";
import { motion } from "motion/react";

const HeroSection = () => {
  return (
    <>
      <section
        id="hero-section"
        className="bg-linear-to-r from-white to-[#E1F2FF] min-h-screen px-6 md:px-16 py-20 md:py-32 flex flex-col"
      >
        <div className="flex flex-col-reverse lg:flex-row items-center justify-between gap-10 mb-10 md:mb-20">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center lg:text-left max-w-xl"
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#136854] leading-tight mb-6">
              Pendeteksi Komentar Judi Online
            </h1>
            <p className="text-base sm:text-lg text-green-700 italic mb-4">
              Dengan Cepat Dan Akurat
            </p>
            <button className="bg-teal-600 text-white px-6 py-2 rounded hover:bg-teal-700 transition">
              Deteksi Sekarang
            </button>
          </motion.div>

          {/* Hero Image */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="flex justify-center lg:justify-end"
          >
            <img
              src={heroImage}
              alt="Hero Illustration"
              className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg"
            />
          </motion.div>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Tagline />
        </motion.div>
      </section>
    </>
  );
};

export default HeroSection;
