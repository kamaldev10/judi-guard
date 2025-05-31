// src/routes/ProtectedRoute.jsx
import React from "react";
import Loader from "../components/loader/Loader";
import { useAuth } from "../contexts/AuthContext";
import { Navigate, useLocation } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoadingAuth } = useAuth();
  const location = useLocation();

  if (isLoadingAuth) {
    return <Loader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Pengguna sudah login, tampilkan komponen children
  return children;
};

export default ProtectedRoute;
