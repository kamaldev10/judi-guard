import { motion } from "framer-motion";
import AboutFeatures from "../../assets/images/about-features.png";
import { useEffect, useRef } from "react"; // 1. Impor useRef
import { useLocation } from "react-router-dom";
import { members } from ".";
import { Title } from "react-head";

const AboutUs = () => {
  const location = useLocation();
  const introSectionRef = useRef(null); // 2. Buat sebuah ref

  useEffect(() => {
    if (location.pathname === "/about-us" && introSectionRef.current) {
      setTimeout(() => {
        introSectionRef.current.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [location]); // Efek ini akan berjalan setiap kali lokasi berubah

  return (
    <section
      id="about"
      className=" bg-[#cdeeff] min-h-screen px-6 md:px-20 py-4 md:py-12 "
    >
      <Title>Tentang Kami | Judi Guard</Title>
      <motion.div
        id="intro-section"
        ref={introSectionRef}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center max-w-3xl mx-auto mb-5 scroll-mt-44 "
      >
        <h1
          id="intro-header"
          className="text-2xl lg:text-4xl md:text-5xl font-bold text-black mb-4"
        >
          Tentang Judi Guard
        </h1>
        <p className="text-xs lg:text-lg text-gray-700  text-justify lg:text-center">
          Judi Guard adalah aplikasi berbasis AI yang mampu mendeteksi komentar
          yang mengandung unsur judi online secara cepat, akurat, dan efisien.
          Kami berkomitmen untuk menjaga ruang digital Anda tetap aman dari
          konten berbahaya.
        </p>
      </motion.div>
      {/* Features */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 1 }}
        viewport={{ once: true }}
        className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center mb-20"
      >
        <div>
          <h2 className="text-base lg:text-2xl font-semibold text-black mb-2 lg:mb-4 ">
            Apa yang Kami Tawarkan
          </h2>
          <ul className="list-disc list-outside text-gray-700 space-y-2 text-xs lg:text-lg ms-3 md:ms-0 text-justify">
            <li>
              Analisis Komentar Berbasis AI: Menggunakan model machine learning
              untuk mengidentifikasi pola dan kata kunci terkait judi online
              dengan akurasi tinggi.
            </li>
            <li>
              Integrasi YouTube API: Terhubung langsung dengan YouTube Data API
              v3 untuk mengambil data komentar dari video secara real-time.
            </li>
            <li>
              Otentikasi Pengguna Aman: Sistem login dan registrasi menggunakan
              OAuth untuk memastikan keamanan data pengguna.
            </li>
            <li>
              Dashboard Interaktif: Antarmuka yang ramah pengguna untuk
              memvisualisasikan hasil analisis, melacak komentar, dan mengelola
              video yang dipantau.
            </li>
            <li>
              Penanganan Error: Dirancang dengan sistem penanganan error yang
              tangguh untuk memastikan pengalaman pengguna yang mulus.
            </li>
          </ul>
        </div>
        <img
          src={AboutFeatures}
          alt="Fitur Judi Guard"
          className="rounded-2xl shadow-lg"
        />
      </motion.div>
      {/* Team */}
      <motion.div
        id="team"
        initial={{ opacity: 0.5 }}
        whileInView={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.8 }}
        viewport={{ once: true }}
        className="text-center border-t-teal-600 border-t-1  "
      >
        <h2 className="text-3xl font-bold text-[#136854] my-10">Tim Kami</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-5 md:gap-10">
          {members.map((member, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05 }}
              className="flex-row items-center-safe  bg-white/25 ring p-2 md:p-6 border border-teal-700 rounded-xl shadow-md hover:shadow-lg transition "
            >
              <img
                src={member.image}
                alt={member.name}
                className="w-20 sm:w-36 h-20 sm:h-36 mx-auto rounded-full  mb-4 object-cover "
              />
              <div className="">
                <h3 className="text-xs sm:text-xl font-semibold text-black mb-1 ">
                  {member.name}
                </h3>
                <p className="text-xs sm:text-xl text-[#0f766e] mb-1 font-semibold">
                  {member.cohortID}
                </p>
                <p className="text-xs sm:text-xl text-[#0f766e] mb-1 font-semibold">
                  {member.university}
                </p>
                <p className="text-xs sm:text-xl text-[#0f766e] font-semibold">
                  {member.role}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
};

export default AboutUs;
