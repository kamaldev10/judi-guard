import React, { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send } from "lucide-react"; // Ikon untuk kontak
import { toast } from "react-toastify";

// Varian animasi
const sectionVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2, duration: 0.5 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const formItemVariants = {
  hidden: { opacity: 0, x: -30 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const ContactSection = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    // TODO: Implementasikan logika pengiriman form ke backend Anda atau layanan pihak ketiga
    // Contoh: await sendContactFormApi(formData);
    console.log("Form data submitted:", formData);

    // Simulasi pengiriman
    await new Promise((resolve) => setTimeout(resolve, 1500));

    toast.success(
      "Pesan Anda telah terkirim! Kami akan segera menghubungi Anda.",
      { position: "bottom-right" }
    );
    setFormData({ name: "", email: "", subject: "", message: "" }); // Reset form
    setIsSubmitting(false);
  };

  const contactInfo = [
    {
      icon: <Mail className="w-5 h-5 text-teal-600" />,
      text: "support@judiguard.com",
      href: "mailto:support@judiguard.com",
    },
    {
      icon: <Phone className="w-5 h-5 text-teal-600" />,
      text: "+628 1372 4664 72",
      href: "tel:+6281372466472",
    },
    {
      icon: <MapPin className="w-5 h-5 text-teal-600" />,
      text: "Pekanbaru, Riau, Indonesia",
    },
  ];

  return (
    <section id="contact-section" className="py-16 sm:py-24 bg-slate-100">
      <motion.div
        className="container mx-auto px-10 sm:px-6 lg:px-70"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
      >
        <motion.div
          variants={itemVariants}
          className="text-center mb-12 sm:mb-16 w-full "
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-teal-700 mb-3">
            Hubungi Kami
          </h2>
          <p className="text-gray-600 text-xs sm:text-sm md:text-lg max-w-full mx-auto">
            Punya pertanyaan atau butuh bantuan? Jangan ragu untuk menghubungi
            tim kami.
          </p>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-start">
          {/* Kolom Informasi Kontak (Mobile: Atas, Desktop: Kiri) */}
          <motion.div
            className="w-full lg:w-2/5 space-y-3 sm:space-y-6"
            variants={itemVariants}
          >
            <h3 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4">
              Informasi Kontak
            </h3>
            {contactInfo.map((info, index) => (
              <motion.div
                key={index}
                className="flex items-start gap-4 p-3 bg-teal-50/50 rounded-lg hover:bg-teal-100/70 transition-colors"
                custom={index} // Untuk delay stagger jika itemVariants adalah fungsi
                variants={itemVariants} // Bisa juga varian baru yang lebih spesifik
              >
                <div className="flex-shrink-0 mt-1">{info.icon}</div>
                <div>
                  {info.href ? (
                    <a
                      href={info.href}
                      className="text-sm sm:text-base text-gray-700 hover:text-teal-600 break-all"
                    >
                      {info.text}
                    </a>
                  ) : (
                    <p className="text-sm sm:text-base text-gray-700">
                      {info.text}
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
            {/* Anda bisa menambahkan peta di sini jika relevan */}
          </motion.div>

          {/* Kolom Form Kontak (Mobile: Bawah, Desktop: Kanan) */}
          <motion.div className="w-full lg:w-3/5" variants={formItemVariants}>
            {" "}
            {/* Variasi animasi berbeda untuk form */}
            <h3 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-6 lg:mb-4">
              Kirim Pesan Langsung
            </h3>
            <form onSubmit={handleSubmit} className="space-y-5">
              <motion.div variants={formItemVariants}>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Nama Anda
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 text-sm"
                  placeholder="John Doe"
                />
              </motion.div>
              <motion.div variants={formItemVariants}>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email Anda
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 text-sm"
                  placeholder="anda@example.com"
                />
              </motion.div>
              <motion.div variants={formItemVariants}>
                <label
                  htmlFor="subject"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Subjek
                </label>
                <input
                  type="text"
                  name="subject"
                  id="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 text-sm"
                  placeholder="Tentang..."
                />
              </motion.div>
              <motion.div variants={formItemVariants}>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Pesan Anda
                </label>
                <textarea
                  name="message"
                  id="message"
                  rows="4"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 text-sm resize-none"
                  placeholder="Tulis pesan Anda di sini..."
                ></textarea>
              </motion.div>
              <motion.div
                className="flex justify-start"
                variants={formItemVariants}
              >
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="sm:w-1/3 flex items-center justify-center gap-2 bg-teal-600 text-white font-semibold px-6 py-3 rounded-md
                             hover:bg-teal-700 shadow-md hover:shadow-lg transition-colors
                             focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50
                             disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <motion.div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Mengirim...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" /> Kirim Pesan
                    </>
                  )}
                </button>
              </motion.div>
            </form>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};

export default ContactSection;
