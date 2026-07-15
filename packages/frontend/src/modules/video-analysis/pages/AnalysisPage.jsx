import React, { useEffect } from 'react';
import { useAnalysisUiStore } from '../stores/analysis-ui.store.js';
import AnalysisSelection from '../components/AnalysisSelection.jsx';
import AnalysisPreview from '../components/AnalysisPreview.jsx';
import AnalysisScanning from '../components/AnalysisScanning.jsx';
import AnalysisResults from '../components/AnalysisResults.jsx';

export default function AnalysisPage() {
  const step = useAnalysisUiStore((state) => state.step);
  const reset = useAnalysisUiStore((state) => state.reset);

  useEffect(() => {
    return () => {
      reset();
    };
  }, [reset]);

  return (
    <div className="h-full w-full animate-in fade-in duration-300">
      {step === 'SELECTION' && <AnalysisSelection />}
      {step === 'PREVIEW' && <AnalysisPreview />}
      {step === 'SCANNING' && <AnalysisScanning />}
      {step === 'RESULTS' && <AnalysisResults />}
    </div>
  );
}
