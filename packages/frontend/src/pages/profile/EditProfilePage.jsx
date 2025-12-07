import React from "react";
import { motion } from "framer-motion";
import { Loader2, AlertTriangle, ArrowLeft } from "lucide-react";
import { useEditProfilePresenter } from "@/hooks/profile/useEditProfilePresenter";
import EditProfileForm from "@/components/profile/EditProfileForm";

const EditProfilePage = () => {
  // 1. Semua logika dan state berasal dari Presenter Hook
  const {
    formData,
    isLoading, // Loading data awal
    isSaving, // Loading saat submit
    fetchError,
    handleInputChange,
    handleSubmit,
    handleCancel, // Fungsi untuk kembali dari presenter
  } = useEditProfilePresenter();

  // 2. Render state "Loading" (saat mengambil data awal)
  if (isLoading) {
    return (
      <div
        className="bg-[#d8f6ff] flex flex-col items-center justify-center text-center"
        style={{ minHeight: "calc(100vh - 4.5rem)" }}
      >
        <Loader2 size={48} className="text-sky-600 animate-spin" />
        <p className="mt-3 text-sky-700 font-medium">Memuat data profil...</p>
      </div>
    );
  }

  // 3. Render state "Error" (jika gagal mengambil data awal)
  if (fetchError) {
    return (
      <div
        className="bg-[#d8f6ff] flex items-center justify-center p-4 text-center"
        style={{ minHeight: "calc(100vh - 4.5rem)" }}
        role="alert"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-6 md:p-8 rounded-xl shadow-2xl max-w-md w-full"
        >
          <AlertTriangle size={48} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-xl md:text-2xl font-semibold text-red-600 mb-2">
            Gagal Memuat Data
          </h2>
          <p className="text-slate-700 text-sm md:text-base mb-6">
            {fetchError.message}
          </p>
          <button
            onClick={handleCancel}
            className="bg-sky-600 hover:bg-sky-700 text-white font-semibold py-2.5 px-5 rounded-lg transition-colors text-sm shadow hover:shadow-md"
          >
            <ArrowLeft size={16} className="inline mr-1.5 -mt-0.5" />
            Kembali ke Profil
          </button>
        </motion.div>
      </div>
    );
  }

  // 4. Render state "Sukses" (tampilkan form)
  return (
    <div
      className="bg-[#d8f6ff] flex flex-col items-center justify-center p-4 sm:p-6 selection:bg-sky-200 selection:text-sky-900 overflow-y-auto"
      style={{
        minHeight: "calc(100vh - 4.5rem)",
      }}
    >
      {/* Render komponen "bodoh".
        Container ini tidak tahu menahu soal <form>, <input>, dll.
        Dia hanya meneruskan state dan handler.
      */}
      <EditProfileForm
        formData={formData}
        isSaving={isSaving}
        onSubmit={handleSubmit}
        onInputChange={handleInputChange}
        onCancel={handleCancel}
      />
    </div>
  );
};

export default EditProfilePage;
