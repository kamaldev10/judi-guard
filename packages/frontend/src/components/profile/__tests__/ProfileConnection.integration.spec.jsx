import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProfileConnection } from '../ProfileConnection';

// --- 1. Impor untuk Mocking ---
import { useProfilePresenter } from '@/hooks/profile/useProfilePresenter';
import * as FramerMotion from 'framer-motion';
import * as LucideReact from 'lucide-react';

// --- 2. Mocking Dependencies ---

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    section: React.forwardRef(({ children, ...props }, ref) => (
      <section ref={ref} {...props}>
        {children}
      </section>
    )),
    div: React.forwardRef(({ children, ...props }, ref) => (
      <div ref={ref} {...props}>
        {children}
      </div>
    )),
    p: React.forwardRef(({ children, ...props }, ref) => (
      <p ref={ref} {...props}>
        {children}
      </p>
    )),
    button: React.forwardRef(({ children, ...props }, ref) => (
      <button ref={ref} {...props}>
        {children}
      </button>
    )),
  },
}));

// Mock lucide-react icons (gunakan data-testid)
vi.mock('lucide-react', () => ({
  Link2Icon: (props) => <svg data-testid="link-2-icon" {...props} />,
  Loader2: (props) => <svg data-testid="loader-icon" {...props} />,
  Unlink: (props) => <svg data-testid="unlink-icon" {...props} />,
  RefreshCw: (props) => <svg data-testid="refresh-icon" {...props} />,
  Youtube: (props) => <svg data-testid="youtube-icon" {...props} />,
}));

// Mock the custom hook
vi.mock('@/hooks/profile/useProfilePresenter', () => ({
  useProfilePresenter: vi.fn(),
}));

// --- 3. Dapatkan Referensi ke Mock ---
/** @type {import('vitest').Mock<[], ReturnType<typeof useProfilePresenter>>} */
const mockedUseProfilePresenter = useProfilePresenter;

