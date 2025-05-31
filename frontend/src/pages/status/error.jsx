import React, { Component } from "react";
// Pastikan path impor gambar ini benar sesuai struktur folder Anda
import ErrorImage from "../../assets/images/error.jpg";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="flex flex-col items-center justify-center min-h-screen p-4 text-center backdrop-blur-sm bg-white "
          role="alert"
          aria-live="assertive"
        >
          <div className=" backdrop-blur-lg p-6 sm:p-10 md:max-w-1/2 sm:max-w-lg w-full ">
            <img
              src={ErrorImage}
              alt="Ilustrasi Terjadi Kesalahan"
              className="mx-auto mb-6 w-full h-52 sm:w-40 sm:h-40 md:w-64 md:h-64 object-contain "
            />
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">
              Oops! Ada Sesuatu yang Salah 😟
            </h1>
            <p className="text-slate-900 text-sm sm:text-base mb-8">
              Kami mohon maaf, terjadi kesalahan yang tidak terduga pada
              aplikasi. Tim kami telah diberitahu. Silakan coba muat ulang
              halaman ini atau kembali lagi nanti.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-8 py-3 bg-sky-600 text-white font-semibold rounded-2xl hover:bg-sky-800 active:bg-sky-900 transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-70 shadow-lg hover:shadow-xl transform active:scale-95"
            >
              Muat Ulang Halaman
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
