// src/routes/AppRouter.jsx
import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Impor komponen Layout dan utilitas
import MainLayout from '@/shared/components/layout/public/MainLayout';
// import PageLoader from '@/shared/components/layout/PageLoader';
import DashboardLayout from '@/shared/components/layout/dashboard/DashboardLayout';
import FeatureGuard from '@/shared/components/layout/FeatureGuard';
import NotFoundPage from '@/shared/components/status/NotFound';

// Lazy loading untuk semua komponen halaman
const HomePage = lazy(() => import('@/modules/home').then((m) => ({ default: m.HomePage })));
const ProfilePage = lazy(() =>
  import('@/modules/profile').then((m) => ({ default: m.ProfilePage })),
);
const EditProfilePage = lazy(() =>
  import('@/modules/profile').then((m) => ({ default: m.EditProfilePage })),
);
const AboutUs = lazy(() => import('@/modules/home').then((m) => ({ default: m.AboutUs })));
const FactPage = lazy(() => import('@/modules/home').then((m) => ({ default: m.FactPage })));

const LoginPage = lazy(() => import('@/modules/auth').then((m) => ({ default: m.LoginPage })));
const RegisterPage = lazy(() =>
  import('@/modules/auth').then((m) => ({ default: m.RegisterPage })),
);
const OtpPage = lazy(() => import('@/modules/auth').then((m) => ({ default: m.OtpPage })));
const SetPasswordPage = lazy(() =>
  import('@/modules/auth').then((m) => ({ default: m.SetPasswordPage })),
);
const ForgotPasswordPage = lazy(() =>
  import('@/modules/auth').then((m) => ({ default: m.ForgotPasswordPage })),
);
const ResetPasswordPage = lazy(() =>
  import('@/modules/auth').then((m) => ({ default: m.ResetPasswordPage })),
);
const ChangePasswordPage = lazy(() =>
  import('@/modules/auth').then((m) => ({ default: m.ChangePasswordPage })),
);

const OverviewPage = lazy(() =>
  import('@/modules/overview').then((m) => ({ default: m.OverviewPage })),
);
const GuidePage = lazy(() => import('@/modules/guide').then((m) => ({ default: m.GuidePage })));
const ConfigPage = lazy(() =>
  import('@/modules/configuration').then((m) => ({ default: m.ConfigPage })),
);
const DashboardAnalysisPage = lazy(() =>
  import('@/modules/video-analysis').then((m) => ({ default: m.VideoAnalysisPage })),
);
const Historypage = lazy(() =>
  import('@/modules/history').then((m) => ({ default: m.HistoryPage })),
);

const AppRouter = () => {
  return (
    <Suspense>
      <Routes>
        {/* public layout */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="about-us" element={<AboutUs />} />
          <Route path="facts" element={<FactPage />} />
        </Route>

        {/* dashboard layout */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<OverviewPage />} />

          <Route
            path="analysis"
            element={
              <FeatureGuard requireYoutube={true} requireLogin={true}>
                <DashboardAnalysisPage />
              </FeatureGuard>
            }
          />

          <Route
            path="history"
            element={
              <FeatureGuard requireLogin={true}>
                <Historypage />
              </FeatureGuard>
            }
          />

          <Route
            path="config"
            element={
              <FeatureGuard requireLogin={true} requireYoutube={true}>
                <ConfigPage />
              </FeatureGuard>
            }
          />

          <Route path="guide" element={<GuidePage />} />

          <Route
            path="profile"
            element={
              <FeatureGuard requireLogin={true}>
                <ProfilePage />
              </FeatureGuard>
            }
          />

          <Route
            path="profile/edit"
            element={
              <FeatureGuard requireLogin={true}>
                <EditProfilePage />
              </FeatureGuard>
            }
          />
        </Route>

        {/* auth layout */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/otp" element={<OtpPage />} />
        <Route path="/set-password" element={<SetPasswordPage />} />
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
