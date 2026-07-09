import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const MOCK_API_URL = 'https://api.test.com';
const MOCK_TOKEN = 'my-secret-token-123';

// 1. Stub (mock) environment variable BEFORE import
vi.stubEnv('VITE_API_URL', MOCK_API_URL);

// 2. Mock global localStorage
const createMockLocalStorage = () => {
  let storage = {};
  return {
    getItem: (key) => storage[key] || null,
    setItem: (key, value) => (storage[key] = String(value)),
    removeItem: (key) => delete storage[key],
    clear: () => (storage = {}),
  };
};

vi.stubGlobal('localStorage', createMockLocalStorage());

// 3. Import the module to be tested AFTER mocks are set up
// We use dynamic import() and reset modules to ensure
// apiClient is created USING the mocked env var.
let apiClient;

beforeEach(async () => {
  // Reset modules every test to ensure a new apiClient is created
  vi.resetModules();
  // Clear localStorage
  localStorage.clear();

  // Dynamically import the module
  const module = await import('../apiClient'); // <-- Adjust your import path
  apiClient = module.apiClient;
});

afterEach(() => {
  // Clean up stubs
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe('apiClient (Axios Instance) Unit Testing', () => {
  it('should be created with the correct baseURL and default headers', () => {
    // Test 1: Verify basic configuration
    expect(apiClient.defaults.baseURL).toBe(MOCK_API_URL);
    expect(apiClient.defaults.headers['Content-Type']).toBe('application/json');
  });

  it('should add Authorization header if token exists in localStorage', async () => {
    // Test 2: Request interceptor (Success Case)

    // Set token in localStorage
    localStorage.setItem('judiGuardToken', MOCK_TOKEN);

    // Get the request interceptor function
    const requestInterceptor = apiClient.interceptors.request.handlers[0].fulfilled;

    const config = { headers: {} };
    const newConfig = await requestInterceptor(config);

    // Verify header is added
    expect(newConfig.headers['Authorization']).toBe(`Bearer ${MOCK_TOKEN}`);
  });

  it('should NOT add Authorization header if token does not exist', async () => {
    // Test 3: Request interceptor (No Token Case)

    // Ensure no token exists
    localStorage.removeItem('judiGuardToken');

    const requestInterceptor = apiClient.interceptors.request.handlers[0].fulfilled;

    const config = { headers: {} };
    const newConfig = await requestInterceptor(config);

    // Verify header is NOT added
    expect(newConfig.headers['Authorization']).toBeUndefined();
  });

  it('should pass through the response interceptor on success', () => {
    // Test 4: Response interceptor (Success)
    const responseInterceptor = apiClient.interceptors.response.handlers[0].fulfilled;
    const mockResponse = { data: 'this is success' };

    expect(responseInterceptor(mockResponse)).toBe(mockResponse);
  });

  it('should reject the error on the response interceptor on failure', async () => {
    // Test 5: Response interceptor (Failure)
    const responseInterceptor = apiClient.interceptors.response.handlers[0].rejected;
    const mockError = new Error('Request Failed');

    // Verify that the promise is rejected with the same error
    await expect(responseInterceptor(mockError)).rejects.toThrow(mockError);
  });
});
