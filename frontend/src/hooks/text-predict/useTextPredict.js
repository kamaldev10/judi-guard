import useTextPredictStore from "@/stores/textPredictStore";

/**
 * Custom hook untuk mengambil state & actions dari store textPredict.
 */
export const useTextPredict = () => {
  const { prediction, isLoading, error, analyze, clear } = useTextPredictStore(
    (state) => ({
      prediction: state.prediction,
      isLoading: state.isLoading,
      error: state.error,
      analyze: state.analyze,
      clear: state.clear,
    })
  );

  return { prediction, isLoading, error, analyze, clear };
};
