import React from "react";
import LogoWithSlogan from "../../assets/images/LogoWithSlogan.png";
import { Link, NavLink, useLocation } from "react-router-dom";

const Header = () => {
  const location = useLocation();

  const links = [
    { to: "/", label: "Beranda" },
    { to: "/about-us", label: "Tentang Kami" },
    { to: "/analisis", label: "Analisis" },
    { to: "/login", label: "Login" },
  ];

  return (
    <header className="bg-[--bg-blueOne] px-16 py-4 flex items-center justify-between h-32">
      <div className="flex items-center ">
        <img src={LogoWithSlogan} alt="Judi Guard Logo" className="w-48 " />
      </div>
      <NavLink className="space-x-20 text-gray-700 font-medium">
        {links.map((link) => {
          const isActive = location.pathname === link.to;
          return (
            <Link
              key={link.to}
              to={link.to}
              className={`${
                isActive
                  ? "text-[--primary-color] underline underline-offset-4 "
                  : "hover:[#1ad3c3]"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </NavLink>
    </header>
  );
};

export default Header;
