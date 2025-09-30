"use client";

import React, { useRef } from "react";
import PropTypes from "prop-types";
import { motion, useScroll, useTransform } from "framer-motion";
import { FunFact1, FunFact2, FunFact3, FunFact4 } from "@/assets/images";

const facts = [
  {
    icon: "📜",
    title: "Sejarah Kuno",
    text: "Bukti perjudian pertama kali ditemukan di Tiongkok Kuno sekitar 2300 SM, menggunakan ubin untuk permainan untung-untungan.",
    image: FunFact1,
  },
  {
    icon: "🌐",
    title: "Ledakan Online",
    text: "Kasino online pertama diluncurkan pada pertengahan 1990-an. Kini, industri ini bernilai ratusan miliar dolar secara global.",
    image: FunFact2,
  },
  {
    icon: "🧠",
    title: 'Psikologi "Nyaris Menang"',
    text: 'Otak manusia melepaskan dopamin bahkan saat "nyaris menang", yang membuat perjudian menjadi sangat adiktif.',
    image: FunFact3,
  },
  {
    icon: "🎰",
    title: "Mesin Slot Pertama",
    text: 'Mesin slot pertama, "Liberty Bell", diciptakan pada 1895 dan hadiah terbesarnya saat itu hanya 50 sen.',
    image: FunFact4,
  },
];

// Varian animasi untuk item di dalam kartu
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, staggerChildren: 0.1 },
  },
};
// Komponen Card terpisah (tanpa perubahan signifikan)
const FactCard = ({ fact }) => {
  return (
    <motion.div
      className="relative group bg-white/30 dark:bg-gray-900/40 backdrop-blur-lg p-5 rounded-2xl shadow-lg border border-white/20 transition-all duration-300 hover:shadow-cyan-500/50 hover:scale-[1.03]"
      variants={itemVariants}
    >
      <motion.div
        variants={itemVariants}
        className="w-full h-40 mb-4 overflow-hidden rounded-lg"
      >
        <img
          src={fact.image}
          alt={fact.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
      </motion.div>
      <motion.span variants={itemVariants} className="text-3xl">
        {fact.icon}
      </motion.span>
      <motion.h3
        variants={itemVariants}
        className="text-xl font-bold text-cyan-800 dark:text-cyan-300 mt-2"
      >
        {fact.title}
      </motion.h3>
      <motion.p
        variants={itemVariants}
        className="text-sm text-gray-700 dark:text-gray-300 mt-2"
      >
        {fact.text}
      </motion.p>
    </motion.div>
  );
};

FactCard.propTypes = {
  fact: PropTypes.shape({
    icon: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    text: PropTypes.string.isRequired,
    image: PropTypes.string.isRequired,
  }).isRequired,
};

// Komponen Utama
const FunFactsSection = () => {
  const targetRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start end", "end start"],
  });
  const pathHeight = useTransform(scrollYProgress, [0.05, 0.9], ["0%", "100%"]);

  return (
    <section
      ref={targetRef}
      className="relative w-full py-20 px-2 sm:px-6 overflow-hidden bg-gradient-to-br from-cyan-50 to-blue-200 dark:from-gray-900 dark:to-slate-800"
    >
      <div className="text-center mb-16 px-2">
        <motion.h2
          className="text-4xl sm:text-5xl font-extrabold text-cyan-900 dark:text-white"
          initial={{ opacity: 0, y: -50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          Fakta di Balik Layar
        </motion.h2>
        <motion.p
          className="mt-4 text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Mengungkap sisi lain dari dunia perjudian yang jarang diketahui.
        </motion.p>
      </div>

      <div className="relative max-w-5xl mx-auto">
        {/* Garis timeline statis (background) */}
        <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-cyan-200/50 dark:bg-gray-700 rounded-full transform -translate-x-1/2" />

        {/* Garis timeline dinamis yang terisi saat scroll */}
        <motion.div
          className="absolute left-1/2 top-0 w-1 bg-cyan-500 dark:bg-cyan-400 rounded-full transform -translate-x-1/2"
          style={{ height: pathHeight }}
        />

        {/* Wrapper untuk semua kartu */}
        <div className="relative z-10 flex flex-col items-center">
          {facts.map((fact, index) => {
            const isLeft = index % 2 === 0;
            return (
              <motion.div
                key={index}
                className="relative w-full flex items-center my-4"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
              >
                {/* Penanda di timeline */}
                <motion.div
                  className="absolute left-1/2 w-5 h-5 bg-white dark:bg-gray-800 rounded-full border-4 border-cyan-500 dark:border-cyan-400 transform -translate-x-1/2 z-10"
                  variants={{
                    hidden: { scale: 0 },
                    visible: { scale: 1 },
                  }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                />

                {/* Kontainer Kartu (Logic Responsif ada di sini) */}
                <div
                  className={`w-1/2 ${
                    isLeft ? "pr-4 sm:pr-8" : "pl-4 sm:pl-8 ml-auto"
                  }`}
                >
                  <FactCard fact={fact} />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FunFactsSection;
