import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { factsData } from "@/constants";
import { FactCard } from "./FactCard";

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
      className=" w-full min-h-dvh py-4 sm:py-8 px-2 sm:px-6 overflow-hidden bg-linear-to-b from-slate-100 via-[#caedff] to-[#B9E6FD] dark:from-gray-900 dark:to-slate-800"
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
        <div
          data-testid="timeline-background"
          className="absolute left-1/2 top-0 bottom-0 w-1 bg-cyan-200/50 dark:bg-gray-700 rounded-full transform -translate-x-1/2"
        />

        {/* Garis timeline dinamis yang terisi saat scroll */}
        <motion.div
          data-testid="timeline-dynamic"
          className="absolute left-1/2 top-0 w-1 bg-cyan-500 dark:bg-cyan-400 rounded-full transform -translate-x-1/2"
          style={{ height: pathHeight }}
        />

        {/* Wrapper untuk semua kartu */}
        <div className="relative z-10 flex flex-col items-center">
          {factsData.map((fact, index) => {
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
                  data-testid="timeline-marker"
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
