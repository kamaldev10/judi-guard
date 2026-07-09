// src/routes/AppRouter.jsx
import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Impor komponen Layout dan utilitas
import MainLayout from '@/components/layout/public/MainLayout';
// import PageLoader from '@/components/layout/PageLoader';
import DashboardLayout from '@/components/layout/dashboard/DashboardLayout';
import FeatureGuard from '@/components/layout/FeatureGuard';
import NotFoundPage from '@/components/status/NotFound';

// Lazy loading untuk semua komponen halaman
const HomePage = lazy(() => import('@/pages/home/HomePage'));
const AnalysisPage = lazy(() => import('@/pages/analisis/AnalysisPage'));
const ProfilePage = lazy(() => import('@/pages/profile/ProfilePage'));
const EditProfilePage = lazy(() => import('@/pages/profile/EditProfilePage'));
const AboutUs = lazy(() => import('@/pages/about-us/AboutUs'));
const FactPage = lazy(() => import('@/pages/fact/FactPage'));

const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage'));
const OtpPage = lazy(() => import('@/pages/auth/OtpPage'));
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('@/pages/auth/ResetPasswordPage'));
const ChangePasswordPage = lazy(() => import('@/pages/auth/ChangePasswordPage'));

const OverviewPage = lazy(() => import('@/pages/dashboard/OverviewPage'));
const GuidePage = lazy(() => import('@/pages/dashboard/GuidePage'));
const ConfigPage = lazy(() => import('@/pages/dashboard/ConfigPage'));
const DashboardAnalysisPage = lazy(() => import('@/pages/dashboard/AnalysisPage'));
const Historypage = lazy(() => import('@/pages/dashboard/HistoryPage'));

// /**
//  * Komponen pusat untuk mengatur semua rute aplikasi.
//  * Menggunakan React Router v6 dengan lazy loading dan rute terproteksi.
//  */
const AppRouter = () => {
  return (
    // <Suspense fallback={<PageLoader />}>
    <Suspense>
      <Routes>
        {/* public layout */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="analysis" element={<AnalysisPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="profile/edit" element={<EditProfilePage />} />
          <Route path="about-us" element={<AboutUs />} />
          <Route path="facts" element={<FactPage />} />
        </Route>

        {/* dashboard layout */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          {/* Index: /dashboard (Overview) */}
          <Route
            index
            element={
              // <FeatureGuard requireYoutube={true}>
              <OverviewPage />
              // </FeatureGuard>
            }
          />

          {/* Feature: /dashboard/analysis */}
          <Route
            path="analysis"
            element={
              <FeatureGuard requireYoutube={true} requireLogin={true}>
                <DashboardAnalysisPage />
              </FeatureGuard>
            }
          />

          {/* Feature: /dashboard/history */}
          <Route
            path="history"
            element={
              <FeatureGuard requireLogin={true}>
                <Historypage />
              </FeatureGuard>
            }
          />

          {/* Feature: /dashboard/config */}
          <Route
            path="config"
            element={
              <FeatureGuard requireLogin={true} requireYoutube={true}>
                <ConfigPage />
              </FeatureGuard>
            }
          />

          <Route path="guide" element={<GuidePage />} />
        </Route>

        {/* auth layout */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/otp" element={<OtpPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/change-password" element={<ChangePasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
        <Route path="*" element={<Navigate to="/not-found" replace />} />
        <Route path="not-found" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
};

export default AppRouter;
