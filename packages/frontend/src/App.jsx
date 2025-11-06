import React from "react";
import { HeadProvider } from "react-head";
import { Slide, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import AppErrorBoundary from "@/components/error-boundary/AppErrorBoundary";
import AppRouter from "./routes/AppRouter";

function App() {
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
      <AppErrorBoundary>
        <AppRouter />
      </AppErrorBoundary>
    </HeadProvider>
  );
}

export default App;
