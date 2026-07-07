import { useEffect } from "react";
import { Outlet, useSearchParams, useNavigate } from "react-router-dom"; // Import useSearchParams
import DashboardSidebar from "./DashboardSidebar";
import DashboardHeader from "./DashboardHeader";
import { useAuthStore } from "@/stores/authStore";
import { useYoutubeStore } from "@/stores/youtubeStore";
import { toast } from "sonner"; // Optional: Untuk notifikasi
import ScrollToTop from "@/components/ui/ScrollToTop";

export default function DashboardLayout() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const refreshUserProfile = useAuthStore((state) => state.refreshUserProfile);
  const fetchChannelProfile = useYoutubeStore(
    (state) => state.fetchChannelProfile,
  );

  // --- LOGIC DETEKSI CALLBACK YOUTUBE ---
  useEffect(() => {
    const status = searchParams.get("status");
    const linked = searchParams.get("youtube_linked");

    // Jika ada tanda sukses dari backend (misal: ?status=connected)
    if (status === "connected" || linked === "true") {
      // 1. Refresh Data User (AuthStore) agar isYoutubeConnected = true
      refreshUserProfile().then(() => {
        toast.success("Akun YouTube berhasil terhubung!");
      });

      // 2. Fetch Profil Channel (YoutubeStore) agar avatar muncul di header
      fetchChannelProfile(true); // true = force refresh

      // 3. Bersihkan URL (Hapus query param agar bersih)
      navigate("/dashboard", { replace: true });
    }

    // Handle Error jika ada
    if (searchParams.get("error") || searchParams.get("status") === "error") {
      toast.error("Gagal menghubungkan YouTube.");
      navigate("/dashboard", { replace: true });
    }
  }, [searchParams, navigate, refreshUserProfile, fetchChannelProfile]);

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <DashboardSidebar />
      <div className="flex flex-1 flex-col">
        <DashboardHeader />
        <main className="flex-1 overflow-y-auto p-6 md:p-10">
          <Outlet />
        </main>
      </div>
      <ScrollToTop />
    </div>
  );
}
