import React from "react";
import { motion } from "framer-motion";

const facts = [
  {
    icon: "📜",
    title: "Sejarah Kuno",
    text: "Bukti perjudian pertama kali ditemukan di Tiongkok Kuno sekitar 2300 SM, menggunakan ubin untuk permainan untung-untungan.",
  },
  {
    icon: "🌐",
    title: "Ledakan Online",
    text: "Kasino online pertama diluncurkan pada pertengahan 1990-an. Kini, industri ini bernilai ratusan miliar dolar secara global.",
  },
  {
    icon: "🧠",
    title: 'Psikologi "Nyaris Menang"',
    text: 'Otak manusia melepaskan dopamin (hormon kebahagiaan) bahkan saat "nyaris menang", yang membuat perjudian sangat adiktif.',
  },
  {
    icon: "🎰",
    title: "Mesin Slot",
    text: 'Mesin slot pertama, "Liberty Bell", diciptakan pada tahun 1895 dan hadiah terbesarnya hanya 50 sen.',
  },
];

const FunFacts = () => {
  return (
    <motion.div
      className="w-full  p-8 bg-[#B9E6FD] sm:bg-teal-50 rounded-none sm:rounded-2xl border-0 sm:border-1 border-teal-200"
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.7, delay: 0.2 }}
    >
      <h2 className="text-xl sm:text-2xl font-bold text-teal-800 mb-6 text-center ">
        Fakta Menarik Tentang Perjudian
      </h2>
      <ul className="space-y-5">
        {facts.map((fact, index) => (
          <li key={index} className="flex items-start">
            <span className="text-2xl mr-4 mt-1 text-teal-700">
              {fact.icon}
            </span>
            <div>
              <h3 className="font-semibold text-teal-700">{fact.title}</h3>
              <p className="text-gray-600 text-sm">{fact.text}</p>
            </div>
          </li>
        ))}
      </ul>
    </motion.div>
  );
};

export default FunFacts;
