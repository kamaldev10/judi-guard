import { motion } from "framer-motion";
import AboutFeatures from "../../assets/images/about-features.png";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { members } from ".";

const AboutUs = () => {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const target = document.querySelector(location.hash);
      if (target) {
        target.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [location]);

  return (
    <section
      id="about"
      className="scroll-mt-20 bg-[#f0faff] min-h-screen px-6 md:px-20 pt-20"
    >
      {/* Intro */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center max-w-3xl mx-auto mb-5"
      >
        <h1 className="text-4xl md:text-5xl font-bold text-[#136854] mb-4">
          Tentang Judi Guard
        </h1>
        <p className="text-lg text-gray-700">
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
          <ul className="list-disc list-inside text-gray-700 space-y-2">
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
        className="text-center mb-5"
      >
        <h2 className="text-3xl font-bold text-[#136854] mb-10">Tim Kami</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10">
          {members.map((member, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05 }}
              className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition"
            >
              <img
                src={member.image}
                alt={member.name}
                className="w-36 h-36 mx-auto rounded-full mb-4 object-cover border"
              />
              <h3 className="text-xl font-semibold text-[#0f766e]">
                {member.name}
              </h3>
              <p className="text-sm text-gray-500 mb-1">{member.university}</p>
              <p className="text-sm text-gray-600">{member.role}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
};

export default AboutUs;
