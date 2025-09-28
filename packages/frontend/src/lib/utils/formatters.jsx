// src/utils/formatters.js
import React from "react";
import PropTypes from "prop-types";

export const FormattedDate = ({ isoDate }) => {
  if (!isoDate) {
    // Anda bisa mengembalikan string kosong, null, atau placeholder
    return <span className="text-gray-400">-</span>;
  }
  const date = new Date(isoDate);
  if (isNaN(date.getTime())) {
    // Handle jika isoDate string tapi formatnya tidak valid
    return <span className="text-red-500">Tanggal Error</span>;
  }
  return (
    <time dateTime={isoDate}>
      {date.toLocaleDateString("id-ID", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })}{" "}
      {date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
    </time>
  );
};

FormattedDate.propTypes = {
  isoDate: PropTypes.string, // Dibuat opsional, dengan penanganan jika tidak ada
};

// Anda bisa menambahkan fungsi utilitas pemformatan lain di sini, misalnya:
// export const formatCurrency = (value) => { ... };
