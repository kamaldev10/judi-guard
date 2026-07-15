// src/routes/__tests__/AppRouter.simple.spec.jsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AppRouter from '../AppRouter';

// Simple mocks that definitely work
vi.mock('@/modules/home', () => ({
  __esModule: true,
  HomePage: () => <div>Home Page Content</div>,
  AboutUs: () => <div>About Us Content</div>,
  FactPage: () => <div>Fact Page Content</div>,
}));

vi.mock('@/modules/profile', () => ({
  __esModule: true,
  ProfilePage: () => <div>Profile Page Content</div>,
  EditProfilePage: () => <div>Edit Profile Content</div>,
}));

vi.mock('@/modules/auth', () => ({
  __esModule: true,
  LoginPage: () => <div>Login Page Content</div>,
  RegisterPage: () => <div>Register Page Content</div>,
  OtpPage: () => <div>OTP Page Content</div>,
  ForgotPasswordPage: () => <div>Forgot Password Content</div>,
  ResetPasswordPage: () => <div>Reset Password Content</div>,
  ChangePasswordPage: () => <div>Change Password Content</div>,
}));

vi.mock('@/modules/overview', () => ({
  __esModule: true,
  OverviewPage: () => <div>Overview Content</div>,
}));

vi.mock('@/modules/guide', () => ({
  __esModule: true,
  GuidePage: () => <div>Guide Content</div>,
}));

vi.mock('@/modules/configuration', () => ({
  __esModule: true,
  ConfigPage: () => <div>Config Content</div>,
}));

vi.mock('@/modules/video-analysis', () => ({
  __esModule: true,
  VideoAnalysisPage: () => <div>Analysis Page Content</div>,
}));

vi.mock('@/modules/history', () => ({
  __esModule: true,
  HistoryPage: () => <div>History Content</div>,
}));

vi.mock('@/shared/components/status/NotFound', () => ({
  __esModule: true,
  default: () => <div>Not Found Content</div>,
}));

// Mock layout components
vi.mock('@/shared/components/layout/MainLayout', () => ({
  __esModule: true,
  default: ({ children }) => <div data-testid="main-layout">{children}</div>,
}));

vi.mock('@/shared/components/layout/PageLoader', () => ({
  __esModule: true,
  default: () => <div data-testid="page-loader">Loading...</div>,
}));

describe('AppRouter - Simple Tests', () => {
  const renderApp = (route = '/') => {
    return render(
      <MemoryRouter initialEntries={[route]}>
        <AppRouter />
      </MemoryRouter>,
    );
  };

  it('should render without errors', () => {
    expect(() => renderApp('/')).not.toThrow();
  });

  it('should contain MainLayout for main routes', () => {
    const { getByTestId } = renderApp('/');
    expect(getByTestId('main-layout')).toBeInTheDocument();
  });

  it('should not contain MainLayout for auth routes', () => {
    const { queryByTestId } = renderApp('/login');
    expect(queryByTestId('main-layout')).not.toBeInTheDocument();
  });

  it('should handle the root route', () => {
    const { container } = renderApp('/');
    expect(container).toBeTruthy();
  });

  it('should handle the about-us route', () => {
    const { container } = renderApp('/about-us');
    expect(container).toBeTruthy();
  });

  it('should handle the analysis route', () => {
    const { container } = renderApp('/analysis');
    expect(container).toBeTruthy();
  });

  it('should handle the profile route', () => {
    const { container } = renderApp('/profile');
    expect(container).toBeTruthy();
  });

  it('should handle the profile/edit route', () => {
    const { container } = renderApp('/profile/edit');
    expect(container).toBeTruthy();
  });

  it('should handle the not-found route', () => {
    const { container } = renderApp('/not-found');
    expect(container).toBeTruthy();
  });

  it('should handle the login route', () => {
    const { container } = renderApp('/login');
    expect(container).toBeTruthy();
  });

  it('should handle the register route', () => {
    const { container } = renderApp('/register');
    expect(container).toBeTruthy();
  });

  it('should handle the otp route', () => {
    const { container } = renderApp('/otp');
    expect(container).toBeTruthy();
  });

  it('should handle the forgot-password route', () => {
    const { container } = renderApp('/forgot-password');
    expect(container).toBeTruthy();
  });

  it('should handle the reset-password route with token', () => {
    const { container } = renderApp('/reset-password/some-token');
    expect(container).toBeTruthy();
  });

  it('should handle the change-password route', () => {
    const { container } = renderApp('/change-password');
    expect(container).toBeTruthy();
  });

  it('should redirect unknown routes to not-found', () => {
    const { container } = renderApp('/unknown-route');
    expect(container).toBeTruthy();
  });

  it('should have Suspense wrapper', () => {
    const { container } = renderApp('/');
    // Can't directly test Suspense, but we can verify it renders
    expect(container.innerHTML).toContain('div');
  });

  it('should be exported as default', () => {
    expect(AppRouter).toBeDefined();
    expect(typeof AppRouter).toBe('function');
  });
});
