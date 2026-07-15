/**
 * Email templates for auth flows.
 * Named exports are best practice (tree-shakeable, explicit, IDE-friendly).
 * Each template returns { subject, text, html }.
 */

function buildHtmlWrapper(bodyContent, { title = 'Judi Guard' } = {}) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f6f9;font-family:'Segoe UI',Arial,sans-serif">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f9">
    <tr>
      <td align="center" style="padding:30px 15px">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08)">
          <!-- header -->
          <tr>
            <td style="background:linear-gradient(135deg,#1a1a2e 0%,#16213e 100%);padding:32px 40px;text-align:center">
              <h1 style="margin:0;color:#e94560;font-size:22px;font-weight:700;letter-spacing:1px">JUDI GUARD</h1>
              <p style="margin:6px 0 0;color:#a0aec0;font-size:13px">Say Goodbye to Spam Judi with Judi Guard</p>
            </td>
          </tr>
          <!-- body -->
          <tr>
            <td style="padding:40px 40px 32px;color:#2d3748;font-size:15px;line-height:1.7">
              ${bodyContent}
            </td>
          </tr>
          <!-- footer -->
          <tr>
            <td style="padding:24px 40px;background-color:#f8fafc;border-top:1px solid #e2e8f0;text-align:center">
              <p style="margin:0;color:#718096;font-size:12px;line-height:1.5">
                © ${new Date().getFullYear()} Judi Guard. Semua hak dilindungi.<br>
                Email ini dikirim secara otomatis, harap tidak membalas langsung.
              </p>
            </td>
          </tr>
        </table>
        <p style="margin:16px 0 0;color:#a0aec0;font-size:11px;text-align:center">
          Jika Anda memiliki pertanyaan, hubungi Owner kami di alimusthafakamal@gmail.com
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function buildTextBody(lines) {
  return lines.join('\n\n');
}

/* ─── OTP Templates ─── */

export const otpVerification = ({ username, otp, appName = 'Judi Guard' }) => {
  const bodyLines = [
    `Halo ${username},`,
    `Terima kasih telah mendaftar di ${appName}. Silakan gunakan kode OTP di bawah ini untuk memverifikasi alamat email Anda:`,
    `━━━━━━━━━━━━━━━━━━━`,
    `    KODE OTP: ${otp}`,
    `━━━━━━━━━━━━━━━━━━━`,
    `Kode ini berlaku selama 10 menit.`,
    `Jika Anda tidak meminta kode ini, abaikan email ini.`,
    `Terima kasih,`,
    `Tim ${appName}`,
  ];
  const text = buildTextBody(bodyLines);
  const html = buildHtmlWrapper(`
    <p style="margin:0 0 16px">Halo <strong>${username}</strong>,</p>
    <p style="margin:0 0 20px">Terima kasih telah mendaftar di <strong>${appName}</strong>. Silakan gunakan kode OTP di bawah ini untuk memverifikasi alamat email Anda:</p>
    <div style="background:#f7fafc;border:2px dashed #e2e8f0;border-radius:10px;padding:24px;text-align:center;margin:0 0 20px">
      <p style="margin:0 0 4px;color:#718096;font-size:13px;text-transform:uppercase;letter-spacing:1px">Kode Verifikasi</p>
      <p style="margin:0;font-size:32px;font-weight:700;letter-spacing:8px;color:#e94560;font-family:monospace">${otp}</p>
    </div>
    <p style="margin:0 0 4px;color:#718096;font-size:13px">Kode ini berlaku selama <strong>10 menit</strong>.</p>
    <p style="margin:0 0 16px;color:#718096;font-size:13px">Jika Anda tidak meminta kode ini, abaikan email ini.</p>
    <p style="margin:0">Terima kasih,<br><strong>Tim ${appName}</strong></p>
  `);

  return { subject: 'Kode Verifikasi OTP Judi Guard Anda', text, html };
};

