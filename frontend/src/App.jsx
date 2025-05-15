import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  useNavigate,
  Navigate,
  Outlet,
} from "react-router-dom";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Home from "./pages/Home/Home";
import OtpPage from "./pages/otp/OtpPage";
import Header from "./components/header/Header";
import Footer from "./components/footer/Footer";
import { HeadProvider } from "react-head";
import Loader from "./components/loader/Loader";
import ErrorBoundary from "./components/error/error";
import { Slide, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AboutUs from "./pages/aboutUs/AboutUs";
import AnalisisPage from "./pages/analisis/AnalisisPage";

function TransitionLink({ to, children, ...props }) {
  const navigate = useNavigate();

  const handleClick = (event) => {
    event.preventDefault();
    if (document.startViewTransition) {
      document.startViewTransition(() => {
        navigate(to);
      });
    } else {
      navigate(to);
    }
  };

  return (
    <a href={to} onClick={handleClick} {...props}>
      {children}
    </a>
  );
}

function AnimatedRoutes() {
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [prevPath, setPrevPath] = useState(location.pathname);

  useEffect(() => {
    if (location.pathname !== prevPath) {
      setLoading(true);
      const timer = setTimeout(() => {
        setLoading(false);
        setPrevPath(location.pathname);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [location.pathname, prevPath]);

  return (
    <>
      {loading && <Loader />}
      {renderRoutes(location)} {/* Call the function to render routes */}
    </>
  );
}

const Layout = () => {
  return (
    <div>
      <Header />
      <Outlet />
      <Footer />
    </div>
  );
};

// Function to render routes based on the current location
function renderRoutes(location) {
  return (
    <Routes location={location} key={location.pathname}>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="about-us" element={<AboutUs />} />
        <Route path="analisis" element={<AnalisisPage />} />
      </Route>
      {/* login dan Register  */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/otp" element={<OtpPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

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
          <AnimatedRoutes />
        </ErrorBoundary>
      </Router>
    </HeadProvider>
  );
}

export { TransitionLink };
export default App;
