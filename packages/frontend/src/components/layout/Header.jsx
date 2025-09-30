import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  LogIn,
  Home,
  Info,
  BarChart3,
  UserCircle,
  HandMetal,
} from "lucide-react";

import { toast } from "react-toastify";
import { Logo } from "@images";
import Swal from "sweetalert2";
import ThemeToggle from "../ThemeToggle";
import { useAuthStore } from "@/stores/auth/authStore";
import LogoutButton from "../ui/LogoutButton";
import LoginButton from "../ui/LoginButton";

const Header = () => {
  const { isAuthenticated, currentUser, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef(null);

  const handleLogout = () => {
    Swal.fire({
      title: "Ingin Keluar dari Aplikasi?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#545454",
      confirmButtonText: "Logout",
    }).then((result) => {
      if (result.isConfirmed) {
        logout();
        setIsMobileMenuOpen(false);
        navigate("/login");
        toast.error("Anda berhasil logout");
      }
    });
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

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
    if (isAuthenticated) {
      // User is logged in - show logout button
      return <LogoutButton onClick={handleLogout} />;
    } else {
      // User is not logged in - show login button
      return (
        <Link
          to="/login"
          onClick={() => isMobile && setIsMobileMenuOpen(false)}
          // className={`text-white bg-teal-500 hover:bg-teal-700 focus:ring-teal-400 ${buttonBaseClasses} ${isMobile ? "w-full mt-2 block" : ""}`}
        >
          <LoginButton />
        </Link>
      );
    }
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
    <>
      <header className="bg-[#B9E6FD] shadow-lg sticky top-0 z-50">
        <Link
          to="/#connect-section"
          className="absolute top-20 left-[-9999px] focus:left-1/2 focus:-translate-x-1/2 bg-white/20 border border-teal-500 text-teal-500 rounded-md px-4 py-2"
        >
          Skip to content
        </Link>
        <div className="container mx-auto px-4  sm:px-6 md:px-1 lg:px-8 ">
          <div className="flex items-center justify-between h-18">
            <div className="flex flex-shrink-0">
              <Link
                to="/about-us"
                className="text-2xl font-bold text-blue-600 hover:text-blue-700 transition-colors"
              >
                <img
                  src={Logo}
                  alt="Logo Judi Guard"
                  className="w-32 p-2 bg-transparent "
                />
              </Link>
            </div>

            <nav className="hidden md:flex items-center md:space-x-1 lg:space-x-5">
              <Link to="/" className={navLinkClasses("/#hero-section")}>
                {getNavIcon("/")} Beranda
              </Link>
              <Link to="/about-us" className={navLinkClasses("/about-us")}>
                {getNavIcon("/about-us")} Tentang Kami
              </Link>
              <Link to="/analisis" className={navLinkClasses("/analisis")}>
                {getNavIcon("/analisis")} Analisis
              </Link>
              <Link to="/profile" className={navLinkClasses("/profile")}>
                {getNavIcon("/profile")} Profil
              </Link>
              {isAuthenticated && currentUser && (
                <span className="text-sm text-[#06786F] ml-4 pl-4 border-l-cyan-600 border-l-2 font-semibold border-gray-200 inline-flex items-center">
                  <HandMetal size={18} className="mr-1 text-amber-700" />
                  Halo, {currentUser.username || currentUser.name || "Pengguna"}
                </span>
              )}
              <div className="ml-4 hidden md:block">{renderAuthButtons()}</div>
              {/* <ThemeToggle /> */}
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
                <span className="text-sm text-[#06786F] ml-4 pl-4 border-l-cyan-600 border-l-2 font-semibold border-gray-200 inline-flex items-center">
                  <HandMetal size={18} className="mr-1 text-amber-700" />
                  Halo, {currentUser.username || currentUser.name || "Pengguna"}
                </span>
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
              <Link
                to="/analisis"
                className={navLinkClasses("/analisis", true)}
                onClick={toggleMobileMenu}
              >
                {getNavIcon("/analisis")} Analisis
              </Link>
              <Link
                to="/profile"
                className={navLinkClasses("/profile", true)}
                onClick={toggleMobileMenu}
              >
                {getNavIcon("/profile")} Profil
              </Link>
              <div className="px-1 pt-3 pb-2 border-t border-gray-100 mt-2">
                {renderAuthButtons(true)}
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
};

export default Header;
