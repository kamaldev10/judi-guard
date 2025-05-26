import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";

import OtpPage from "./pages/otp/OtpPage";
import Header from "./components/header/Header";
import Footer from "./components/footer/Footer";
import { HeadProvider } from "react-head";
import ErrorBoundary from "./components/error/error";
import { Slide, ToastContainer } from "react-toastify";
import AboutUs from "./pages/aboutUs/AboutUs";
import HomePage from "./pages/Home/HomePage";
import AnalysisPage from "./pages/analisis/AnalysisPage";
import Login from "./pages/auth/login/Login";
import Register from "./pages/auth/register/Register";

// Layout wrapper
const Layout = () => {
  return (
    <div>
      <Header />
      <Outlet />
      <Footer />
    </div>
  );
};

// Routes
function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="about-us" element={<AboutUs />} />
        <Route path="analisis" element={<AnalysisPage />} />
      </Route>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/otp" element={<OtpPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

// App Entry
function App() {
  return (
    <HeadProvider>
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        transition={Slide}
      />
      <Router>
        <ErrorBoundary>
          <AppRoutes />
        </ErrorBoundary>
      </Router>
    </HeadProvider>
  );
}

export default App;
