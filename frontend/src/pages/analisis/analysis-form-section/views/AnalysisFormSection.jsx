// src/features/video-analysis/views/AnalysisFormSection.jsx
import React from "react";
import { motion } from "framer-motion";
import { useVideoAnalysis } from "../../../../hooks/videoAnalysis/useVideoAnalysis";

import AnalysisSubmitForm from "./components/AnalysisSubmitForm";
import AnalysisResultHeader from "./components/AnalysisResultHeader";
import AnalysisSummary from "./components/AnalysisSummary";
import CommentList from "./components/CommentList";

/**
 * Komponen induk untuk halaman analisis video.
 * Mengatur tata letak dan menyatukan semua komponen anak,
 * dengan semua logika dikelola oleh custom hook `useVideoAnalysis`.
 */
const AnalysisFormSection = () => {
  const {
    videoUrl,
    setVideoUrl,
    isLoading,
    isAnalyzing,
    isDeleting,
    analysisId,
    videoAnalysisData,
    analyzedComments,
    pieChartData,
    stats,
    pollingMessage,
    handleSubmitAnalysis,
    handleManageComments,
  } = useVideoAnalysis();

  const isActionInProgress = isLoading || isAnalyzing || isDeleting;

  return (
    <div className="container mx-auto px-2 py-4 md:px-4 md:py-8">
      <motion.div
        id="analysis-feature-wrapper"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="space-y-8 md:space-y-12"
      >
        <AnalysisSubmitForm
          videoUrl={videoUrl}
          setVideoUrl={setVideoUrl}
          onSubmit={handleSubmitAnalysis}
          isActionInProgress={isActionInProgress}
          loadingMessage={
            isAnalyzing
              ? pollingMessage || "Sedang menganalisis video..."
              : null
          }
        />

        {analysisId && videoAnalysisData && (
          <motion.section
            id="analysis-result"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="bg-sky-50/70 rounded-2xl p-6 md:p-8 shadow-xl border border-gray-200 mt-8 max-w-5xl mx-auto"
          >
            <AnalysisResultHeader
              analysisId={analysisId}
              videoData={videoAnalysisData}
              pollingMessage={pollingMessage}
            />

            {videoAnalysisData.status === "COMPLETED" &&
              analyzedComments.length > 0 && (
                <AnalysisSummary
                  pieChartData={pieChartData}
                  stats={stats}
                  onManageComments={handleManageComments}
                  isActionInProgress={isActionInProgress}
                />
              )}

            <CommentList
              comments={analyzedComments}
              // onDeleteSingle={handleDeleteSingleComment}
              isActionInProgress={isActionInProgress}
              isLoadingInitial={
                isLoading && analyzedComments.length === 0 && !isAnalyzing
              }
            />
          </motion.section>
        )}
      </motion.div>
    </div>
  );
};

export default AnalysisFormSection;
