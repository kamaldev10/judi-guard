// src/routes/ProtectedRoute.jsx
import { Navigate, Outlet } from "react-router-dom";

import { useAuthStore } from "@/stores/auth/authStore";
import PageLoader from "@/components/PageLoader";

const ProtectedRoute = () => {
  const { isAuthenticated, isLoadingAuth } = useAuthStore();

  if (isLoadingAuth) {
    return <PageLoader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
