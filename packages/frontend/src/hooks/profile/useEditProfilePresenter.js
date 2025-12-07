import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { useUserStore } from "@/stores/userStore";

export const useEditProfilePresenter = () => {
  const { getCurrentUser, updateProfile, isLoadingUser, error } =
    useUserStore();
  const navigate = useNavigate();

  const [initialData, setInitialData] = useState({}); // Data awal untuk perbandingan
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    // Tambahkan field lain di sini jika backend mengizinkan, e.g., bio: ''
  });

  const [isLoading, setIsLoading] = useState(true); // Loading data awal
  const [isSaving, setIsSaving] = useState(false); // Loading saat proses simpan
  const [fetchError, setFetchError] = useState(null);

  // 🔹 Fetch user saat komponen pertama kali di-mount
  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      setFetchError(null);
      try {
        const response = await getCurrentUser();
        if (response.status === "success" && response.data.user) {
          const { username, email } = response.data.user; // Ambil field relevan
          const relevantData = { username, email };
          setFormData(relevantData);
          setInitialData(relevantData);
        } else {
          setFetchError(
            new Error(response.message || "Gagal mengambil data pengguna.")
          );
        }
      } catch (error) {
        setFetchError(
          new Error(
            error.message || "Terjadi kesalahan saat mengambil data pengguna."
          )
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [getCurrentUser]);

  // 🔹 Handle perubahan input
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  // 🔹 Handle submit
  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();
      setIsSaving(true);

      // Cari data yang berubah
      const changedData = {};
      let hasChanges = false;
      for (const key in formData) {
        if (formData[key] !== initialData[key]) {
          changedData[key] = formData[key];
          hasChanges = true;
        }
      }

      if (!hasChanges) {
        setIsSaving(false);
        Swal.fire({
          title: "Tidak Ada Perubahan",
          text: "Anda tidak melakukan perubahan apapun pada data profil.",
          icon: "info",
          confirmButtonText: "OK",
          customClass: { popup: "rounded-xl shadow-lg text-sm" },
        });
        return;
      }

      Swal.fire({
        title: "Menyimpan Perubahan...",
        text: "Mohon tunggu sebentar.",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
        customClass: { popup: "rounded-xl shadow-lg text-sm" },
      });

      try {
        const response = await updateProfile(changedData);
        setIsSaving(false);
        Swal.close();

        if (response.status === "success") {
          await Swal.fire({
            title: "Profil Diperbarui!",
            text: "Data profil Anda telah berhasil diperbarui.",
            icon: "success",
            confirmButtonText: "OK",
            customClass: { popup: "rounded-xl shadow-lg text-sm" },
          });
          setInitialData(formData);
          setTimeout(() => {
            navigate("/profile");
          }, 2000);
        } else {
          Swal.fire(
            "Gagal!",
            response.message || "Gagal memperbarui profil.",
            "error",
            { customClass: { popup: "rounded-xl shadow-lg text-sm" } }
          );
        }
      } catch (error) {
        setIsSaving(false);
        Swal.close();
        Swal.fire({
          title: "Gagal Memperbarui!",
          text: error.message || "Terjadi kesalahan. Silakan coba lagi.",
          icon: "error",
          confirmButtonText: "OK",
          customClass: { popup: "rounded-xl shadow-lg text-sm" },
        });
      }
    },
    [formData, initialData, navigate, updateProfile]
  );

  // 🔹 Handle cancel
  const handleCancel = useCallback(() => {
    navigate("/profile");
  }, [navigate]);

  return {
    formData,
    isLoading: isLoading || isLoadingUser,
    isSaving,
    fetchError: fetchError || error,
    initialData,
    handleInputChange,
    handleSubmit,
    handleCancel,
  };
};
