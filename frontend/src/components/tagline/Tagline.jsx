import React from "react";

const Tagline = ({ className = "" }) => {
  return (
    <div>
      <p
        className={`
          text-center 
          text-xs sm:text-sm md:text-base 
          text-[#136854] 
          italic 
          py-3 sm:py-4 md:py-5 
          font-semibold 
          leading-relaxed
          ${className}
        `}
      >
        Membantu Anda Menjaga Ruang Digital Tetap Aman
      </p>
    </div>
  );
};

export default Tagline;
