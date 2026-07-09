import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'motion/react';
import { staggerContainer, fadeUp } from '@/lib/utils/motion';

const ContactInfoList = ({ contactInfo }) => {
  return (
    <motion.div
      className="w-full lg:w-2/5 space-y-3 sm:space-y-4 glass-panel rounded-xl p-4 sm:p-6"
      variants={staggerContainer(0.1)}
    >
      <h3 className="text-xl sm:text-2xl font-semibold text-foreground mb-2">Informasi Kontak</h3>
      {contactInfo.map((info, index) => (
        <motion.div
          key={index}
          className="flex items-start gap-4 p-3 rounded-lg bg-background/40 hover:bg-brand-50 dark:hover:bg-brand-100/10 transition-colors"
          variants={fadeUp}
        >
          <div className="shrink-0 mt-1">{info.icon}</div>
          <div>
            {info.href ? (
              <a
                href={info.href}
                className="text-sm sm:text-base text-foreground hover:text-brand-600 dark:hover:text-brand-400 break-all"
              >
                {info.text}
              </a>
            ) : (
              <p className="text-sm sm:text-base text-foreground">{info.text}</p>
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
    }),
  ).isRequired,
};

export default ContactInfoList;
