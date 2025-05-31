// App.js (atau src/App.jsx)
import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { HeadProvider } from "react-head";
import { Slide, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import ErrorBoundary from "./pages/status/error";
import AppRouter from "./routes/AppRouter";

function App() {
  return (
    <HeadProvider>
      <ToastContainer
        position="bottom-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
        transition={Slide}
      />
      <Router>
        <ErrorBoundary>
          <AppRouter />
        </ErrorBoundary>
      </Router>
    </HeadProvider>
  );
}

export default App;
