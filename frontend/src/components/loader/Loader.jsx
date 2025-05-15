import React from "react";

const Loader = () => {
  return (
    <div
      className="loader-overlay"
      role="alert"
      aria-busy="true"
      aria-label="Loading"
    >
      <div className="loader-spinner"></div>
    </div>
  );
};

export default Loader;
