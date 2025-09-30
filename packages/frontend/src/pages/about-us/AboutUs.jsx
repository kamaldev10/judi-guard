import { motion, useScroll, useTransform } from "framer-motion";
import AboutFeatures from "../../assets/images/about-features.png";
import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { members } from ".";
import { Title } from "react-head";

const AboutUs = () => {
  const location = useLocation();
  const introSectionRef = useRef(null);
  const containerRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.3], [1, 0.95]);

  useEffect(() => {
    if (location.pathname === "/about-us" && introSectionRef.current) {
      setTimeout(() => {
        introSectionRef.current.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [location]);

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
        duration: 0.6,
        ease: [0.25, 0.4, 0.25, 1],
      },
    },
  };

  const featureItemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        ease: "easeOut",
      },
    }),
  };

  return (
    <section
      ref={containerRef}
      id="about"
      className="relative bg-gradient-to-b from-[#cdeeff] via-[#e0f2fe] to-white min-h-screen px-4 sm:px-6 md:px-12 lg:px-20 py-8 md:py-16 overflow-hidden"
    >
      <Title>Tentang Kami | Judi Guard</Title>

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute -top-40 -right-40 w-96 h-96 bg-teal-200/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, -90, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl"
        />
      </div>

      {/* Hero Section */}
      <motion.div
        id="intro-section"
        ref={introSectionRef}
        style={{ opacity, scale }}
        className="relative z-10 text-center max-w-4xl mx-auto mb-16 md:mb-24 scroll-mt-44"
      >
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.h1
            id="intro-header"
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 bg-clip-text text-transparent mb-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            JUDI GUARD
          </motion.h1>

          <motion.div
            className="h-1 w-24 bg-gradient-to-r from-teal-500 to-cyan-500 mx-auto mb-6 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: 96 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          />

          <motion.p
            className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-700 leading-relaxed max-w-3xl mx-auto px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            Judi Guard adalah aplikasi berbasis AI yang mampu mendeteksi
            komentar yang mengandung unsur judi online secara cepat, akurat, dan
            efisien. Kami berkomitmen untuk menjaga ruang digital Anda tetap
            aman dari konten berbahaya.
          </motion.p>
        </motion.div>
      </motion.div>

      {/* Features Section */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={containerVariants}
        className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-center mb-20 md:mb-32"
      >
        <motion.div variants={itemVariants} className="order-2 lg:order-1">
          <motion.h2
            className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-6 md:mb-8"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Apa yang Kami Tawarkan
          </motion.h2>

          <ul className="space-y-4 md:space-y-5">
            {[
              "Analisis Komentar Berbasis AI: Menggunakan model machine learning untuk mengidentifikasi pola dan kata kunci terkait judi online dengan akurasi tinggi.",
              "Integrasi YouTube API: Terhubung langsung dengan YouTube Data API v3 untuk mengambil data komentar dari video secara real-time.",
              "Otentikasi Pengguna Aman: Sistem login dan registrasi menggunakan OAuth untuk memastikan keamanan data pengguna.",
              "Dashboard Interaktif: Antarmuka yang ramah pengguna untuk memvisualisasikan hasil analisis, melacak komentar, dan mengelola video yang dipantau.",
              "Penanganan Error: Dirancang dengan sistem penanganan error yang tangguh untuk memastikan pengalaman pengguna yang mulus.",
            ].map((feature, i) => (
              <motion.li
                key={i}
                custom={i}
                variants={featureItemVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="flex items-start group"
              >
                <motion.div
                  whileHover={{ scale: 1.2, rotate: 90 }}
                  className="flex-shrink-0 w-2 h-2 mt-2 mr-3 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-full"
                />
                <span className="text-sm sm:text-base md:text-lg text-gray-700 leading-relaxed group-hover:text-gray-900 transition-colors">
                  {feature}
                </span>
              </motion.li>
            ))}
          </ul>
        </motion.div>

        <motion.div variants={itemVariants} className="order-1 lg:order-2">
          <motion.div
            whileHover={{ scale: 1.02, rotateY: 5 }}
            transition={{ duration: 0.3 }}
            className="relative group"
          >
            <div className="absolute -inset-4 bg-gradient-to-r from-teal-400 to-cyan-400 rounded-3xl opacity-20 group-hover:opacity-30 blur-xl transition-opacity" />
            <img
              src={AboutFeatures}
              alt="Fitur Judi Guard"
              className="relative rounded-2xl shadow-2xl w-full h-auto"
            />
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Team Section */}
      <motion.div
        id="team"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={containerVariants}
        className="relative z-10 text-center"
      >
        <motion.div variants={itemVariants} className="mb-12 md:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent mb-4">
            Tim Kami
          </h2>
          <motion.div
            className="h-1 w-20 bg-gradient-to-r from-teal-500 to-cyan-500 mx-auto rounded-full"
            initial={{ width: 0 }}
            whileInView={{ width: 80 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          />
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-10">
          {members.map((member, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{
                y: -10,
                transition: { duration: 0.3 },
              }}
              className="group relative"
            >
              <div className="absolute -inset-2 bg-gradient-to-r from-teal-400 to-cyan-400 rounded-2xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300" />

              <div className="relative bg-white/80 backdrop-blur-sm p-6 md:p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.3 }}
                  className="relative mb-4"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-teal-400 to-cyan-400 rounded-full blur-md opacity-0 group-hover:opacity-50 transition-opacity" />
                  <img
                    src={member.image}
                    alt={member.name}
                    className="relative w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 mx-auto rounded-full object-cover ring-4 ring-white shadow-lg"
                  />
                </motion.div>

                <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-2">
                  {member.name}
                </h3>
                <p className="text-xs sm:text-sm md:text-base text-teal-600 font-semibold mb-1">
                  {member.cohortID}
                </p>
                <p className="text-xs sm:text-sm md:text-base text-gray-600 mb-1">
                  {member.university}
                </p>
                <motion.p
                  className="text-xs sm:text-sm md:text-base font-medium bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  {member.role}
                </motion.p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
};

export default AboutUs;
