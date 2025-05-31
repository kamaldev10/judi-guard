// Contoh path: src/pages/status/NotFoundPage.jsx
import React from "react";
import { Link } from "react-router-dom";
import notFoundImage from "../../assets/images/notFound.jpg";

const NotFoundPage = ({
  imageUrl = notFoundImage,
  imageAlt = "Halaman Tidak Ditemukan",
  title = "Oops! Halaman Tidak Ditemukan",
  message = "Maaf, halaman yang Anda cari tidak ada atau mungkin pindah planet.",
  imageTailwindClass = "max-w-xs mb-4",
}) => {
  return (
    <section className="container mx-auto px-4 py-16 text-center min-h-screen flex flex-col justify-center items-center ">
      <img src={imageUrl} alt={imageAlt} className={imageTailwindClass} />
      <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4 ">
        {title}
      </h1>
      <p className="text-gray-600 mb-4 max-w-lg">{message}</p>
      <Link
        to="/"
        className="mt-4 px-6 py-3 text-base font-medium text-white bg-sky-500 rounded-2xl hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors duration-150"
      >
        Kembali ke Home Page
      </Link>
    </section>
  );
};

export default NotFoundPage;
