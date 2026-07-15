import { useEffect } from 'react';
import { Outlet, useSearchParams, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import DashboardSidebar from './DashboardSidebar';
import DashboardHeader from './DashboardHeader';
import { profileKeys } from '@/modules/profile';
import { toast } from 'sonner';
import ScrollToTop from '@/shared/components/ui/ScrollToTop';

export default function DashboardLayout() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    const status = searchParams.get('status');
    const linked = searchParams.get('youtube_linked');

    if (status === 'connected' || linked === 'true') {
      queryClient.invalidateQueries({ queryKey: profileKeys.user() });
      queryClient.invalidateQueries({ queryKey: profileKeys.youtubeChannel() });
      toast.success('Akun YouTube berhasil terhubung!');
      navigate('/dashboard', { replace: true });
    }

    if (searchParams.get('error') || searchParams.get('status') === 'error') {
      toast.error('Gagal menghubungkan YouTube.');
      navigate('/dashboard', { replace: true });
    }
  }, [searchParams, navigate, queryClient]);

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
