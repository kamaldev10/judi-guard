import { useState, useEffect } from "react";
import AuthContext from "./AuthProvider";
import { getToken, setToken, removeToken } from "../utils/auth";

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const login = async (credentials) => {
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });
    const data = await res.json();

    if (data.token) {
      setToken(data.token);
      setUser(data.user); // Simpan info user jika tersedia
    }
  };

  const register = async (userData) => {
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });
    const data = await res.json();

    if (data.token) {
      setToken(data.token);
      setUser(data.user);
    }
  };

  const logout = () => {
    removeToken();
    setUser(null);
  };

  useEffect(() => {
    const token = getToken();
    if (token) {
      setUser({ name: "Guest" }); // contoh
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