export const otpVerificationGoogle = ({ username, otp, appName = 'Judi Guard' }) => {
  const bodyLines = [
    `Halo ${username},`,
    `Silakan gunakan kode OTP di bawah ini untuk memverifikasi akun Judi Guard Anda yang terhubung dengan Google:`,
    `━━━━━━━━━━━━━━━━━━━`,
    `    KODE OTP: ${otp}`,
    `━━━━━━━━━━━━━━━━━━━`,
    `Kode ini berlaku selama 10 menit.`,
    `Setelah verifikasi OTP, Anda akan diminta membuat password untuk akun Anda.`,
    `Terima kasih,`,
    `Tim ${appName}`,
  ];
  const text = buildTextBody(bodyLines);
  const html = buildHtmlWrapper(`
    <p style="margin:0 0 16px">Halo <strong>${username}</strong>,</p>
    <p style="margin:0 0 20px">Silakan gunakan kode OTP di bawah ini untuk memverifikasi akun Judi Guard Anda yang terhubung dengan Google:</p>
    <div style="background:#f7fafc;border:2px dashed #e2e8f0;border-radius:10px;padding:24px;text-align:center;margin:0 0 20px">
      <p style="margin:0 0 4px;color:#718096;font-size:13px;text-transform:uppercase;letter-spacing:1px">Kode Verifikasi</p>
      <p style="margin:0;font-size:32px;font-weight:700;letter-spacing:8px;color:#e94560;font-family:monospace">${otp}</p>
    </div>
    <p style="margin:0 0 4px;color:#718096;font-size:13px">Kode ini berlaku selama <strong>10 menit</strong>.</p>
    <p style="margin:0 0 16px;color:#718096;font-size:13px">Setelah verifikasi OTP, Anda akan diminta membuat password untuk akun Anda.</p>
    <p style="margin:0">Terima kasih,<br><strong>Tim ${appName}</strong></p>
  `);

  return { subject: 'Kode Verifikasi OTP Judi Guard Anda', text, html };
};

export const otpResend = ({ username, otp, appName = 'Judi Guard' }) => {
  const bodyLines = [
    `Halo ${username},`,
    `Berikut adalah kode OTP baru Anda:`,
    `━━━━━━━━━━━━━━━━━━━`,
    `    KODE OTP: ${otp}`,
    `━━━━━━━━━━━━━━━━━━━`,
    `Kode ini berlaku selama 10 menit.`,
    `Terima kasih,`,
    `Tim ${appName}`,
  ];
  const text = buildTextBody(bodyLines);
  const html = buildHtmlWrapper(`
    <p style="margin:0 0 16px">Halo <strong>${username}</strong>,</p>
    <p style="margin:0 0 20px">Berikut adalah kode OTP baru Anda:</p>
    <div style="background:#f7fafc;border:2px dashed #e2e8f0;border-radius:10px;padding:24px;text-align:center;margin:0 0 20px">
      <p style="margin:0 0 4px;color:#718096;font-size:13px;text-transform:uppercase;letter-spacing:1px">Kode Verifikasi Baru</p>
      <p style="margin:0;font-size:32px;font-weight:700;letter-spacing:8px;color:#e94560;font-family:monospace">${otp}</p>
    </div>
    <p style="margin:0 0 16px;color:#718096;font-size:13px">Kode ini berlaku selama <strong>10 menit</strong>.</p>
    <p style="margin:0">Terima kasih,<br><strong>Tim ${appName}</strong></p>
  `);

  return { subject: 'Kode Verifikasi OTP Judi Guard Anda (Kirim Ulang)', text, html };
};

/* ─── Password Templates ─── */

