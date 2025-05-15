import React from "react";

const Footer = () => {
  return (
    <footer className="bg-[--bg-blueOne] text-blue-900 pt-12 pb-6 px-6 md:px-20">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10">
        {/* Branding */}
        <div>
          <h1 className="text-2xl font-bold mb-2">JUDI GUARD</h1>
          <p className="text-sm mb-4">
            Platform pendeteksi komentar spam judi otomatis dan akurat di ruang
            digital Anda.
          </p>
          <p className="text-xs text-blue-800 italic">
            Bersama menjaga ruang digital tetap aman.
          </p>
        </div>

        {/* Navigasi */}
        <div>
          <h2 className="font-semibold text-lg mb-3">Navigasi</h2>
          <ul className="space-y-2 text-sm">
            <li>
              <a href="/" className="hover:text-blue-600">
                Beranda
              </a>
            </li>
            <li>
              <a href="/tentang" className="hover:text-blue-600">
                Tentang Kami
              </a>
            </li>
            <li>
              <a href="/cara-kerja" className="hover:text-blue-600">
                Cara Kerja
              </a>
            </li>
            <li>
              <a href="/login" className="hover:text-blue-600">
                Login
              </a>
            </li>
          </ul>
        </div>

        {/* Bantuan */}
        <div>
          <h2 className="font-semibold text-lg mb-3">Bantuan</h2>
          <ul className="space-y-2 text-sm">
            <li>
              <a href="/faq" className="hover:text-blue-600">
                FAQ
              </a>
            </li>
            <li>
              <a href="/kontak" className="hover:text-blue-600">
                Kontak Kami
              </a>
            </li>
            <li>
              <a href="/dukungan" className="hover:text-blue-600">
                Dukungan Teknis
              </a>
            </li>
            <li>
              <a href="/kebijakan" className="hover:text-blue-600">
                Kebijakan Privasi
              </a>
            </li>
          </ul>
        </div>

        {/* Newsletter */}
        <div>
          <h2 className="font-semibold text-lg mb-3">Berlangganan</h2>
          <p className="text-sm mb-3">
            Dapatkan update dan fitur terbaru dari kami langsung ke email Anda.
          </p>
          <form className="flex flex-col space-y-2">
            <input
              type="email"
              placeholder="Email Anda"
              className="p-2 rounded border border-blue-400 focus:outline-none focus:ring focus:border-blue-500 text-sm"
            />
            <button className="bg-blue-700 text-white text-sm py-2 px-4 rounded hover:bg-blue-800">
              Langganan
            </button>
          </form>
        </div>
      </div>

      {/* Copyright */}
      <div className="pt-6 text-sm text-center text-blue-800 font-bold">
        &copy; {new Date().getFullYear()} Judi Guard. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
