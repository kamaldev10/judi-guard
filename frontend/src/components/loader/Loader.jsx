import { motion } from "motion/react";
import React from "react";

const Loader = () => {
  const bounceTransition = {
    repeat: Infinity,
    duration: 1.2,
    ease: "easeInOut",
  };
  return (
    <>
      <div className="fixed inset-0 flex items-center justify-center bg-white/70 z-50">
        <div className="flex gap-2">
          {["bg-blue-500", "bg-red-500", "bg-yellow-400", "bg-green-500"].map(
            (color, i) => (
              <motion.div
                key={i}
                className={`w-4 h-4 rounded-full ${color}`}
                animate={{ scale: [0.5, 1, 0.5] }}
                transition={{ ...bounceTransition, delay: i * 0.2 }}
              />
            )
          )}
        </div>
      </div>
    </>
  );
};

export default Loader;
