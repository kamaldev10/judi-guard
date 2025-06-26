"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useRef, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Dialog } from "@headlessui/react";

interface GallerySliderProps {
  images: string[];
  type: "mobile" | "desktop";
}

export default function GallerySlider({ images, type }: GallerySliderProps) {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [maxWidth, setMaxWidth] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeImage, setActiveImage] = useState("");

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
  }, [images]);

  const scrollBy = 300;
  const scrollLeft = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: -scrollBy, behavior: "smooth" });
    }
  };
  const scrollRight = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: scrollBy, behavior: "smooth" });
    }
  };

  const openModal = (src: string) => {
    setActiveImage(src);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setActiveImage("");
  };

  if (!images || images.length === 0) return null;

  return (
    <div className="mt-6 space-y-3">
      <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
        Galeri {type === "mobile" ? "Mobile" : "Desktop"}
      </h3>

      <div className="flex items-center gap-2">
        <button
          onClick={scrollLeft}
          className="p-2 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <motion.div
          ref={sliderRef}
          className="overflow-x-auto flex-1"
          whileTap={{ cursor: "grabbing" }}
        >
          <motion.div
            drag="x"
            dragConstraints={{ left: -maxWidth, right: 0 }}
            className="flex space-x-4"
          >
            {images.map((src, i) => (
              <div
                key={i}
                onClick={() => openModal(src)}
                className={`relative flex-shrink-0 cursor-zoom-in rounded-lg overflow-hidden shadow-md ${
                  type === "mobile"
                    ? "w-40 sm:w-52 md:w-60 aspect-[9/16]"
                    : "w-60 sm:w-72 md:w-96 aspect-[16/9]"
                }`}
              >
                <Image
                  src={src}
                  alt={`Gambar ${i + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </motion.div>
        </motion.div>

        <button
          onClick={scrollRight}
          className="p-2 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Modal View */}
      <Dialog open={modalOpen} onClose={closeModal} className="fixed inset-0 z-50">
        <div className="fixed inset-0 bg-black/70" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <div className="relative max-w-4xl w-full aspect-[16/9] sm:aspect-[9/16]">
            <Image
              src={activeImage}
              alt="Zoomed"
              fill
              className="object-contain rounded-lg"
              onClick={closeModal}
            />
            <button
              onClick={closeModal}
              className="absolute top-2 right-2 z-10 p-1 bg-white dark:bg-gray-800 rounded-full shadow"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
