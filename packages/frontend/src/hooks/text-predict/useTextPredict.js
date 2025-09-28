// hooks/text-predict/useTextPredict.js

import { useTextPredictStore } from "@/stores";

/**
 * Custom hook untuk mengambil state & actions dari store textPredict.
 */
export const useTextPredict = () => {
  const store = useTextPredictStore();
  return store;
};
