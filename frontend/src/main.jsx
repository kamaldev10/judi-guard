// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from "./contexts/AuthContext";
import "./style.css";
import { BrowserRouter as Router } from "react-router-dom";

// Ambil Client ID dari environment variable Vite
// Pastikan Anda sudah membuat file .env di root frontend Anda
// dan menambahkan VITE_GOOGLE_SIGNIN_CLIENT_ID=CLIENT_ID_ANDA_DARI_GCP
const googleClientId = import.meta.env.VITE_GOOGLE_SIGNIN_CLIENT_ID;

if (!googleClientId) {
  console.error(
    "Error: VITE_GOOGLE_SIGNIN_CLIENT_ID tidak terdefinisi. Fitur Google Sign-In tidak akan berfungsi."
  );
  // Anda bisa menampilkan pesan error ke pengguna atau fallback
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Router>
      {googleClientId ? ( // Hanya render provider jika client ID ada
        <GoogleOAuthProvider clientId={googleClientId}>
          <AuthProvider>
            <App />
          </AuthProvider>
        </GoogleOAuthProvider>
      ) : (
        <div>
          Konfigurasi Google Sign-In belum lengkap. Harap hubungi administrator.
          <AuthProvider>
            <App />
          </AuthProvider>
        </div>
      )}
    </Router>
  </React.StrictMode>
);
