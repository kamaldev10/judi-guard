import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  Menu,
  X,
  LogIn,
  LogOut,
  Home,
  Info,
  BarChart3,
  UserCircle,
  HandMetal,
} from "lucide-react";

import LogoImage from "../../assets/images/Logo.png";
import { toast } from "react-toastify";

const Header = () => {
  const { isAuthenticated, currentUser, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef(null);

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
    navigate("/login");
    toast.error("Anda berhasil logout");
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const shouldShowLoginButton =
    !isAuthenticated &&
    (location.pathname === "/" || location.pathname === "/about-us");

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target)
      ) {
        const toggleButton = document.getElementById("mobile-menu-button");
        if (toggleButton && !toggleButton.contains(event.target)) {
          setIsMobileMenuOpen(false);
        }
      }
    };
    if (isMobileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  const navLinkClasses = (path, isMobile = false) => {
    const baseClasses = `px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 inline-flex items-center`; // Tambahkan flex items-center
    const activeClasses = `text-blue-600 font-semibold ${isMobile ? "bg-blue-50" : "md:bg-transparent"}`;
    const inactiveClasses = `text-gray-700 hover:text-blue-600 ${isMobile ? "hover:bg-gray-100" : "md:hover:bg-transparent"}`;
    return `${baseClasses} ${location.pathname === path ? activeClasses : inactiveClasses} ${isMobile ? "w-full text-left" : "inline-block"}`;
  };

  const renderAuthButtons = (isMobile = false) => {
    const buttonBaseClasses = `px-4 py-2 rounded-md text-sm font-medium transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-opacity-50 flex items-center justify-center`; // Tambahkan flex items-center justify-center
    const loginButtonClasses = `text-white bg-teal-500 hover:bg-teal-700 focus:ring-teal-400 ${buttonBaseClasses}`;
    const logoutButtonClasses = `text-white bg-red-700 hover:bg-red-900 focus:ring-red-400  ${buttonBaseClasses}`;

    if (isAuthenticated) {
      return (
        <button
          onClick={handleLogout}
          className={`${logoutButtonClasses} ${isMobile ? "w-full mt-2" : ""}`}
        >
          <LogOut size={18} className="mr-2" /> Keluar
        </button>
      );
    } else if (shouldShowLoginButton) {
      return (
        <Link
          to="/login"
          onClick={() => isMobile && setIsMobileMenuOpen(false)}
          className={`${loginButtonClasses} ${isMobile ? "w-full mt-2 block" : ""}`} // Hapus text-center jika sudah ada flex
        >
          <LogIn size={18} className="mr-2" /> Masuk
        </Link>
      );
    }
    return null;
  };

  // Helper untuk ikon navigasi
  const getNavIcon = (path) => {
    switch (path) {
      case "/":
        return <Home size={18} className="mr-2" />;
      case "/about-us":
        return <Info size={18} className="mr-2" />;
      case "/analisis":
        return <BarChart3 size={18} className="mr-2" />;
      case "/profile":
        return <UserCircle size={18} className="mr-2" />;
      default:
        return null;
    }
  };

  return (
    <header className="bg-[#B9E6FD] shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4  sm:px-6 md:px-1 lg:px-8 ">
        <div className="flex items-center justify-between h-18">
          <div className="flex flex-shrink-0">
            <Link
              to="/about-us"
              className="text-2xl font-bold text-blue-600 hover:text-blue-700 transition-colors"
            >
              <img
                src={LogoImage}
                alt="Logo Judi Guard"
                className="w-26 border border-sky-500 rounded-full p-2 bg-transparent "
              />
            </Link>
          </div>

          <nav className="hidden md:flex items-center md:space-x-1 lg:space-x-10">
            <Link to="/" className={navLinkClasses("/#hero-section")}>
              {getNavIcon("/")} Beranda
            </Link>
            <Link to="/about-us" className={navLinkClasses("/about-us")}>
              {getNavIcon("/about-us")} Tentang Kami
            </Link>
            {isAuthenticated && (
              <Link to="/analisis" className={navLinkClasses("/analisis")}>
                {getNavIcon("/analisis")} Analisis
              </Link>
            )}
            {isAuthenticated && (
              <Link to="/profile" className={navLinkClasses("/profile")}>
                {getNavIcon("/profile")} Profil
              </Link>
            )}
            {isAuthenticated && currentUser && (
              <span className="text-sm text-[#06786F] ml-4 pl-4 border-l-cyan-600 border-l-2 font-semibold border-gray-200 inline-flex items-center">
                <HandMetal size={18} className="mr-1 text-amber-700" /> Halo,{" "}
                {currentUser.username || currentUser.name || "Pengguna"}
              </span>
            )}
            <div className="ml-4 hidden md:block">{renderAuthButtons()}</div>
          </nav>

          <div className="md:hidden flex items-center">
            <button
              id="mobile-menu-button"
              onClick={toggleMobileMenu}
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-blue-600 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              aria-controls="mobile-menu"
              aria-expanded={isMobileMenuOpen}
            >
              <span className="sr-only">Buka menu utama</span>
              {isMobileMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div
          ref={mobileMenuRef}
          className="md:hidden absolute top-18 inset-x-0 z-40" // Removed transform classes for simplicity, rely on conditional rendering
        >
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-[#B9E6FD] border-t border-gray-200 shadow-xl rounded-b-lg">
            {isAuthenticated && currentUser && (
              <div className="px-3 py-3 border-b border-gray-100 flex items-center">
                <HandMetal size={20} className="mr-2 text-gray-700" />
                <span className="block text-sm font-semibold text-[#06786F]">
                  Halo, {currentUser.username || currentUser.name || "Pengguna"}
                </span>
              </div>
            )}
            <Link
              to="/"
              className={navLinkClasses("/", true)}
              onClick={toggleMobileMenu}
            >
              {getNavIcon("/")} Home
            </Link>
            <Link
              to="/about-us"
              className={navLinkClasses("/about-us", true)}
              onClick={toggleMobileMenu}
            >
              {getNavIcon("/about-us")} About Us
            </Link>
            {isAuthenticated && (
              <Link
                to="/analisis"
                className={navLinkClasses("/analisis", true)}
                onClick={toggleMobileMenu}
              >
                {getNavIcon("/analisis")} Analisis
              </Link>
            )}
            {isAuthenticated && (
              <Link
                to="/profile"
                className={navLinkClasses("/profile", true)}
                onClick={toggleMobileMenu}
              >
                {getNavIcon("/profile")} Profil
              </Link>
            )}
            <div className="px-1 pt-3 pb-2  border-t border-gray-100 mt-2">
              {renderAuthButtons(true)}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
