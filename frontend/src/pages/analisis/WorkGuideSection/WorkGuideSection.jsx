import React from "react";
import { motion } from "framer-motion";
import {
  BrainCircuit,
  ClipboardList,
  ChevronRight,
  ArrowDown,
  Link,
} from "lucide-react";
import { LinkToYoutubeIcon, ProcessAnalysisIcon } from "../../../assets/images";

const WorkGuideSection = () => {
  const steps = [
    {
      icon: (
        <img src={LinkToYoutubeIcon} className="text-teal-600 w-6 sm:w-8" />
      ), // Ukuran ikon diperkecil
      title: "input Link Video",
      description:
        "Masukkan link video yang ingin Anda analisis pada kolom yang tersedia.",
    },
    {
      icon: (
        <img
          src={ProcessAnalysisIcon}
          size={36}
          className="text-teal-600 w-6 sm:w-8"
        />
      ),
      title: "Proses Analisis",
      description:
        "Sistem akan secara otomatis memproses dan menganalisis semua komentar dari video anda.",
    },
    {
      icon: <ClipboardList className="text-gray-800 w-6 sm:w-8" />,
      title: "Lihat Hasilnya",
      description:
        "Hasil analisis video berupa JUDI atau NON-JUDI akan ditampilkan dengan jelas.",
    },
  ];

  const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "circOut" },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: (custom) => ({
      // Menerima custom delay
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.45, ease: "easeOut", delay: custom * 0.15 },
    }),
  };

  const arrowVariants = {
    hidden: { opacity: 0, scale: 0.5 },
    visible: (custom) => ({
      // Menerima custom delay
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.35,
        ease: "easeOut",
        delay: custom * 0.15 + 0.1,
      }, // Sedikit delay setelah kartu
    }),
  };

  return (
    <motion.section
      id="work-guide"
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
      className="scroll-mt-44 min-h-3/4 rounded-2xl flex flex-col justify-center items-center bg-transparent border-double border-4 shadow-lg border-teal-800 px-4 py-6 md:py-16  mb-16 md:mb-20 lg:mb-25"
    >
      <div className="w-full max-w-4/5 mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="text-center text-2xl sm:text-3xl lg:text-4xl font-bold text-teal-700 mb-6 md:mb-12 lg:mb-16 tracking-tight" // Font dan margin disesuaikan
        >
          Bagaimana Cara Kerjanya?
        </motion.h2>
        <div className="flex flex-col md:flex-row justify-center items-stretch gap-2 md:gap-4 lg:gap-10">
          {steps.map((step, index) => (
            <React.Fragment key={index}>
              <motion.div
                custom={index}
                variants={cardVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                className="flex flex-col items-center text-center md:flex-1 bg-white p-5 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 ease-in-out transform hover:-translate-y-1 group" // Padding dan shadow disesuaikan
              >
                <div className="mb-4 p-3 bg-teal-100 rounded-full inline-block transition-colors duration-300 group-hover:bg-teal-200">
                  {step.icon}
                </div>
                <h3 className="text-sm sm:text-lg font-semibold text-teal-700 mb-1.5">
                  <span className="font-semibold">{index + 1}.</span>{" "}
                  {step.title}
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 leading-relaxed px-1">
                  {step.description}
                </p>
              </motion.div>

              {index < steps.length - 1 && (
                <>
                  {/* Panah untuk Desktop */}
                  <motion.div
                    custom={index}
                    variants={arrowVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.5 }}
                    className="hidden md:flex items-center justify-center text-teal-500 self-center mx-1 lg:mx-2" // Margin panah
                  >
                    <ChevronRight size={32} strokeWidth={2.2} />{" "}
                  </motion.div>
                  <motion.div
                    custom={index}
                    variants={arrowVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.5 }}
                    className="md:hidden flex items-center justify-center text-teal-400 self-center my-1" // Margin panah mobile
                  >
                    <ArrowDown size={28} strokeWidth={1.8} />
                  </motion.div>
                </>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </motion.section>
  );
};

export default WorkGuideSection;
