import { useMutation } from '@tanstack/react-query';
import * as homeApi from '../services/home.api.js';

export const usePredictTextMutation = () => {
  return useMutation({
    mutationFn: homeApi.predictText,
  });
};
