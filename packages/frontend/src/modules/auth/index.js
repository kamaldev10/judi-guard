// Export Pages
export { default as LoginPage } from './pages/LoginPage.jsx';
export { default as RegisterPage } from './pages/RegisterPage.jsx';
export { default as OtpPage } from './pages/OtpPage.jsx';
export { default as SetPasswordPage } from './pages/SetPasswordPage.jsx';
export { default as ForgotPasswordPage } from './pages/ForgotPasswordPage.jsx';
export { default as ResetPasswordPage } from './pages/ResetPasswordPage.jsx';
export { default as ChangePasswordPage } from './pages/ChangePasswordPage.jsx';

// Export Hooks
export {
  useLoginMutation,
  useRegisterMutation,
  useGoogleSignInMutation,
  useVerifyOtpMutation,
  useResendOtpMutation,
  useSetPasswordMutation,
  useLogoutMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useChangePasswordMutation,
} from './hooks/useAuthMutations.js';

// Export UI Store
export { useAuthUiStore } from './stores/auth-ui.store.js';
