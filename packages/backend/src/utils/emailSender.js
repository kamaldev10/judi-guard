// src/utils/emailSender.js
const nodemailer = require("nodemailer");
const config = require("../config/environment"); // Untuk mengambil config email jika ada
const mailgunTransport = require("nodemailer-mailgun-transport"); // Impor Mailgun transport
const { UnauthorizedError } = require("./errors");

// Opsi untuk menggunakan Ethereal (bagus untuk development cepat tanpa setup SMTP)
const sendEmailWithEthereal = async (options) => {
  let testAccount;
  try {
    testAccount = await nodemailer.createTestAccount();
  } catch (err) {
    console.error("Gagal membuat akun Ethereal:", err.message);
    return {
      success: false,
      error: new Error("Gagal menginisialisasi Ethereal."),
    };
  }

  console.log("Ethereal test account created:");
  console.log("User:", testAccount.user);
  console.log("Pass:", testAccount.pass);

  let transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });

  const message = {
    from: process.env.EMAIL_FROM || '"Judi Guard Test" <noreply@example.com>',
    to: options.email,
    subject: options.subject,
    text: options.text,
    html: options.html,
  };

  try {
    let info = await transporter.sendMail(message);
    console.log("Message sent via Ethereal: %s", info.messageId);
    console.log("Ethereal Preview URL: %s", nodemailer.getTestMessageUrl(info));
    return { success: true, previewUrl: nodemailer.getTestMessageUrl(info) };
  } catch (error) {
    console.error("Error sending email with Ethereal:", error);
    return {
      success: false,
      error: new Error(`Ethereal failed: ${error.message}`),
    };
  }
};

// Opsi untuk menggunakan SMTP yang dikonfigurasi di .env (misal Gmail)
const sendEmailWithSmtp = async (options) => {
  if (
    !config.email?.host ||
    !config.email?.user ||
    !config.email?.pass ||
    config.email?.port === undefined
  ) {
    console.warn(
      "Konfigurasi SMTP Email tidak lengkap di .env. Menggunakan Ethereal sebagai fallback."
    );
    return sendEmailWithEthereal(options);
  }

  const transporter = nodemailer.createTransport({
    host: config.email.host,
    port: config.email.port,
    secure: config.email.secure,
    auth: {
      user: config.email.user,
      pass: config.email.pass,
    },
    tls: {
      // Hanya jika Anda mengalami masalah dengan sertifikat (misal di dev dengan self-signed)
      // rejectUnauthorized: false
    },
  });

  const message = {
    from: config.email.from || '"Judi Guard" <no-reply@judiguard.com>',
    to: options.email,
    subject: options.subject,
    text: options.text,
    html: options.html,
  };

  try {
    const info = await transporter.sendMail(message);
    console.log("Message sent via SMTP: %s", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending email with SMTP:", error);
    console.warn(
      "SMTP send failed. Trying Ethereal as fallback for development."
    );
    return sendEmailWithEthereal(options);
  }
};

/**
 * Opsi Mengirim email menggunakan Mailgun API.
 * @param {object} options - Opsi email (to, subject, text, html).
 * @returns {Promise<{success: boolean, messageId?: string, error?: Error}>}
 */
const sendEmailWithMailgun = async (options) => {
  if (
    !config.mailgun?.apiKey ||
    !config.mailgun?.domain ||
    !config.mailgun?.senderEmail
  ) {
    console.warn(
      "Konfigurasi Mailgun tidak lengkap (API Key, Domain, atau Sender Email). Mencoba fallback ke Ethereal."
    );
    return sendEmailWithEthereal(options);
  }

  const mailgunAuth = {
    auth: {
      api_key: config.mailgun.apiKey,
      domain: config.mailgun.domain,
    },
  };

  // Pastikan Anda memanggil mailgunTransport sebagai fungsi dengan opsi auth
  const transporter = nodemailer.createTransport(mailgunTransport(mailgunAuth));

  const message = {
    from: config.mailgun.senderEmail, // Gunakan email pengirim dari config
    to: options.email,
    subject: options.subject,
    text: options.text,
    html: options.html,
    // Tambahkan header Mailgun kustom jika perlu, misal:
    // 'h:Reply-To': 'balas.ke.email.ini@example.com'
  };

  try {
    const info = await transporter.sendMail(message);
    // Mailgun biasanya mengembalikan 'id' sebagai ID pesan
    console.log("Message sent via Mailgun: %s", info.id || info.messageId);
    return { success: true, messageId: info.id || info.messageId };
  } catch (error) {
    console.error("Error sending email with Mailgun:", error.message);
    // Error dari Mailgun biasanya lebih detail di error.message
    return {
      success: false,
      error: new Error(`Mailgun failed: ${error.message}`),
    };
  }
};

// --- Logika Pemilihan Metode Pengiriman Email ---

let emailSendingFunction;

// Prioritas untuk Production
if (process.env.NODE_ENV === "production") {
  if (
    config.mailgun.apiKey &&
    config.mailgun.domain &&
    config.mailgun.senderEmail
  ) {
    emailSendingFunction = sendEmailWithMailgun;
    console.info("Email Service: Using Mailgun for production.");
  } else if (config.email.host && config.email.user && config.email.pass) {
    emailSendingFunction = sendEmailWithSmtp;
    console.warn(
      "Email Service: Mailgun not fully configured for production, falling back to SMTP (Gmail/Custom). Not recommended for high volume."
    );
  } else {
    emailSendingFunction = sendEmailWithEthereal; // Fallback terakhir (seharusnya tidak terjadi di prod)
    console.error(
      "Email Service: CRITICAL - No primary email service (Mailgun/SMTP) fully configured for production. Falling back to Ethereal."
    );
  }
} else {
  // Prioritas untuk Development (dan environment lainnya)
  if (
    config.mailgun.apiKey &&
    config.mailgun.domain &&
    config.mailgun.senderEmail
  ) {
    emailSendingFunction = sendEmailWithMailgun;
    console.info("Email Service: Using Mailgun for development.");
  } else if (config.email.host && config.email.user && config.email.pass) {
    emailSendingFunction = sendEmailWithSmtp;
    console.info(
      "Email Service: Mailgun not fully configured, using SMTP (Gmail/Custom) for development."
    );
  } else {
    emailSendingFunction = sendEmailWithEthereal; // Default ke Ethereal
    console.info(
      "Email Service: No Mailgun/SMTP fully configured, using Ethereal for development."
    );
  }
}

// Fungsi `sendEmail` utama yang akan diekspor dan dipanggil
const sendEmail = async (options) => {
  return emailSendingFunction(options);
};

module.exports = sendEmail;
