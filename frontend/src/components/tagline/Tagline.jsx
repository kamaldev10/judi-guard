import React from "react";

const Tagline = ({ className = "" }) => {
  return (
    <div>
      <p
        className={`flex justify-center text-sm text-[#136854] italic py-5 font-semibold ${className}`}
      >
        Membantu Anda Menjaga Ruang Digital Tetap Aman
      </p>
    </div>
  );
};

export default Tagline;
