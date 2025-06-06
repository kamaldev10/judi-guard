import { motion } from "framer-motion";
import AboutFeatures from "../../assets/images/about-features.png";
import { useEffect, useRef } from "react"; // 1. Impor useRef
import { useLocation } from "react-router-dom";
import { members } from ".";

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
      className=" bg-[#cdeeff] min-h-screen px-6 md:px-20 py-18 "
    >
      {/* Intro */}
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
          className="text-4xl md:text-5xl font-bold text-teal-600 mb-4"
        >
          Tentang{" "}
          <span
            className="font-bold text-teal-700"
            style={{ fontFamily: "Kanit" }}
          >
            JUDI GUARD
          </span>
        </h1>
        <p className="text-lg text-teal-500">
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
          <h2 className="text-2xl font-semibold text-[#0f766e] mb-4">
            Apa yang Kami Tawarkan
          </h2>
          <ul className="list-disc list-inside text-teal-500 space-y-2">
            <li>Deteksi komentar judi online dengan teknologi AI terbaru.</li>
            <li>Analisis mendalam dan laporan terperinci.</li>
            <li>Antarmuka pengguna yang sederhana dan intuitif.</li>
            <li>Dukungan terhadap keamanan digital nasional.</li>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10">
          {members.map((member, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05 }}
              className="bg-white/25 ring  p-6 rounded-xl shadow-md hover:shadow-lg transition "
            >
              <img
                src={member.image}
                alt={member.name}
                className="w-36 h-36 mx-auto rounded-full  mb-4 object-cover "
              />
              <h3 className="text-xl font-semibold text-black mb-1 ">
                {member.name}
              </h3>
              <p className="text-sm text-[#0f766e] mb-1 font-semibold">
                {member.cohortID}
              </p>
              <p className="text-sm text-[#0f766e] mb-1 font-semibold">
                {member.university}
              </p>
              <p className="text-sm text-[#0f766e] font-semibold">
                {member.role}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
};

export default AboutUs;
