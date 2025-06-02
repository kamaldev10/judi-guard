// File: src/hooks/useUserProfilePresenter.js

import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2"; // Swal masih bisa digunakan di presenter untuk hasil aksi
import "sweetalert2/dist/sweetalert2.min.css";

import { getCurrentUserApi, deleteMyAccountApi } from "../../services/api";

export const useUserProfilePresenter = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfileData = async () => {
      setIsLoading(true);
      setFetchError(null);
      try {
        const responseData = await getCurrentUserApi();
        if (
          responseData &&
          responseData.status === "success" &&
          responseData.data &&
          responseData.data.user
        ) {
          setUser(responseData.data.user);
        } else {
          setFetchError(
            new Error(
              responseData?.message ||
                "Gagal memuat data pengguna: Format tidak valid."
            )
          );
        }
      } catch (err) {
        setFetchError(
          new Error(
            err?.message || "Terjadi kesalahan saat mengambil data profil."
          )
        );
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfileData();
  }, []);

  const handleEditProfile = useCallback(() => {
    navigate("/profile/edit");
  }, [navigate]);

  // Fungsi ini akan dipanggil oleh View SETELAH pengguna mengonfirmasi via SweetAlert di View
  const executeDeleteAccount = useCallback(async () => {
    setIsDeleting(true);
    Swal.fire({
      // Presenter menampilkan loading feedback untuk operasinya
      title: "Menghapus Akun...",
      text: "Mohon tunggu sebentar.",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
      customClass: { popup: "rounded-xl shadow-lg text-sm" },
    });

    try {
      await deleteMyAccountApi();
      // setIsDeleting(false); // Akan di-set setelah Swal success ditutup
      Swal.close();
      await Swal.fire({
        // Presenter menampilkan success feedback
        title: "Berhasil Dihapus!",
        text: "Akun Anda telah berhasil dihapus.",
        icon: "success",
        confirmButtonText: "OK",
        customClass: { popup: "rounded-xl shadow-lg text-sm" },
      });

      localStorage.removeItem("authToken");
      navigate("/login");
    } catch (err) {
      // setIsDeleting(false); // Akan di-set setelah Swal error ditutup
      Swal.close();
      Swal.fire({
        // Presenter menampilkan error feedback
        title: "Gagal!",
        text: err?.message || "Gagal menghapus akun. Silakan coba lagi.",
        icon: "error",
        confirmButtonText: "OK",
        customClass: { popup: "rounded-xl shadow-lg text-sm" },
      });
    } finally {
      setIsDeleting(false); // Pastikan isDeleting di-reset
    }
  }, [navigate]);

  return {
    user,
    isLoading,
    fetchError,
    isDeleting,
    handleEditProfile,
    executeDeleteAccount, // Ganti nama fungsi yang diexpose
  };
};
