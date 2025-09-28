import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL;

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("judiGuardToken"); // Ambil token dari localStorage
    // DEBUG
    // console.log(
    //   "[API Interceptor] Attempting to get token from localStorage:",
    //   token
    // );

    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
      // DEBUG
      // console.log(
      //   "[API Interceptor] Authorization header set:",
      //   config.headers["Authorization"]
      // );
    }
    return config;
  },
  (error) => {
    // DEBUG
    console.error("[API Interceptor] Error in request interceptor:", error);
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // DEBUG
    // console.error(
    //   "[API Interceptor] Error in response for path:",
    //   error.config?.url,
    //   error.response?.status,
    //   error.response?.data
    // );

    // bisa menambahkan logika global di sini, misalnya jika error.response.status === 401,
    // panggil fungsi logout dari AuthContext atau redirect.
    // Namun, pastikan tidak tumpang tindih dengan penanganan error di komponen/hook.
    return Promise.reject(error);
  }
);
