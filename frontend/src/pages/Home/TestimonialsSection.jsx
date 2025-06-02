/* eslint-disable react/prop-types */
import React from "react";
import { motion } from "motion/react";
import { Star, MessageCircle } from "lucide-react"; // Contoh ikon

// Data testimoni dummy (ganti dengan data asli Anda)
const testimonialsData = [
  {
    id: 1,
    quote:
      "Judi Guard sangat membantu membersihkan kolom komentar channel YouTube saya dari spam judi yang mengganggu. Akurasinya luar biasa!",
    author: "Budi Gaming",
    title: "YouTuber Gaming",
    avatarUrl: "https://i.pravatar.cc/100?u=budi", // Ganti dengan URL avatar asli atau null
    rating: 5,
  },
  {
    id: 2,
    quote:
      "Sebagai pengelola komunitas online, fitur deteksi cepat Judi Guard menghemat banyak waktu moderasi manual. Highly recommended!",
    author: "Citra Lestari",
    title: "Admin Komunitas Online",
    avatarUrl: "https://i.pravatar.cc/100?u=citra",
    rating: 5,
  },
  {
    id: 3,
    quote:
      "Awalnya ragu, tapi setelah mencoba, Judi Guard terbukti efektif. Fitur hapusnya juga sangat praktis. Terima kasih Judi Guard!",
    author: "Anton W.",
    title: "Content Creator",
    avatarUrl: "https://i.pravatar.cc/100?u=anton", // Contoh tanpa avatar, kita bisa handle
    rating: 4,
  },
];

// Varian animasi untuk container dan item
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.3,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
      duration: 0.6,
    },
  },
};

const TestimonialCard = ({ quote, author, title, avatarUrl, rating }) => {
  return (
    <motion.div
      className="bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 flex flex-col h-full" // h-full untuk tinggi sama jika dalam grid
      variants={itemVariants}
      whileHover={{ y: -5, transition: { type: "spring", stiffness: 300 } }}
    >
      <MessageCircle className="text-teal-500 w-8 h-8 mb-4" />{" "}
      {/* Ikon kutipan */}
      <p className="text-gray-600 italic text-sm sm:text-base leading-relaxed mb-6 flex-grow">
        &rdquo;{quote}&quot;
      </p>
      <div className="mt-auto">
        {" "}
        {/* Dorong bagian author ke bawah jika card punya tinggi berbeda */}
        <div className="flex items-center">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={author}
              className="w-12 h-12 rounded-full mr-4 object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-full mr-4 bg-teal-500 flex items-center justify-center text-white font-bold text-xl">
              {author.substring(0, 1)} {/* Inisial jika tidak ada avatar */}
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
          <div className="flex mt-3">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 sm:w-5 sm:h-5 ${
                  i < rating ? "text-yellow-400 fill-current" : "text-gray-300"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

const TestimonialsSection = () => {
  return (
    <section
      id="testimonials-section"
      className="py-16 sm:py-24 bg-gradient-to-br from-teal-50 via-cyan-50 to-sky-100"
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
            Guard dalam melindungi komunitas online mereka.
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }} // Picu saat 10% grid terlihat
        >
          {testimonialsData.map((testimonial) => (
            <TestimonialCard key={testimonial.id} {...testimonial} />
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
