import React, { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Dialog } from "@headlessui/react";
import { X } from "lucide-react";
import { testimonialsData } from "@/constants";

export default function TestimonialsSection() {
  const sliderRef = useRef(null);
  const [maxWidth, setMaxWidth] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(null);

  // update maxWidth on resize
  useEffect(() => {
    const updateWidth = () => {
      if (sliderRef.current) {
        const scrollWidth = sliderRef.current.scrollWidth;
        const clientWidth = sliderRef.current.clientWidth;
        setMaxWidth(scrollWidth - clientWidth);
      }
    };

    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  const openModal = (testimonial) => {
    setActiveTestimonial(testimonial);
    setModalOpen(true);
  };

  const closeModal = () => {
    setActiveTestimonial(null);
    setModalOpen(false);
  };

  return (
    <section className=" w-full py-4 sm:py-8 px-2 sm:px-20 overflow-hidden bg-gradient-to-br from-cyan-50 to-blue-200 dark:from-gray-900 dark:to-slate-800">
      <h2 className="text-4xl sm:text-5xl font-extrabold text-center text-teal-700 mb-12">
        Testimoni Pengguna
      </h2>

      <div>
        <motion.div
          ref={sliderRef}
          className="flex overflow-x-auto scrollbar-hide gap-6 px-4 py-10"
          whileTap={{ cursor: "grabbing" }}
        >
          <motion.div
            drag="x"
            dragConstraints={{ left: -maxWidth, right: 0 }}
            className="flex gap-6"
          >
            {testimonialsData.map((t) => (
              <motion.div
                key={t.id}
                onClick={() => openModal(t)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex-shrink-0 w-72 sm:w-80 p-6 rounded-xl shadow-lg bg-white cursor-pointer hover:shadow-2xl transition-shadow"
              >
                <p className="text-gray-700 text-sm mb-4 line-clamp-4">
                  {t.quote}
                </p>
                <div className="flex items-center gap-3">
                  <img
                    src={t.avatarUrl}
                    alt={t.author}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-semibold text-teal-700">{t.author}</p>
                    <p className="text-gray-500 text-sm">{t.title}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Modal */}
      <Dialog
        open={modalOpen}
        onClose={closeModal}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm"
          aria-hidden="true"
        />
        {activeTestimonial && (
          <Dialog.Panel className="relative bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <p className="text-gray-800 text-base mb-4">
                {activeTestimonial.quote}
              </p>
              <div className="flex items-center gap-3">
                <img
                  src={activeTestimonial.avatarUrl}
                  alt={activeTestimonial.author}
                  className="w-14 h-14 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold text-teal-700">
                    {activeTestimonial.author}
                  </p>
                  <p className="text-gray-500 text-sm">
                    {activeTestimonial.title}
                  </p>
                </div>
              </div>
            </motion.div>

            <button
              onClick={closeModal}
              className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 transition"
            >
              <X className="w-6 h-6" />
            </button>
          </Dialog.Panel>
        )}
      </Dialog>
    </section>
  );
}
