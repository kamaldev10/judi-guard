// src/routes/AppRouter.jsx
import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Impor komponen Layout dan utilitas
import MainLayout from "@/components/layout/MainLayout";
import PageLoader from "@/components/PageLoader";

// Lazy loading untuk semua komponen halaman
const HomePage = lazy(() => import("@/pages/home/HomePage"));
const AboutUs = lazy(() => import("@/pages/about-us/AboutUs"));
const AnalysisPage = lazy(() => import("@/pages/analisis/AnalysisPage"));
const ProfilePage = lazy(() => import("@/pages/profile/ProfilePage"));
const EditProfilePage = lazy(() => import("@/pages/profile/EditProfilePage"));
const LoginPage = lazy(() => import("@/pages/auth/Login"));
const RegisterPage = lazy(() => import("@/pages/auth/Register"));
const OtpPage = lazy(() => import("@/pages/auth/OtpPage"));
const ForgotPasswordPage = lazy(
  () => import("@/pages/auth/ForgotPasswordPage")
);
const ResetPasswordPage = lazy(() => import("@/pages/auth/ResetPasswordPage"));
const NotFoundPage = lazy(() => import("@/pages/status/NotFound"));

// /**
//  * Komponen pusat untuk mengatur semua rute aplikasi.
//  * Menggunakan React Router v6 dengan lazy loading dan rute terproteksi.
//  */
const AppRouter = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="about-us" element={<AboutUs />} />
          <Route path="analisis" element={<AnalysisPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="profile/edit" element={<EditProfilePage />} />

          {/* Rute untuk halaman not-found di dalam MainLayout */}
          <Route path="not-found" element={<NotFoundPage />} />
        </Route>

        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/otp" element={<OtpPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

        <Route path="*" element={<Navigate to="/not-found" replace />} />
      </Routes>
    </Suspense>
  );
};

export default AppRouter;
