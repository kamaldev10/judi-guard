import { useMutation } from '@tanstack/react-query';
import * as authApi from '../services/auth.api.js';
import { useAuthUiStore } from '../stores/auth-ui.store.js';

export const useLoginMutation = () => {
  const setSession = useAuthUiStore((state) => state.setSession);

  return useMutation({
    mutationFn: authApi.loginUser,
    onSuccess: (res) => {
      const user = res?.data?.user;
      const accessToken = res?.data?.accessToken;
      const refreshToken = res?.data?.refreshToken;
      if (user && accessToken) {
        setSession(user, accessToken, refreshToken);
      }
    },
  });
};

export const useRegisterMutation = () => {
  return useMutation({
    mutationFn: authApi.registerUser,
  });
};

export const useGoogleSignInMutation = () => {
  const setSession = useAuthUiStore((state) => state.setSession);

  return useMutation({
    mutationFn: authApi.signInWithGoogle,
    // ponytail: onSuccess tidak handle routing — itu tugas komponen via mutateAsync
    onSuccess: (res) => {
      // Existing user — set session langsung
      if (res?.data?.accessToken && res?.data?.user) {
        setSession(res.data.user, res.data.accessToken, res.data.refreshToken);
      }
      // status 'otp_required' — tidak set session, biar komponen handle
    },
  });
};

export const useVerifyOtpMutation = () => {
  const setSession = useAuthUiStore((state) => state.setSession);

  return useMutation({
    mutationFn: ({ email, otpCode }) => authApi.verifyOtp(email, otpCode),
    onSuccess: (res) => {
      // Regular user — login langsung
      if (res?.data?.accessToken) {
        setSession(res.data.user, res.data.accessToken, res.data.refreshToken);
      }
    },
  });
};

export const useResendOtpMutation = () => {
  return useMutation({
    mutationFn: authApi.resendOtp,
  });
};

export const useSetPasswordMutation = () => {
  const setSession = useAuthUiStore((state) => state.setSession);

  return useMutation({
    mutationFn: ({ email, password }) => authApi.setPasswordAfterOtp(email, password),
    onSuccess: (res) => {
      const user = res?.data?.user;
      const accessToken = res?.data?.accessToken;
      if (user && accessToken) {
        setSession(user, accessToken, res?.data?.refreshToken);
      }
    },
  });
};

export const useLogoutMutation = () => {
  const clearSession = useAuthUiStore((state) => state.clearSession);

  return useMutation({
    mutationFn: () => {
      const refreshToken = localStorage.getItem('refreshToken');
      return authApi.logoutFromServer(refreshToken);
    },
    onSuccess: () => {
      clearSession();
    },
    onError: () => {
      // ponytail: tetap hapus session meski logout API gagal — user tetap logout secara lokal
      clearSession();
    },
  });
};

export const useForgotPasswordMutation = () => {
  return useMutation({
    mutationFn: authApi.forgotPassword,
  });
};

export const useResetPasswordMutation = () => {
  return useMutation({
    mutationFn: ({ token, newPassword, confirmNewPassword }) =>
      authApi.resetPassword(token, newPassword, confirmNewPassword),
  });
};

export const useChangePasswordMutation = () => {
  return useMutation({
    mutationFn: ({ currentPassword, newPassword, confirmPassword }) =>
      authApi.changePassword(currentPassword, newPassword, confirmPassword),
  });
};
