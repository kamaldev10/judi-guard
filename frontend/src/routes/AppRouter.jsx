// src/routes/AppRouter.jsx
import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import MainLayout from "../components/layout/MainLayout";
import ProtectedRoute from "./ProtectedRoute";
import Loader from "../components/loader/Loader";

const HomePage = lazy(() => import("../pages/Home/HomePage"));
const AboutUs = lazy(() => import("../pages/aboutUs/AboutUs"));
const AnalysisPage = lazy(() => import("../pages/analisis/AnalysisPage"));
const ProfilePage = lazy(() => import("../pages/profile/ProfilePage"));
const EditProfilPage = lazy(() => import("../pages/profile/EditProfilePage"));
const Login = lazy(() => import("../pages/auth/login/Login"));
const Register = lazy(() => import("../pages/auth/register/Register"));
const OtpPage = lazy(() => import("../pages/otp/OtpPage"));
const NotFoundPage = lazy(() => import("../pages/status/NotFound"));

const ForgotPasswordPage = lazy(
  () => import("../pages/auth/ForgotPasswordPage")
); // Tambahkan ini
const ResetPasswordPage = lazy(() => import("../pages/auth/ResetPasswordPage")); // Tambahkan ini

const AppRouter = () => {
  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        {/* Rute Publik dengan Layout Utama */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="about-us" element={<AboutUs />} />
          {/* Rute Terproteksi dengan Layout Utama */}
          <Route
            path="analisis"
            element={
              <ProtectedRoute>
                <AnalysisPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/edit"
            element={
              <ProtectedRoute>
                <EditProfilPage />
              </ProtectedRoute>
            }
          />
          <Route path="not-found" element={<NotFoundPage />} />
        </Route>
        {/* Rute Autentikasi (tanpa Layout Utama) */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/otp" element={<OtpPage />} />

        {/* <Route path="/forgot-password" element={<ForgotPasswordPage />} /> */}
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
        <Route path="*" element={<Navigate to="/not-found" replace />} />
      </Routes>
    </Suspense>
  );
};

export default AppRouter;
