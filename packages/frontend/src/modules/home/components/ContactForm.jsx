import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { Send } from 'lucide-react';
import { ValidationError } from '@formspree/react';
import { staggerContainer, fadeUp } from '@/shared/utils/motion';

const fieldClass =
  'w-full p-4 bg-background/50 border border-border rounded-xl shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 text-sm placeholder:text-muted-foreground disabled:opacity-60 transition-all duration-300 ease-out hover:bg-background/80';

export default function ContactForm({ formData, isSubmitting, onChange, onSubmit, errors = null }) {
  return (
    <motion.div
      className="w-full glass-surface rounded-[2rem] p-8 sm:p-12 border border-border/50 shadow-2xl relative overflow-hidden"
      variants={staggerContainer(0.1)}
    >
      <h3 className="sr-only text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-8">
        Kirim Pesan
      </h3>
      <form onSubmit={onSubmit} className="space-y-5" noValidate>
        <motion.div variants={fadeUp}>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-foreground mb-1 text-left"
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
            className={fieldClass}
            placeholder="John Doe"
            disabled={isSubmitting}
          />
          <ValidationError
            prefix="Nama"
            field="name"
            errors={errors}
            className="text-destructive text-xs mt-1"
          />
        </motion.div>

        <motion.div variants={fadeUp}>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-foreground mb-1 text-left"
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
            className={fieldClass}
            placeholder="anda@example.com"
            disabled={isSubmitting}
          />
          <ValidationError
            prefix="Email"
            field="email"
            errors={errors}
            className="text-destructive text-xs mt-1"
          />
        </motion.div>

        <motion.div variants={fadeUp}>
          <label
            htmlFor="subject"
            className="block text-sm font-medium text-foreground mb-1 text-left"
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
            className={fieldClass}
            placeholder="Tentang..."
            disabled={isSubmitting}
          />
          <ValidationError
            prefix="Subjek"
            field="subject"
            errors={errors}
            className="text-destructive text-xs mt-1"
          />
        </motion.div>

        <motion.div variants={fadeUp}>
          <label
            htmlFor="message"
            className="block text-sm font-medium text-foreground mb-1 text-left"
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
            className={`${fieldClass} resize-none`}
            placeholder="Tulis pesan Anda di sini..."
            disabled={isSubmitting}
          />
          <ValidationError
            prefix="Pesan"
            field="message"
            errors={errors}
            className="text-destructive text-xs mt-1"
          />
        </motion.div>

        <motion.div className="flex flex-col items-start" variants={fadeUp}>
          <button
            data-cy="contact-submit-button"
            type="submit"
            disabled={isSubmitting}
            className="btn-brand sm:w-2/5 px-6 py-3 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <motion.div
                  className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{
                    repeat: Infinity,
                    duration: 0.8,
                    ease: 'linear',
                  }}
                />
                Mengirim...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" /> Kirim Pesan
              </>
            )}
          </button>

          <ValidationError errors={errors} className="text-destructive text-sm mt-2" />
        </motion.div>
      </form>
    </motion.div>
  );
}

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
  errors: PropTypes.object,
};
