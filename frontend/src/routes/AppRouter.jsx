// // src/routes/AppRouter.jsx
// import React, { Suspense, lazy } from "react";
// import { Routes, Route, Navigate } from "react-router-dom";

// import MainLayout from "../components/layout/MainLayout";
// import ProtectedRoute from "./ProtectedRoute";
// import Loader from "../components/loader/Loader";

// const HomePage = lazy(() => import("../pages/Home/HomePage"));
// const AboutUs = lazy(() => import("../pages/aboutUs/AboutUs"));
// const AnalysisPage = lazy(() => import("../pages/analisis/AnalysisPage"));
// const ProfilePage = lazy(() => import("../pages/profile/ProfilePage"));
// const EditProfilPage = lazy(() => import("../pages/profile/EditProfilePage"));
// const Login = lazy(() => import("../pages/auth/login/Login"));
// const Register = lazy(() => import("../pages/auth/register/Register"));
// const OtpPage = lazy(() => import("../pages/otp/OtpPage"));
// const NotFoundPage = lazy(() => import("../pages/status/NotFound"));

// const ForgotPasswordPage = lazy(
//   () => import("../pages/auth/ForgotPasswordPage")
// ); // Tambahkan ini
// const ResetPasswordPage = lazy(() => import("../pages/auth/ResetPasswordPage")); // Tambahkan ini

// const AppRouter = () => {
//   return (
//     <Suspense fallback={<Loader />}>
//       <Routes>
//         {/* Rute Publik dengan Layout Utama */}
//         <Route path="/" element={<MainLayout />}>
//           <Route index element={<HomePage />} />
//           <Route path="about-us" element={<AboutUs />} />
//           {/* Rute Terproteksi dengan Layout Utama */}
//           <Route
//             path="analisis"
//             element={
//               <ProtectedRoute>
//                 <AnalysisPage />
//               </ProtectedRoute>
//             }
//           />
//           <Route
//             path="profile"
//             element={
//               <ProtectedRoute>
//                 <ProfilePage />
//               </ProtectedRoute>
//             }
//           />
//           <Route
//             path="/profile/edit"
//             element={
//               <ProtectedRoute>
//                 <EditProfilPage />
//               </ProtectedRoute>
//             }
//           />
//           <Route path="not-found" element={<NotFoundPage />} />
//         </Route>
//         {/* Rute Autentikasi (tanpa Layout Utama) */}
//         <Route path="/login" element={<Login />} />
//         <Route path="/register" element={<Register />} />
//         <Route path="/otp" element={<OtpPage />} />

//         {/* <Route path="/forgot-password" element={<ForgotPasswordPage />} /> */}
//         <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
//         <Route path="*" element={<Navigate to="/not-found" replace />} />
//       </Routes>
//     </Suspense>
//   );
// };

// export default AppRouter;

//=======================================================================

// src/routes/AppRouter.jsx
import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Impor komponen Layout dan utilitas
import MainLayout from "../components/layout/MainLayout";
import ProtectedRoute from "./ProtectedRoute"; // Komponen untuk memproteksi rute
import Loader from "../components/loader/Loader"; // Komponen fallback untuk Suspense

// Lazy loading untuk semua komponen halaman
const HomePage = lazy(() => import("../pages/Home/HomePage"));
const AboutUs = lazy(() => import("../pages/aboutUs/AboutUs"));
const AnalysisPage = lazy(() => import("../pages/analisis/AnalysisPage"));
const ProfilePage = lazy(() => import("../pages/profile/ProfilePage"));
const EditProfilePage = lazy(() => import("../pages/profile/EditProfilePage"));
const LoginPage = lazy(() => import("../pages/auth/login/Login"));
const RegisterPage = lazy(() => import("../pages/auth/register/Register"));
const OtpPage = lazy(() => import("../pages/otp/OtpPage"));
const ForgotPasswordPage = lazy(
  () => import("../pages/auth/ForgotPasswordPage")
);
const ResetPasswordPage = lazy(() => import("../pages/auth/ResetPasswordPage"));
const NotFoundPage = lazy(() => import("../pages/status/NotFound"));

// /**
//  * Komponen pusat untuk mengatur semua rute aplikasi.
//  * Menggunakan React Router v6 dengan lazy loading dan rute terproteksi.
//  */
const AppRouter = () => {
  return (
    //     // Suspense sebagai fallback saat komponen lazy-loaded sedang dimuat
    <Suspense fallback={<Loader />}>
      <Routes>
        {/* Grup 1: Rute yang menggunakan MainLayout */}
        <Route path="/" element={<MainLayout />}>
          {/* Rute Publik di dalam MainLayout */}
          <Route index element={<HomePage />} />
          <Route path="about-us" element={<AboutUs />} />

          {/* --- PERBAIKAN: Grup Rute Terproteksi --- */}
          {/* Semua rute yang ada di dalam sini akan dicek oleh ProtectedRoute */}
          <Route element={<ProtectedRoute />}>
            <Route path="analisis" element={<AnalysisPage />} />
            <Route path="profile" element={<ProfilePage />} />
            {/* PERBAIKAN: Path dibuat relatif terhadap induknya, tanpa '/' di depan */}
            <Route path="profile/edit" element={<EditProfilePage />} />
            {/* Anda bisa menambahkan rute terproteksi lainnya di sini */}
            {/* Contoh: <Route path="dashboard" element={<DashboardPage />} /> */}
          </Route>

          {/* Rute untuk halaman not-found di dalam MainLayout */}
          <Route path="not-found" element={<NotFoundPage />} />
        </Route>

        {/* Grup 2: Rute yang tidak menggunakan MainLayout (misal, halaman fullscreen) */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/otp" element={<OtpPage />} />
        {/* PERBAIKAN: Rute /forgot-password diaktifkan */}
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

        {/* Rute Catch-all: Jika tidak ada rute yang cocok, arahkan ke halaman not-found */}
        {/* Ini akan menangkap URL yang tidak valid di level paling atas */}
        <Route path="*" element={<Navigate to="/not-found" replace />} />
      </Routes>
    </Suspense>
  );
};

export default AppRouter;
