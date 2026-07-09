import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useTextPredictStore } from '../textPredictStore';
import { predictTextApi } from '@/lib/services/predictTextApi';

// --- 1. Mock External Dependencies ---

// Mock the API service module
vi.mock('@/lib/services/predictTextApi', () => ({
  predictTextApi: vi.fn(),
}));

// --- Test Suite ---
describe('Text Predict Store Unit Testing', () => {
  // 2. Reset store state and mock history before each test
  beforeEach(() => {
    // Reset Zustand store state to its initial values
    // We can't use clear() as it doesn't reset isLoading
    useTextPredictStore.setState({
      prediction: null,
      isLoading: false,
      error: null,
    });
    // Clear call history for all mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // --- Test 1: clear action ---
  describe('clear', () => {
    it('should reset prediction and error to null', () => {
      // Arrange: Set some dummy state
      useTextPredictStore.setState({
        prediction: { classification: 'JUDI' },
        error: 'Some error',
        isLoading: true, // clear() doesn't reset isLoading
      });

      // Act
      useTextPredictStore.getState().clear();

      // Assert
      const state = useTextPredictStore.getState();
      expect(state.prediction).toBeNull();
      expect(state.error).toBeNull();
      expect(state.isLoading).toBe(true); // Verify isLoading is NOT reset by clear()
    });
  });

  // --- Test 2: analyze action ---
  describe('analyze', () => {
    const testText = 'Check this sample text';
    const mockResponse = { data: { classification: 'JUDI', score: 0.99 } };

    it('should set loading, call API, and set prediction on success', async () => {
      // Arrange
      predictTextApi.mockResolvedValue(mockResponse);
      const store = useTextPredictStore.getState();

      // Act
      const promise = store.analyze(testText);

      // Assert: Check loading state immediately
      expect(useTextPredictStore.getState().isLoading).toBe(true);
      expect(useTextPredictStore.getState().error).toBeNull();
      expect(useTextPredictStore.getState().prediction).toBeNull();

      // Wait for the action to complete
      await promise;

      // Assert: Check final state
      const state = useTextPredictStore.getState();
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
      expect(state.prediction).toEqual(mockResponse.data); // It sets response.data

      // Verify API call
      expect(predictTextApi).toHaveBeenCalledTimes(1);
      expect(predictTextApi).toHaveBeenCalledWith(testText);
    });

    it('should set loading, call API, and set error on failure', async () => {
      // Arrange
      const mockError = new Error('API failed');
      predictTextApi.mockRejectedValue(mockError);
      const store = useTextPredictStore.getState();

      // Act
      const promise = store.analyze(testText);

      // Assert: Check loading state immediately
      expect(useTextPredictStore.getState().isLoading).toBe(true);

      // Wait for the action to complete (it's caught inside the store)
      await promise;

      // Assert: Check final state
      const state = useTextPredictStore.getState();
      expect(state.isLoading).toBe(false);
      expect(state.prediction).toBeNull();
      expect(state.error).toBe('Gagal terhubung ke model AI.'); // The specific error message from the store

      // Verify API call
      expect(predictTextApi).toHaveBeenCalledTimes(1);
      expect(predictTextApi).toHaveBeenCalledWith(testText);
    });
  });
});
