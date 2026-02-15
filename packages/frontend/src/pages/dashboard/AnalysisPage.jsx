import { useEffect } from "react";
import { useVideoAnalysisStore } from "@/stores/videoAnalysisStore";
import AnalysisSelection from "@/components/analysis-dashboard/AnalysisSelection";
import AnalysisPreview from "@/components/analysis-dashboard/AnalysisPreview";
import AnalysisScanning from "@/components/analysis-dashboard/AnalysisScanning";
import AnalysisResults from "@/components/analysis-dashboard/AnalysisResults";

export default function AnalysisPage() {
  const { step, fetchMyVideos } = useVideoAnalysisStore();

  // Load My Videos saat pertama kali masuk halaman
  useEffect(() => {
    fetchMyVideos();
  }, [fetchMyVideos]);

  return (
    <div className="h-full w-full animate-in fade-in duration-300">
      {/* SWITCH CASE untuk UI */}
      {step === "SELECTION" && <AnalysisSelection />}

      {step === "PREVIEW" && <AnalysisPreview />}

      {step === "SCANNING" && <AnalysisScanning />}

      {step === "RESULTS" && <AnalysisResults />}
    </div>
  );
}
