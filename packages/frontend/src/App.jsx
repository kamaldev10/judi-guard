import React, { useEffect } from 'react';
import { HeadProvider } from 'react-head';
import { Slide, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Toaster } from '@/shared/components/ui/sonner';
import { useAuthUiStore } from '@/modules/auth';

import AppErrorBoundary from '@/shared/components/error-boundary/AppErrorBoundary';
import AppRouter from '@/routes/AppRouter';

function App() {
  const getSession = useAuthUiStore((state) => state.getSession);

  useEffect(() => {
    getSession();
  }, [getSession]);

  return (
    <HeadProvider>
      <ToastContainer
        position="bottom-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
        transition={Slide}
      />
      <Toaster />
      <AppErrorBoundary>
        <AppRouter />
      </AppErrorBoundary>
    </HeadProvider>
  );
}

export default App;