// --- Test Suite ---
describe('Profile Connection Integration Testing', () => {
  const user = userEvent.setup();

  // Siapkan mock handler dari hook
  const mockHandleConnect = vi.fn();
  const mockHandleDisconnect = vi.fn();

  // Siapkan state hook dasar
  const baseHookState = {
    isConnectingYouTube: false,
    isDisconnectingYouTube: false,
    youtubeStatusMessage: null,
    isYoutubeConnected: false,
    youtubeChannelInfo: null,
    isLoading: false, // Loading profil umum
    handleConnectYouTubeAccount: mockHandleConnect,
    handleDisconnectYouTubeAccount: mockHandleDisconnect,
  };

  // Helper render
  const renderConnection = (hookStateOverrides = {}) => {
    mockedUseProfilePresenter.mockReturnValue({
      ...baseHookState,
      ...hookStateOverrides,
    });

    return render(<ProfileConnection />);
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Tes 1: State Tidak Terhubung (Default)
  // describe("when disconnected", () => {
  //   it("should render the connect button and call handleConnect on click", async () => {
  //     renderConnection({ isYoutubeConnected: false });

  //     // Cek judul
  //     const heading = screen.getByRole("heading", {
  //       level: 1,
  //       name: /akun terhubung/i,
  //     });
  //     expect(heading).toBeInTheDocument();

  //     // 2. Assert the icon is *within* the heading
  //     expect(within(heading).getByTestId("link-2-icon")).toBeInTheDocument();
  //     expect(
  //       screen.getByRole("heading", { level: 2, name: /akun youtube/i })
  //     ).toBeInTheDocument();

  //     // Cek tombol "Hubungkan"
  //     const connectButton = screen.getByRole("button", {
  //       name: /hubungkan akun youtube/i,
  //     });
  //     expect(connectButton).toBeInTheDocument();
  //     expect(connectButton).toBeEnabled();
  //     expect(
  //       within(connectButton).getByTestId("link-2-icon")
  //     ).toBeInTheDocument(); // Ikon Link di tombol
  //     expect(
  //       within(connectButton).queryByTestId("loader-icon")
  //     ).not.toBeInTheDocument();

  //     // Pastikan tombol lain tidak ada
  //     expect(
  //       screen.queryByRole("button", { name: /perbarui izin/i })
  //     ).not.toBeInTheDocument();
  //     expect(
  //       screen.queryByRole("button", { name: /putuskan hubungan/i })
  //     ).not.toBeInTheDocument();
  //     // Pastikan info channel tidak ada
  //     expect(screen.queryByText(/terhubung/i)).not.toBeInTheDocument();

  //     // Aksi: Klik tombol
  //     await user.click(connectButton);

  //     // Verifikasi: handler dari hook dipanggil
  //     expect(mockHandleConnect).toHaveBeenCalledTimes(1);
  //   });
  // });

  // Tes 2: State Terhubung
  describe('when connected', () => {
    const channelInfo = { name: 'Test Channel', thumbnailUrl: 'test.png' };

    beforeEach(() => {
      renderConnection({
        isYoutubeConnected: true,
        youtubeChannelInfo: channelInfo,
      });
    });

    // it("should render channel info, update, and disconnect buttons", () => {
    //   // Cek info channel
    //   expect(screen.getByText("Test Channel")).toBeInTheDocument();
    //   expect(screen.getByText(/terhubung/i)).toBeInTheDocument();
    //   const avatar = screen.getByAltText(/thumbnail channel youtube/i);
    //   expect(avatar).toBeInTheDocument();
    //   expect(avatar).toHaveAttribute("src", channelInfo.thumbnailUrl);

    //   // Cek tombol "Perbarui Izin"
    //   const updateButton = screen.getByRole("button", {
    //     name: /perbarui izin youtube/i,
    //   });
    //   expect(updateButton).toBeInTheDocument();
    //   expect(updateButton).toBeEnabled();
    //   expect(
    //     within(updateButton).getByTestId("refresh-icon")
    //   ).toBeInTheDocument();

    //   // Cek tombol "Putuskan Hubungan"
    //   const disconnectButton = screen.getByRole("button", {
    //     name: /putuskan hubungan youtube/i,
    //   });
    //   expect(disconnectButton).toBeInTheDocument();
    //   expect(disconnectButton).toBeEnabled();
    //   expect(
    //     within(disconnectButton).getByTestId("unlink-icon")
    //   ).toBeInTheDocument();

    //   // Pastikan tombol "Hubungkan" (merah) tidak ada
    //   expect(
    //     screen.queryByRole("button", { name: /hubungkan akun youtube/i })
    //   ).not.toBeInTheDocument();
    // });

    it('should call handleConnectYouTubeAccount when update button is clicked', async () => {
      const updateButton = screen.getByRole('button', {
        name: /perbarui izin youtube/i,
      });
      await user.click(updateButton);
      expect(mockHandleConnect).toHaveBeenCalledTimes(1);
    });

    it('should call handleDisconnectYouTubeAccount when disconnect button is clicked', async () => {
      const disconnectButton = screen.getByRole('button', {
        name: /putuskan hubungan youtube/i,
      });
      await user.click(disconnectButton);
      expect(mockHandleDisconnect).toHaveBeenCalledTimes(1);
    });
  });

  // Tes 3: State Loading (Menghubungkan)
  it('should show connecting state correctly', () => {
    renderConnection({ isConnectingYouTube: true });

    // Cek tombol "Hubungkan" (merah)
    const connectButton = screen.getByRole('button', {
      name: /mengarahkan.../i,
    });
    expect(connectButton).toBeDisabled();
    expect(within(connectButton).getByTestId('loader-icon')).toBeInTheDocument();
    expect(within(connectButton).queryByTestId('link-2-icon')).not.toBeInTheDocument();

    // Cek spinner utama di header
    expect(screen.getAllByTestId('loader-icon').length).toBeGreaterThanOrEqual(2); // 1 di tombol, 1 di header
  });

  // Tes 4: State Loading (Memutuskan)
  it('should show disconnecting state correctly', () => {
    renderConnection({
      isYoutubeConnected: true, // Harus terhubung untuk bisa memutuskan
      isDisconnectingYouTube: true,
    });

    // Cek tombol "Perbarui Izin" (disabled)
    const updateButton = screen.getByRole('button', {
      name: /perbarui izin youtube/i,
    });
    expect(updateButton).toBeDisabled();

    // Cek tombol "Putuskan Hubungan"
    const disconnectButton = screen.getByRole('button', {
      name: /memutuskan.../i,
    });
    expect(disconnectButton).toBeDisabled();
    expect(within(disconnectButton).getByTestId('loader-icon')).toBeInTheDocument();
    expect(within(disconnectButton).queryByTestId('unlink-icon')).not.toBeInTheDocument();

    // Cek spinner utama di header
    expect(screen.getAllByTestId('loader-icon').length).toBeGreaterThanOrEqual(2);
  });

  // Tes 5: State Status Message
  it('should display the status message when provided', () => {
    const statusMsg = 'Berhasil terhubung!';
    renderConnection({ youtubeStatusMessage: statusMsg });

    expect(screen.getByText(statusMsg)).toBeInTheDocument();
    // Cek class (default/biru karena tidak mengandung sukses/gagal/terhubung)
    // Catatan: logika class Anda mungkin perlu disesuaikan jika "Berhasil" harusnya hijau
    expect(screen.getByText(statusMsg)).toHaveClass('bg-blue-50');
  });

  it('should display success style for success status message', () => {
    const statusMsg = 'Akun berhasil terhubung.';
    renderConnection({
      isYoutubeConnected: true,
      youtubeStatusMessage: statusMsg,
    });
    expect(screen.getByText(statusMsg)).toHaveClass('bg-green-50');
  });

  it('should display error style for error status message', () => {
    const statusMsg = 'Gagal: Token tidak valid.';
    renderConnection({ youtubeStatusMessage: statusMsg });
    expect(screen.getByText(statusMsg)).toHaveClass('bg-red-50');
  });
});
