/* eslint-disable react/prop-types */
import { useState, useEffect, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { motion } from "framer-motion"; // Diubah dari motion/react
import { Star, MessageCircle, ArrowLeft, ArrowRight } from "lucide-react";
import { TestimonialsData } from "../../constants";

// Komponen Card Testimoni (Tidak perlu diubah, tapi bisa disederhanakan)
const TestimonialCard = ({ quote, author, title, avatarUrl, rating }) => (
  <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col h-full mx-2 border border-gray-100">
    <MessageCircle className="text-teal-500 w-8 h-8 mb-4" />
    <p className="text-gray-600 italic text-sm sm:text-base leading-relaxed mb-6 flex-grow">
      &rdquo;{quote}&quot;
    </p>
    <div className="mt-auto">
      <div className="flex items-center">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={author}
            className="w-12 h-12 rounded-full mr-4 object-cover"
          />
        ) : (
          <div className="w-12 h-12 rounded-full mr-4 bg-teal-500 flex items-center justify-center text-white font-bold text-xl">
            {author.substring(0, 1)}
          </div>
        )}
        <div>
          <p className="font-semibold text-teal-700 text-sm sm:text-base">
            {author}
          </p>
          <p className="text-gray-500 text-xs sm:text-sm">{title}</p>
        </div>
      </div>
      {rating && (
        <div className="flex mt-4">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-5 h-5 ${i < rating ? "text-yellow-400 fill-current" : "text-gray-300"}`}
            />
          ))}
        </div>
      )}
    </div>
  </div>
);

// Komponen Navigasi Slider (Tombol & Titik)
const DotButton = ({ selected, onClick }) => (
  <button
    className={`w-3 h-3 rounded-full mx-1 transition-all duration-300 ${
      selected ? "bg-teal-500 w-6" : "bg-gray-300"
    }`}
    type="button"
    onClick={onClick}
  />
);

const PrevButton = ({ enabled, onClick }) => (
  <button
    className="absolute top-1/2 left-0 sm:-left-4 transform -translate-y-1/2 bg-white/80 backdrop-blur-sm shadow-md rounded-full p-2 disabled:opacity-30 transition-opacity z-10"
    onClick={onClick}
    disabled={!enabled}
  >
    <ArrowLeft className="w-6 h-6 text-teal-600" />
  </button>
);

const NextButton = ({ enabled, onClick }) => (
  <button
    className="absolute top-1/2 right-0 sm:-right-4 transform -translate-y-1/2 bg-white/80 backdrop-blur-sm shadow-md rounded-full p-2 disabled:opacity-30 transition-opacity z-10"
    onClick={onClick}
    disabled={!enabled}
  >
    <ArrowRight className="w-6 h-6 text-teal-600" />
  </button>
);

// Komponen Utama Slider Testimoni
const TestimonialsSection = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: "start" },
    [Autoplay({ delay: 5000, stopOnInteraction: false })]
  );

  const [prevBtnEnabled, setPrevBtnEnabled] = useState(false);
  const [nextBtnEnabled, setNextBtnEnabled] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState([]);

  const scrollPrev = useCallback(
    () => emblaApi && emblaApi.scrollPrev(),
    [emblaApi]
  );
  const scrollNext = useCallback(
    () => emblaApi && emblaApi.scrollNext(),
    [emblaApi]
  );
  const scrollTo = useCallback(
    (index) => emblaApi && emblaApi.scrollTo(index),
    [emblaApi]
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setPrevBtnEnabled(emblaApi.canScrollPrev());
    setNextBtnEnabled(emblaApi.canScrollNext());
  }, [emblaApi, setSelectedIndex]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi, setScrollSnaps, onSelect]);

  return (
    <section
      id="testimonials-section"
      className="py-16 sm:py-24 bg-[#B9E6FD] sm:bg-linear-15 to-[#B9E6FD] from-slate-100 shadow-2xl shadow-[#B9E6FD]"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="text-center mb-12 sm:mb-16"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-teal-700 mb-3">
            Apa Kata Mereka?
          </h2>
          <p className="text-gray-600 text-sm sm:text-base md:text-lg max-w-2xl mx-auto">
            Dengarkan pengalaman dari pengguna yang telah merasakan manfaat Judi
            Guard.
          </p>
        </motion.div>

        <div className="relative max-w-6xl mx-auto">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex -ml-4">
              {TestimonialsData.map((testimonial) => (
                <div
                  key={testimonial.id}
                  className="flex-grow-0 flex-shrink-0 basis-full sm:basis-1/2 lg:basis-1/3 pl-4"
                >
                  <TestimonialCard {...testimonial} />
                </div>
              ))}
            </div>
          </div>
          <PrevButton onClick={scrollPrev} enabled={prevBtnEnabled} />
          <NextButton onClick={scrollNext} enabled={nextBtnEnabled} />
        </div>

        <div className="flex justify-center mt-10">
          {scrollSnaps.map((_, index) => (
            <DotButton
              key={index}
              selected={index === selectedIndex}
              onClick={() => scrollTo(index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
