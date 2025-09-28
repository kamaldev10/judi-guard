// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import "./style.css";
import App from "./App";
import { BrowserRouter as Router } from "react-router-dom";
import { ThemeProvider } from "./components/ThemeProvider";

const googleClientId = import.meta.env.VITE_GOOGLE_SIGNIN_CLIENT_ID;

if (!googleClientId) {
  console.error(
    "Error: VITE_GOOGLE_SIGNIN_CLIENT_ID tidak terdefinisi. Fitur Google Sign-In tidak akan berfungsi."
  );
}

const rootElement = document.getElementById("root");

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <ThemeProvider>
        <Router>
          {googleClientId ? (
            <GoogleOAuthProvider clientId={googleClientId}>
              <App />
            </GoogleOAuthProvider>
          ) : (
            <div>
              Konfigurasi Google Sign-In belum lengkap. Harap hubungi
              administrator.
              <App />
            </div>
          )}
        </Router>
      </ThemeProvider>
    </React.StrictMode>
  );
} else {
  console.error('Root element with id "root" not found.');
}
