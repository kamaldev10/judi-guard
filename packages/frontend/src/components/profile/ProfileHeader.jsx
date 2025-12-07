import React from "react";
import { motion } from "framer-motion";
import { useProfilePresenter } from "@/hooks/profile/useProfilePresenter";
import { CalendarDays, Edit3, Mail, ShieldCheck, User } from "lucide-react";
import PropTypes from "prop-types";
import { sectionItemVariants } from "@/pages/profile/ProfilePage";

const InfoItem = ({
  icon,
  label,
  value,
  valueClassName = "text-slate-700 font-medium",
  delay = 0,
}) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ type: "spring", stiffness: 100, delay }}
    className="flex items-start p-3 sm:p-3.5 bg-sky-50 hover:bg-sky-100 transition-colors duration-200 rounded-lg shadow-sm border border-sky-200"
  >
    <div
      className="mr-3 sm:mr-4 mt-1 shrink-0 text-cyan-600"
      aria-hidden="true"
    >
      {React.cloneElement(icon, { size: 18 })}{" "}
    </div>
    <div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className={`text-sm break-all ${valueClassName}`}>{value || "N/A"}</p>
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
    transition: { type: "spring", stiffness: 260, damping: 20, delay: 0.05 },
  },
  hover: { scale: 1.05, rotate: 2, transition: { duration: 0.3 } },
};

export const ProfileHeader = () => {
  const { handleEditProfile, user } = useProfilePresenter();

  const joinedDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("id-ID", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "N/A";

  return (
    <>
      <motion.section
        variants={sectionItemVariants}
        className=" bg-slate-100 shadow-xl rounded-xl p-6 md:p-8 flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8"
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
            <div className="w-32 h-32 md:w-36 md:h-36 rounded-full bg-linear-to-br from-sky-400 via-cyan-400 to-teal-500 flex items-center justify-center text-white shadow-lg ring-4 ring-white ring-offset-4 ring-offset-[#d8f6ff]">
              <User size={80} strokeWidth={1.2} />
            </div>
            {user.isVerified && (
              <motion.div
                className="absolute bottom-1 right-1 bg-green-500 p-2 rounded-full shadow-md border-2 border-white"
                title="Akun Terverifikasi"
              >
                <ShieldCheck size={20} className="text-white" />
              </motion.div>
            )}
          </motion.div>
          <motion.h1
            id="profile-heading"
            className="text-3xl md:text-4xl font-bold text-slate-800"
          >
            {user.username || "Nama Pengguna"}
          </motion.h1>
          <motion.p className="text-sm text-cyan-600 font-medium mt-1">
            Pengguna Terdaftar
          </motion.p>
        </div>

        {/* Info Detail dan Tombol Edit */}
        <div className="flex-1 w-full md:w-auto">
          <div className="space-y-3 mb-6">
            <InfoItem
              icon={<Mail className="text-cyan-600" />}
              label="Email"
              value={user.email}
              delay={0.1}
            />
            <InfoItem
              icon={<CalendarDays className="text-cyan-600" />}
              label="Bergabung Sejak"
              value={joinedDate}
              delay={0.2}
            />
            {user.isVerified && (
              <motion.div
                variants={sectionItemVariants} // Gunakan varian yang sama atau baru
                className="flex items-center p-2.5 bg-green-50 text-green-700 rounded-lg text-xs border border-green-200"
              >
                <ShieldCheck size={18} className="mr-2 shrink-0" />
                <p className="font-medium">
                  Akun email ini telah diverifikasi.
                </p>
              </motion.div>
            )}
          </div>
          <motion.button
            data-cy="edit-profile-button"
            onClick={handleEditProfile}
            className="w-full bg-sky-600 hover:bg-sky-700 text-white font-semibold py-2.5 px-6 rounded-md shadow-md hover:shadow-lg transition-colors duration-200 flex items-center justify-center text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
          >
            <Edit3 size={16} className="mr-2" />
            Edit Profil
          </motion.button>
        </div>
      </motion.section>
    </>
  );
};
