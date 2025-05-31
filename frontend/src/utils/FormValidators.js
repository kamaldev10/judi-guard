// src/utils/formValidators.js

export const validateUserName = (userName) => {
  if (!userName.trim()) return "Username tidak boleh kosong.";
  if (userName.trim().length < 3) return "Username minimal 3 karakter.";
  if (userName.trim().length > 30) return "Username maksimal 30 karakter.";
  const userNameRegex = /^[a-zA-Z0-9_-]+$/;
  if (!userNameRegex.test(userName)) {
    return "Username hanya boleh berisi huruf, angka, underscore (_), atau strip (-).";
  }
  return "";
};

export const validateEmail = (email) => {
  if (!email.trim()) return "Email tidak boleh kosong.";
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return "Format email tidak valid.";
  return "";
};

// Validasi password untuk REGISTRASI (aturan ketat)
export const validateRegistrationPassword = (password) => {
  const minLength = 6; // Sesuaikan dengan backend Anda
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  // const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(password); // Opsional

  if (!password) return "Password tidak boleh kosong.";
  if (password.length < minLength) {
    return `Password minimal ${minLength} karakter.`;
  }
  if (!hasUpperCase) {
    return "Password harus mengandung setidaknya satu huruf kapital.";
  }
  if (!hasLowerCase) {
    return "Password harus mengandung setidaknya satu huruf kecil.";
  }
  if (!hasNumbers) {
    return "Password harus mengandung setidaknya satu angka.";
  }
  // if (!hasSpecialChars) {
  //   return "Password harus mengandung setidaknya satu karakter spesial.";
  // }
  return "";
};

// Validasi password untuk LOGIN (hanya cek apakah diisi)
export const validateLoginPassword = (password) => {
  if (!password.trim()) return "Password tidak boleh kosong."; // Cukup cek ini
  return "";
};
