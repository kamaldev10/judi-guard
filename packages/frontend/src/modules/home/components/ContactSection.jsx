import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { toast } from 'react-toastify';
import ContactInfoList from '@/modules/home/components/ContactInfoList';
import ContactForm from '@/modules/home/components/ContactForm';
import { Mail, MapPin, Phone } from 'lucide-react';
import { useForm } from '@formspree/react';
import { staggerContainer, fadeUp, viewportOnce } from '@/shared/utils/motion';

const contactInfo = [
  {
    icon: <Mail className="w-5 h-5 text-brand-600 dark:text-brand-400" />,
    text: 'alimusthafakamal@gmail.com',
    href: 'mailto:alimusthafakamal@gmail.com',
  },
  {
    icon: <Phone className="w-5 h-5 text-brand-600 dark:text-brand-400" />,
    text: '+628 5161 7890 60',
    href: 'tel:+6285161789060',
  },
  {
    icon: <MapPin className="w-5 h-5 text-brand-600 dark:text-brand-400" />,
    text: 'Pekanbaru, Riau, Indonesia',
  },
];

const ContactSection = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [state, handleSubmit] = useForm('xpwkwjgk');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    if (state.succeeded) {
      toast.success('Pesan Anda telah terkirim!', {
        position: 'bottom-right',
        toastId: 'toast-contact-success',
      });
      setFormData({ name: '', email: '', subject: '', message: '' });
    }
  }, [state.succeeded]);

  return (
    <section id="contact-section" className="py-24 sm:py-32 w-full relative">
      <motion.div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        variants={staggerContainer(0.2)}
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start">
          {/* Left Side: Typography and Info */}
          <motion.div variants={fadeUp} className="flex flex-col">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-6 tracking-tighter leading-none heading-gradient">
              Mari <br />
              Berdiskusi.
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg max-w-[40ch] mb-12">
              Punya pertanyaan mengenai sistem deteksi kami atau butuh bantuan integrasi? Tim kami
              siap membantu Anda kapan saja.
            </p>

            <div className="p-8 rounded-[2rem] glass-surface border border-border/50 shadow-xl">
              <ContactInfoList contactInfo={contactInfo} />
            </div>
          </motion.div>

          {/* Right Side: Form */}
          <motion.div variants={fadeUp} className="w-full">
            <ContactForm
              formData={formData}
              isSubmitting={state.submitting}
              onChange={handleChange}
              onSubmit={handleSubmit}
              errors={state.errors}
            />
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};

export default ContactSection;