export const passwordReset = ({ username, resetUrl, appName = 'Judi Guard' }) => {
  const bodyLines = [
    `Halo ${username || 'Pengguna'},`,
    `Anda (atau seseorang) telah meminta untuk mereset kata sandi untuk akun Anda di ${appName}.`,
    `Jika ini adalah Anda, silakan klik tautan di bawah ini untuk melanjutkan:`,
    `${resetUrl}`,
    `Tautan ini akan kedaluwarsa dalam 15 menit.`,
    `Jika Anda tidak meminta reset kata sandi ini, Anda bisa mengabaikan email ini dengan aman.`,
    `Terima kasih,`,
    `Tim ${appName}`,
  ];
  const text = buildTextBody(bodyLines);
  const html = buildHtmlWrapper(`
    <p style="margin:0 0 16px">Halo <strong>${username || 'Pengguna'}</strong>,</p>
    <p style="margin:0 0 20px">Anda (atau seseorang) telah meminta untuk mereset kata sandi untuk akun Anda di <strong>${appName}</strong>.</p>
    <p style="margin:0 0 20px">Jika ini adalah Anda, silakan klik tombol di bawah ini untuk melanjutkan:</p>
    <div style="text-align:center;margin:0 0 24px">
      <a href="${resetUrl}" style="display:inline-block;background:#e94560;color:#ffffff;text-decoration:none;padding:14px 36px;border-radius:8px;font-weight:600;font-size:15px">Reset Kata Sandi</a>
    </div>
    <p style="margin:0 0 4px;color:#718096;font-size:13px">Tautan ini akan kedaluwarsa dalam <strong>15 menit</strong>.</p>
    <p style="margin:0 0 16px;color:#718096;font-size:13px">Jika Anda tidak meminta reset kata sandi ini, Anda bisa mengabaikan email ini dengan aman.</p>
    <p style="margin:0">Terima kasih,<br><strong>Tim ${appName}</strong></p>
  `);

  return { subject: 'Instruksi Reset Kata Sandi Akun Anda', text, html };
};

export const passwordResetConfirmation = ({
  username,
  email,
  timestamp,
  appName = 'Judi Guard',
}) => {
  const bodyLines = [
    `Halo ${username || 'Pengguna'},`,
    `Kata sandi untuk akun ${appName} Anda (${email}) telah berhasil diubah pada ${timestamp}.`,
    `Jika Anda merasa tidak melakukan perubahan ini, segera amankan akun Anda dan hubungi tim support kami.`,
    `Terima kasih,`,
    `Tim ${appName}`,
  ];
  const text = buildTextBody(bodyLines);
  const html = buildHtmlWrapper(`
    <p style="margin:0 0 16px">Halo <strong>${username || 'Pengguna'}</strong>,</p>
    <p style="margin:0 0 20px">Kata sandi untuk akun <strong>${appName}</strong> Anda (<strong>${email}</strong>) telah berhasil diubah pada <strong>${timestamp}</strong>.</p>
    <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:16px;margin:0 0 20px">
      <p style="margin:0;color:#92400e;font-size:14px">⚠️ Jika Anda merasa tidak melakukan perubahan ini, segera amankan akun Anda dan hubungi tim support kami.</p>
    </div>
    <p style="margin:0">Terima kasih,<br><strong>Tim ${appName}</strong></p>
  `);

  return { subject: 'Konfirmasi Perubahan Kata Sandi Akun Judi Guard', text, html };
};

export const passwordChangeNotification = ({
  username,
  email,
  timestamp,
  appName = 'Judi Guard',
}) => {
  const bodyLines = [
    `Halo ${username || 'Pengguna'},`,
    `Password untuk akun ${appName} Anda (${email}) telah berhasil diubah melalui halaman profil pada ${timestamp}.`,
    `Jika Anda merasa tidak melakukan perubahan ini, segera amankan akun Anda.`,
    `Terima kasih,`,
    `Tim ${appName}`,
  ];
  const text = buildTextBody(bodyLines);
  const html = buildHtmlWrapper(`
    <p style="margin:0 0 16px">Halo <strong>${username || 'Pengguna'}</strong>,</p>
    <p style="margin:0 0 20px">Password untuk akun <strong>${appName}</strong> Anda (<strong>${email}</strong>) telah berhasil diubah melalui halaman profil pada <strong>${timestamp}</strong>.</p>
    <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:16px;margin:0 0 20px">
      <p style="margin:0;color:#92400e;font-size:14px">⚠️ Jika Anda merasa tidak melakukan perubahan ini, segera amankan akun Anda.</p>
    </div>
    <p style="margin:0">Terima kasih,<br><strong>Tim ${appName}</strong></p>
  `);

  return { subject: 'Pemberitahuan Perubahan Password Akun Judi Guard', text, html };
};
