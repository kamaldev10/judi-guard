import React, { useState, useEffect } from "react"; // 1. Import useEffect
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import ContactInfoList from "@/components/contact/ContactInfoList";
import ContactForm from "@/components/contact/ContactForm";
import { Mail, MapPin, Phone } from "lucide-react";
import { useForm } from "@formspree/react";

const contactInfo = [
  {
    icon: <Mail className="w-5 h-5 text-teal-600" />,
    text: "alimusthafakamal@gmail.com",
    href: "mailto:alimusthafakamal@gmail.com",
  },
  {
    icon: <Phone className="w-5 h-5 text-teal-600" />,
    text: "+628 5161 7890 60",
    href: "tel:+6285161789060",
  },
  {
    icon: <MapPin className="w-5 h-5 text-teal-600" />,
    text: "Pekanbaru, Riau, Indonesia",
  },
];

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

const ContactSection = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [state, handleSubmit] = useForm("xpwkwjgk");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    console.log("Formspree State:", state);
    if (state.succeeded) {
      console.log("Success state detected, showing toast");
      toast.success("Pesan Anda telah terkirim!", {
        position: "bottom-right",
        toastId: "toast-contact-success",
      });
      setFormData({ name: "", email: "", subject: "", message: "" });
    }
  }, [state.succeeded]);

  // --- Rendering ---
  return (
    <section
      id="contact-section"
      className="py-4 sm:py-8 bg-linear-to-b to-[#B9E6FD] via-[#caedff] from-slate-100"
    >
      <motion.div
        className="container mx-auto px-10 sm:px-6 lg:px-70"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
      >
        {/* Judul & Deskripsi Section */}
        <motion.div
          variants={itemVariants}
          className="text-center mb-12 sm:mb-16 w-full "
        >
          <h2 className="text-4xl sm:text-5xl font-extrabold text-teal-700 mb-3">
            Hubungi Kami
          </h2>
          <p className="text-gray-600 text-xs sm:text-sm md:text-lg max-w-full mx-auto">
            Punya pertanyaan atau butuh bantuan?
          </p>
        </motion.div>

        {/* Layout Utama (Info Kontak & Form) */}
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-start">
          {/* Render Komponen Info Kontak "Bodoh" */}
          <ContactInfoList contactInfo={contactInfo} />

          {/* Render Komponen Form "Bodoh" */}
          <ContactForm
            formData={formData}
            isSubmitting={state.submitting}
            onChange={handleChange}
            onSubmit={handleSubmit}
            errors={state.errors}
          />
        </div>
      </motion.div>
    </section>
  );
};

export default ContactSection;
