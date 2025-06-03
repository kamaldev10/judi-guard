import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white pt-10 pb-6 px-4 sm:px-6 md:px-12 lg:px-20">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8  sm:pb-2 md:pb-5">
          <div className="sm:col-span-2 md:col-span-1 md:w-11/12">
            <h1 className="text-xl sm:text-2xl font-bold mb-3">JUDI GUARD</h1>{" "}
            <p className="text-xs sm:text-sm mb-4 leading-relaxed">
              Platform pendeteksi komentar spam judi otomatis dan akurat di
              ruang digital Anda.
            </p>
          </div>

          <div>
            <h2 className="font-semibold text-base sm:text-lg mb-3">
              Navigasi
            </h2>

            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link to="/" className="hover:text-blue-400 transition-colors">
                  Beranda
                </Link>
              </li>
              <li>
                <Link
                  to="/about-us"
                  className="hover:text-blue-400 transition-colors"
                >
                  Tentang Kami
                </Link>
              </li>
              <li>
                <Link
                  to="/analisis"
                  className="hover:text-blue-400 transition-colors"
                >
                  Analisis
                </Link>
              </li>
              <li>
                <Link
                  to="/profile"
                  className="hover:text-blue-400 transition-colors"
                >
                  Profil
                </Link>
              </li>
            </ul>
          </div>

          {/* Kolom 3: Bantuan */}
          <div>
            <h2 className="font-semibold text-base sm:text-lg mb-3">Bantuan</h2>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link
                  to="/faq"
                  className="hover:text-blue-400 transition-colors"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  to="/#contact-section"
                  className="hover:text-blue-400 transition-colors"
                >
                  Kontak Kami
                </Link>
              </li>
              {/* <li> // Contoh link dukungan ditiadakan jika belum ada
                <Link to="/dukungan" className="hover:text-blue-400 transition-colors">
                  Dukungan Teknis
                </Link>
              </li> */}
              {/* <li>
                <Link
                  to="/kebijakan-privasi"
                  className="hover:text-blue-400 transition-colors"
                >
                  Kebijakan Privasi
                </Link>
              </li> */}
            </ul>
          </div>

          {/* Kolom 4: Newsletter */}
          <div>
            <h2 className="font-semibold text-base sm:text-lg mb-3">
              Berlangganan
            </h2>
            <p className="text-xs sm:text-sm mb-3 leading-relaxed">
              Dapatkan update dan fitur terbaru dari kami langsung ke email
              Anda.
            </p>
            <form className="flex flex-col sm:flex-row sm:space-y-0 sm:space-x-2 space-y-2">
              <input
                type="email"
                placeholder="Email Anda"
                className="p-2 rounded border border-gray-600 bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm flex-grow" // text-sm, flex-grow
              />
              <button
                type="submit"
                className="bg-blue-600 text-white text-sm py-2 px-4 rounded hover:bg-blue-700 transition-colors whitespace-nowrap "
              >
                Langganan
              </button>
            </form>
          </div>
        </div>
        {/* Copyright */}
        <div className="pt-8 mt-8 border-t border-gray-700 text-xs sm:text-sm text-center text-gray-400">
          &copy; {new Date().getFullYear()} Judi Guard. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
