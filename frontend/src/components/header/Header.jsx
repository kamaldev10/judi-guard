import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Icon } from "@iconify/react";
import LogoWithSlogan from "../../assets/images/LogoWithSlogan.png";
import { links } from ".";

const Header = () => {
  const location = useLocation();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const toggleDrawer = () => {
    setIsDrawerOpen((prev) => !prev);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
  };

  const renderLinks = (isMobile = false) =>
    links.map((link) => {
      const isActive = location.pathname === link.to;
      return (
        <Link
          key={link.to}
          to={link.to}
          onClick={isMobile ? closeDrawer : undefined}
          className={`flex items-center gap-3 px-3 py-2 text-base transition-all duration-200 ${
            isActive
              ? "text-[--primary-color] font-bold underline underline-offset-4"
              : "hover:text-[--primary-color]"
          }`}
        >
          <Icon icon={link.icon} width={20} height={20} />
          {link.label}
        </Link>
      );
    });

  return (
    <header className="sticky top-0 z-50 bg-[#B9E6FD] shadow-md px-6 md:px-16 py-2 flex items-center justify-between">
      <div className="flex items-center">
        <img
          src={LogoWithSlogan}
          alt="Judi Guard Logo"
          className="w-32 md:w-32 "
        />
      </div>

      {/* Desktop Navigation */}
      <nav className="hidden md:flex gap-10 font-medium text-gray-700 items-center">
        {renderLinks()}
      </nav>

      {/* Burger Menu (Mobile) */}
      <button
        onClick={toggleDrawer}
        className="md:hidden text-gray-700 focus:outline-none"
      >
        <Icon icon="mdi:menu" width={28} height={28} />
      </button>

      {/* Mobile Drawer */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out ${
          isDrawerOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-5 bg-blue-200 border-b-blue-300 flex justify-between items-center">
          <img src={LogoWithSlogan} alt="Logo" className="w-32" />
          <button onClick={closeDrawer}>
            <Icon icon="mdi:close" width={24} height={24} />
          </button>
        </div>
        <div className="flex flex-col p-4 space-y-4 ">{renderLinks(true)}</div>
      </div>

      {isDrawerOpen && (
        <div
          className="fixed inset-0 bg-black opacity-30 z-40"
          onClick={closeDrawer}
        />
      )}
    </header>
  );
};

export default Header;
