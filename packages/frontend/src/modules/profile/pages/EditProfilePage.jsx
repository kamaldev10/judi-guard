import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserProfileQuery, useUpdateProfileMutation } from '../hooks/useProfileQueries.js';
import EditProfileForm from '../components/EditProfileForm.jsx';
import { Loader2, AlertTriangle } from 'lucide-react';
import Swal from 'sweetalert2';
import { toast } from 'sonner';

export default function EditProfilePage() {
  const { data: user, isLoading, error } = useUserProfileQuery();
  const updateMutation = useUpdateProfileMutation();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
  });

  const [initialData, setInitialData] = useState({
    username: '',
    email: '',
  });

  useEffect(() => {
    if (user) {
      const data = {
        username: user.username || '',
        email: user.email || '',
      };
      setFormData(data);
      setInitialData(data);
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const hasChanges = formData.username !== initialData.username;
    if (!hasChanges) {
      Swal.fire({
        title: 'Tidak Ada Perubahan',
        text: 'Anda tidak melakukan perubahan apapun pada data profil.',
        icon: 'info',
        confirmButtonText: 'OK',
        customClass: { popup: 'rounded-xl shadow-lg text-sm' },
      });
      return;
    }

    try {
      await updateMutation.mutateAsync({ username: formData.username });
      toast.success('Profil berhasil diperbarui!');
      navigate('/dashboard/profile');
    } catch (err) {
      toast.error(err.message || 'Terjadi kesalahan saat menyimpan perubahan.');
    }
  };

  const handleCancel = () => {
    navigate('/dashboard/profile');
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Loader2 size={48} className="text-sky-600 animate-spin" />
        <p className="mt-3 text-sky-700 dark:text-sky-400 font-medium">Memuat data profil...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center" role="alert">
        <AlertTriangle size={48} className="text-red-500 mb-4" />
        <h2 className="text-xl font-semibold text-red-600 mb-2">Gagal Memuat Data</h2>
        <p className="text-slate-700 dark:text-gray-300 max-w-md">
          {error.message || 'Gagal mengambil data profil Anda.'}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-10">
      <EditProfileForm
        formData={formData}
        isSaving={updateMutation.isPending}
        onSubmit={handleSubmit}
        onInputChange={handleInputChange}
        onCancel={handleCancel}
      />
    </div>
  );
}
