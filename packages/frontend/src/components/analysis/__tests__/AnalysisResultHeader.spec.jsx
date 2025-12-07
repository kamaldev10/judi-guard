import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import AnalysisResultHeader from "../AnalysisResultHeader";

// --- Mock Data ---

const mockAnalysisId = "xyz-789-abc";

const mockVideoDataCompleted = {
  videoTitle: "Video Keren Saya",
  youtubeVideoId: "dQw4w9WgXcQ",
  status: "COMPLETED",
  errorMessage: null,
};

const mockVideoDataProcessing = {
  videoTitle: "Video Sedang Proses",
  youtubeVideoId: "abc123efg",
  status: "PROCESSING", // Contoh status 'in-progress'
  errorMessage: null,
};

const mockVideoDataFailed = {
  videoTitle: "Video Gagal Total",
  youtubeVideoId: "fail9876",
  status: "FAILED",
  errorMessage: "Terjadi error saat transkripsi.", // Pesan error spesifik
};

const mockVideoDataErrorStatus = {
  videoTitle: "Video Status Error",
  youtubeVideoId: "err54321",
  status: "TRANSCRIPTION_ERROR", // Contoh status error lain
  errorMessage: null, // Tanpa pesan error spesifik
};

const mockVideoDataNoTitle = {
  // videoTitle: undefined, // Tidak ada judul
  youtubeVideoId: "idOnlyVideo",
  status: "COMPLETED",
  errorMessage: null,
};

// --- Test Suite ---

