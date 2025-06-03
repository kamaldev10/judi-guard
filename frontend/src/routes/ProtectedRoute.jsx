// src/routes/ProtectedRoute.jsx
import React from "react";
import Loader from "../components/loader/Loader";
import { useAuth } from "../contexts/AuthContext";
import { Navigate, useLocation } from "react-router-dom";
import PropTypes from "prop-types";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoadingAuth } = useAuth();
  const location = useLocation();

  if (isLoadingAuth) {
    return <Loader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired, // atau PropTypes.element, PropTypes.any, dll.
};
