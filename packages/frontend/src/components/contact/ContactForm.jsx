import React from "react";
import PropTypes from "prop-types";
import { motion } from "framer-motion";
import { Send } from "lucide-react";
import { ValidationError } from "@formspree/react";

// Varian animasi
const formContainerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const formInputVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

// 2. Tambahkan 'errors' ke dalam daftar props
const ContactForm = ({
  formData,
  isSubmitting,
  onChange,
  onSubmit,
  errors,
}) => {
  return (
    <motion.div className="w-full lg:w-3/5" variants={formContainerVariants}>
      <h3 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-6 lg:mb-4">
        Kirim Pesan Langsung
      </h3>
      <form onSubmit={onSubmit} className="space-y-5" noValidate>
        {/* Input Name */}
        <motion.div variants={formInputVariants}>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Nama Anda
          </label>
          <input
            data-cy="name-input"
            type="text"
            name="name"
            id="name"
            value={formData.name}
            onChange={onChange}
            required
            className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 text-sm"
            placeholder="John Doe"
            disabled={isSubmitting}
          />
          <ValidationError
            prefix="Nama"
            field="name"
            errors={errors}
            className="text-red-600 text-xs mt-1"
          />
        </motion.div>

        {/* Input Email */}
        <motion.div variants={formInputVariants}>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Email Anda
          </label>
          <input
            data-cy="email-input"
            type="email"
            name="email"
            id="email"
            value={formData.email}
            onChange={onChange}
            required
            className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 text-sm"
            placeholder="anda@example.com"
            disabled={isSubmitting}
          />
          <ValidationError
            prefix="Email"
            field="email"
            errors={errors}
            className="text-red-600 text-xs mt-1"
          />
        </motion.div>

        {/* Input Subject */}
        <motion.div variants={formInputVariants}>
          <label
            htmlFor="subject"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Subjek
          </label>
          <input
            data-cy="subject-input"
            type="text"
            name="subject"
            id="subject"
            value={formData.subject}
            onChange={onChange}
            required
            className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 text-sm"
            placeholder="Tentang..."
            disabled={isSubmitting}
          />
          <ValidationError
            prefix="Subjek"
            field="subject"
            errors={errors}
            className="text-red-600 text-xs mt-1"
          />
        </motion.div>

        {/* Input Message */}
        <motion.div variants={formInputVariants}>
          <label
            htmlFor="message"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Pesan Anda
          </label>
          <textarea
            data-cy="message-input"
            name="message"
            id="message"
            rows="4"
            value={formData.message}
            onChange={onChange}
            required
            className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 text-sm resize-none"
            placeholder="Tulis pesan Anda di sini..."
            disabled={isSubmitting}
          ></textarea>
          <ValidationError
            prefix="Pesan"
            field="message"
            errors={errors}
            className="text-red-600 text-xs mt-1"
          />
        </motion.div>

        {/* Tombol Submit & Error Global */}
        <motion.div
          className="flex flex-col items-start"
          variants={formInputVariants}
        >
          <button
            data-cy="contact-submit-button"
            type="submit"
            disabled={isSubmitting}
            className="sm:w-1/3 flex items-center justify-center gap-2 bg-teal-600 text-white font-semibold px-6 py-3 rounded-md ..."
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

          <ValidationError
            errors={errors}
            className="text-red-600 text-sm mt-2"
          />
        </motion.div>
      </form>
    </motion.div>
  );
};

ContactForm.propTypes = {
  formData: PropTypes.shape({
    name: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    subject: PropTypes.string.isRequired,
    message: PropTypes.string.isRequired,
  }).isRequired,
  isSubmitting: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  errors: PropTypes.object, // 4. Tambahkan 'errors' ke PropTypes
};

// 5. Tambahkan default prop untuk 'errors' agar tidak crash jika 'undefined'
ContactForm.defaultProps = {
  errors: null,
};

export default ContactForm;
