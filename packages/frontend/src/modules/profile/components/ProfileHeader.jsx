import React from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, Edit3, Mail, ShieldCheck, User } from 'lucide-react';
import PropTypes from 'prop-types';

const InfoItem = ({
  icon,
  label,
  value,
  valueClassName = 'text-slate-700 font-medium dark:text-gray-200',
  delay = 0,
}) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ type: 'spring', stiffness: 100, delay }}
    className="flex items-start p-3 sm:p-3.5 bg-sky-50 hover:bg-sky-100 dark:bg-gray-900 dark:hover:bg-gray-800 transition-colors duration-200 rounded-lg shadow-sm border border-sky-200 dark:border-gray-800"
  >
    <div className="mr-3 sm:mr-4 mt-1 shrink-0 text-cyan-600 dark:text-cyan-400" aria-hidden="true">
      {React.cloneElement(icon, { size: 18 })}
    </div>
    <div>
      <p className="text-xs text-slate-500 dark:text-gray-400">{label}</p>
      <p className={`text-sm break-all ${valueClassName}`}>{value || 'N/A'}</p>
    </div>
  </motion.div>
);
InfoItem.propTypes = {
  icon: PropTypes.node.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.string,
  valueClassName: PropTypes.string,
  delay: PropTypes.number,
};

const avatarMotionVariants = {
  initial: { scale: 0.5, opacity: 0 },
  animate: {
    scale: 1,
    opacity: 1,
    transition: { type: 'spring', stiffness: 260, damping: 20, delay: 0.05 },
  },
  hover: { scale: 1.05, rotate: 2, transition: { duration: 0.3 } },
};

export default function ProfileHeader({ user, onEditClick }) {
  const joinedDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'N/A';

  return (
    <motion.section
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-950 border dark:border-gray-850 shadow-sm rounded-xl p-6 md:p-8 flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8"
    >
      {/* Avatar dan Nama */}
      <div className="shrink-0 flex flex-col items-center text-center md:text-left">
        <motion.div
          variants={avatarMotionVariants}
          initial="initial"
          animate="animate"
          whileHover="hover"
          className="relative mb-3 md:mb-4"
        >
          <div className="w-32 h-32 md:w-36 md:h-36 rounded-full bg-linear-to-br from-sky-400 via-cyan-400 to-teal-500 flex items-center justify-center text-white shadow-lg ring-4 ring-white dark:ring-gray-900">
            <User size={80} strokeWidth={1.2} />
          </div>
          {user?.isVerified && (
            <motion.div
              className="absolute bottom-1 right-1 bg-green-500 p-2 rounded-full shadow-md border-2 border-white dark:border-gray-900"
              title="Akun Terverifikasi"
            >
              <ShieldCheck size={20} className="text-white" />
            </motion.div>
          )}
        </motion.div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white">
          {user?.username || 'Nama Pengguna'}
        </h1>
        <p className="text-sm text-cyan-600 dark:text-cyan-400 font-medium mt-1">
          Pengguna Terdaftar
        </p>
      </div>

      {/* Info Detail dan Tombol Edit */}
      <div className="flex-1 w-full md:w-auto">
        <div className="space-y-3 mb-6">
          <InfoItem
            icon={<Mail className="text-cyan-600 dark:text-cyan-400" />}
            label="Email"
            value={user?.email}
            delay={0.1}
          />
          <InfoItem
            icon={<CalendarDays className="text-cyan-600 dark:text-cyan-400" />}
            label="Bergabung Sejak"
            value={joinedDate}
            delay={0.2}
          />
          {user?.isVerified && (
            <div className="flex items-center p-2.5 bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400 rounded-lg text-xs border border-green-200 dark:border-green-900">
              <ShieldCheck size={18} className="mr-2 shrink-0" />
              <p className="font-medium">Akun email ini telah diverifikasi.</p>
            </div>
          )}
        </div>
        <button
          onClick={onEditClick}
          className="w-full bg-sky-600 hover:bg-sky-700 text-white font-semibold py-2.5 px-6 rounded-md shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center text-sm focus:outline-none cursor-pointer"
        >
          <Edit3 size={16} className="mr-2" />
          Edit Profil
        </button>
      </div>
    </motion.section>
  );
}