describe("AnalysisResultHeader Component", () => {
  // Tes 1: Render State Selesai (COMPLETED)
  it("should render correctly for COMPLETED status", () => {
    render(
      <AnalysisResultHeader
        analysisId={mockAnalysisId}
        videoData={mockVideoDataCompleted}
      />
    );

    // Cek heading utama
    expect(
      screen.getByRole("heading", { level: 2, name: /hasil analisis untuk:/i })
    ).toBeInTheDocument();
    // Cek judul video di dalam heading
    expect(
      screen.getByText(mockVideoDataCompleted.videoTitle)
    ).toBeInTheDocument();

    // Cek ID Analisis
    expect(
      screen.getByText(`ID Analisis: ${mockAnalysisId}`, { exact: false })
    ).toBeInTheDocument();

    // Cek badge status
    const statusBadge = screen.getByText(mockVideoDataCompleted.status);
    expect(statusBadge).toBeInTheDocument();
    expect(statusBadge).toHaveClass("bg-green-100", "text-green-700"); // Cek class warna hijau
    expect(statusBadge).not.toHaveClass("animate-pulse"); // Tidak ada animasi pulse

    // Pastikan pesan tambahan (error/processing) TIDAK muncul
    expect(screen.queryByText(/analisis gagal/i)).not.toBeInTheDocument();
    expect(
      screen.queryByText(/status analisis saat ini/i)
    ).not.toBeInTheDocument();
  });

  // Tes 2: Fallback ke ID Video jika Judul Tidak Ada
  it("should display youtubeVideoId if videoTitle is missing", () => {
    render(
      <AnalysisResultHeader
        analysisId={mockAnalysisId}
        videoData={mockVideoDataNoTitle} // Data tanpa judul
      />
    );
    // Cek ID video ditampilkan di heading
    expect(
      screen.getByText(mockVideoDataNoTitle.youtubeVideoId)
    ).toBeInTheDocument();
    // Pastikan tidak ada elemen dengan judul (jika judulnya null/undefined)
    // Jika judul bisa string kosong, query ini perlu disesuaikan
    expect(screen.queryByText("Video Keren Saya")).not.toBeInTheDocument(); // Contoh judul dari data lain
  });

  // Tes 3: Render State Proses (PROCESSING)
  it("should render correctly for PROCESSING status with default polling message", () => {
    render(
      <AnalysisResultHeader
        analysisId={mockAnalysisId}
        videoData={mockVideoDataProcessing}
      />
    );

    const statusBadge = screen.getByText(mockVideoDataProcessing.status, {
      selector: 'span[class*="bg-orange-100"]', // Cari span dengan class ini
    });
    expect(statusBadge).toBeInTheDocument();
    expect(statusBadge).toHaveClass(
      "bg-orange-100",
      "text-orange-700",
      "animate-pulse"
    );

    // Cek pesan tambahan processing (Query ini sudah benar karena lebih spesifik)
    expect(screen.getByText(/status analisis saat ini:/i)).toBeInTheDocument();
    expect(screen.getByText(/sedang diproses.../i)).toBeInTheDocument();
  });

  // Tes 4: Render State Proses dengan Pesan Polling Kustom - Diperbaiki
  it("should render correctly for PROCESSING status with custom polling message", () => {
    const customPollingMsg = "Menunggu antrian server...";
    render(
      <AnalysisResultHeader
        analysisId={mockAnalysisId}
        videoData={mockVideoDataProcessing}
        pollingMessage={customPollingMsg}
      />
    );
    // Cek badge status (sama seperti sebelumnya)
    const statusBadge = screen.getByText(mockVideoDataProcessing.status, {
      selector: 'span[class*="bg-orange-100"]',
    });
    expect(statusBadge).toHaveClass(
      "bg-orange-100",
      "text-orange-700",
      "animate-pulse"
    );

    // Cek pesan tambahan processing
    expect(screen.getByText(/status analisis saat ini:/i)).toBeInTheDocument();
    // 👇 Perbaiki Query Pesan Kustom: Gunakan Regex
    expect(
      screen.getByText(new RegExp(customPollingMsg, "i"))
    ).toBeInTheDocument();
    expect(screen.queryByText(/sedang diproses.../i)).not.toBeInTheDocument();
  });

  // Tes 5: Render State Gagal (FAILED dengan errorMessage)
  it("should render correctly for FAILED status with errorMessage", () => {
    render(
      <AnalysisResultHeader
        analysisId={mockAnalysisId}
        videoData={mockVideoDataFailed} // Data FAILED
      />
    );
    // Cek badge status
    const statusBadge = screen.getByText(mockVideoDataFailed.status);
    expect(statusBadge).toBeInTheDocument();
    expect(statusBadge).toHaveClass("bg-red-100", "text-red-700"); // Warna merah
    expect(statusBadge).not.toHaveClass("animate-pulse");

    // Cek pesan tambahan kegagalan
    expect(screen.getByText(/analisis gagal:/i)).toBeInTheDocument();
    expect(
      screen.getByText(mockVideoDataFailed.errorMessage)
    ).toBeInTheDocument(); // Cek pesan error spesifik
    expect(
      screen.queryByText(/status analisis saat ini/i)
    ).not.toBeInTheDocument(); // Pesan processing tidak ada
  });

  // Tes 6: Render State Error (Status mengandung ERROR, tanpa errorMessage)
  it("should render correctly for ERROR status without errorMessage", () => {
    render(
      <AnalysisResultHeader
        analysisId={mockAnalysisId}
        videoData={mockVideoDataErrorStatus}
      />
    );
    // 👇 Perbaiki Query Badge: Cari span DENGAN class spesifik
    const statusBadge = screen.getByText(mockVideoDataErrorStatus.status, {
      selector: 'span[class*="bg-red-100"]', // Cari span dengan class merah
    });
    expect(statusBadge).toBeInTheDocument();
    expect(statusBadge).toHaveClass("bg-red-100", "text-red-700");
    expect(statusBadge).not.toHaveClass("animate-pulse");

    // Cek pesan tambahan status (Query ini sudah benar)
    expect(screen.getByText(/status analisis saat ini:/i)).toBeInTheDocument();
    // Pastikan teks status muncul lagi di paragraf
    expect(screen.getByText(/sedang diproses.../i)).toBeInTheDocument();
  });
});
