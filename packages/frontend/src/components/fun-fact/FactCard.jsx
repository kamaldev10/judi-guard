import PropTypes from "prop-types";
import { motion } from "framer-motion";

// Varian animasi untuk item di dalam kartu
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, staggerChildren: 0.1 },
  },
};

export const FactCard = ({ fact }) => {
  return (
    <motion.div
      className="relative group bg-white/30 dark:bg-gray-900/40 backdrop-blur-lg p-5 rounded-2xl shadow-lg border border-white/20 transition-all duration-300 hover:shadow-cyan-500/50 hover:scale-[1.03]"
      variants={itemVariants}
    >
      <motion.div
        variants={itemVariants}
        className="w-full h-40 mb-4 overflow-hidden rounded-lg"
      >
        <img
          src={fact.image}
          alt={fact.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
      </motion.div>
      <motion.span variants={itemVariants} className="text-3xl">
        {fact.icon}
      </motion.span>
      <motion.h3
        variants={itemVariants}
        className="text-xl font-bold text-cyan-800 dark:text-cyan-300 mt-2"
      >
        {fact.title}
      </motion.h3>
      <motion.p
        variants={itemVariants}
        className="text-sm text-gray-700 dark:text-gray-300 mt-2"
      >
        {fact.text}
      </motion.p>
    </motion.div>
  );
};

FactCard.propTypes = {
  fact: PropTypes.shape({
    icon: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    text: PropTypes.string.isRequired,
    image: PropTypes.string.isRequired,
  }).isRequired,
};
