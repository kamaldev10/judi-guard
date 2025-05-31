// src/context/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from "react";
import { getCurrentUserApi } from "../services/api"; // API call untuk verifikasi token

export const AuthContext = createContext(null);

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [authToken, setAuthToken] = useState(
    localStorage.getItem("judiGuardToken") || null
  );
  const [isLoadingAuth, setIsLoadingAuth] = useState(true); // Status loading untuk pengecekan token awal

  useEffect(() => {
    const verifyTokenAndFetchUser = async () => {
      const storedToken = localStorage.getItem("judiGuardToken");
      if (storedToken) {
        setAuthToken(storedToken); // Set token ke state agar interceptor bisa langsung pakai jika ada race condition
        try {
          // Panggil backend untuk verifikasi token dan dapatkan data user
          const response = await getCurrentUserApi(); // apiClient sudah otomatis pakai token dari localStorage via interceptor
          setCurrentUser(response.data.user);
        } catch (error) {
          console.warn(
            "Token tidak valid atau sesi kedaluwarsa, menghapus token..."
          );
          localStorage.removeItem("judiGuardToken");
          localStorage.removeItem("judiGuardUser");
          setAuthToken(null);
          setCurrentUser(null);
        }
      }
      setIsLoadingAuth(false);
    };

    verifyTokenAndFetchUser();
  }, []);

  const login = (userData, token) => {
    localStorage.setItem("judiGuardToken", token);
    localStorage.setItem("judiGuardUser", JSON.stringify(userData)); // Simpan data user juga
    setAuthToken(token);
    setCurrentUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("judiGuardToken");
    localStorage.removeItem("judiGuardUser");
    setAuthToken(null);
    setCurrentUser(null);
  };

  const value = {
    currentUser,
    authToken,
    isAuthenticated: !!authToken,
    isLoadingAuth,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!isLoadingAuth && children}{" "}
    </AuthContext.Provider>
  );
};
