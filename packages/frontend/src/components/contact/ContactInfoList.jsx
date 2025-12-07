import React from "react";
import PropTypes from "prop-types";
import { motion } from "framer-motion";

// Varian animasi bisa diletakkan di sini jika spesifik untuk list item
const infoItemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    // Terima index 'i' sebagai custom prop
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1 }, // Delay stagger
  }),
};

const ContactInfoList = ({ contactInfo }) => {
  return (
    <motion.div
      className="w-full lg:w-2/5 space-y-3 sm:space-y-6"
      // Varian untuk container list bisa ditambahkan jika perlu
    >
      <h3 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4">
        Informasi Kontak
      </h3>
      {contactInfo.map((info, index) => (
        <motion.div
          key={index}
          className="flex items-start gap-4 p-3 bg-slate-100 rounded-lg hover:bg-teal-100/70 transition-colors"
          custom={index} // Kirim index ke varian
          variants={infoItemVariants}
          // Initial & animate bisa dihandle oleh parent jika menggunakan staggerChildren
        >
          <div className="shrink-0 mt-1">{info.icon}</div>
          <div>
            {info.href ? (
              <a
                href={info.href}
                className="text-sm sm:text-base text-gray-700 hover:text-teal-600 break-all"
              >
                {info.text}
              </a>
            ) : (
              <p className="text-sm sm:text-base text-gray-700">{info.text}</p>
            )}
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};

ContactInfoList.propTypes = {
  contactInfo: PropTypes.arrayOf(
    PropTypes.shape({
      icon: PropTypes.node.isRequired,
      text: PropTypes.string.isRequired,
      href: PropTypes.string,
    })
  ).isRequired,
};

export default ContactInfoList;
