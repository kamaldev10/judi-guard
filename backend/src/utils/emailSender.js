// src/utils/emailSender.js
const nodemailer = require("nodemailer");
const config = require("../config/environment"); // Untuk mengambil config email jika ada
const mailgunTransport = require("nodemailer-mailgun-transport"); // Impor Mailgun transport

// Opsi untuk menggunakan Ethereal (bagus untuk development cepat tanpa setup SMTP)
const sendEmailWithEthereal = async (options) => {
  // Generate test SMTP service account from ethereal.email
  // Only needed if you don't have a real mail account for testing
  let testAccount = await nodemailer.createTestAccount();

  console.log("Ethereal test account created:");
  console.log("User:", testAccount.user);
  console.log("Pass:", testAccount.pass);

  let transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: testAccount.user, // generated ethereal user
      pass: testAccount.pass, // generated ethereal password
    },
  });

  const message = {
    from: process.env.EMAIL_FROM || '"Judi Guard Test" <noreply@example.com>',
    to: options.email,
    subject: options.subject,
    text: options.text, // Plain text body
    html: options.html, // HTML body (opsional)
  };

  try {
    let info = await transporter.sendMail(message);
    console.log("Message sent: %s", info.messageId);
    // Preview URL for Ethereal email
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    return { success: true, previewUrl: nodemailer.getTestMessageUrl(info) };
  } catch (error) {
    console.error("Error sending email with Ethereal:", error);
    return { success: false, error };
  }
};

// Opsi untuk menggunakan SMTP yang dikonfigurasi di .env (misal Gmail)
const sendEmailWithSmtp = async (options) => {
  if (!config.email?.host || !config.email?.user || !config.email?.pass) {
    console.warn(
      "Konfigurasi SMTP Email tidak lengkap di .env. Menggunakan Ethereal sebagai fallback."
    );
    return sendEmailWithEthereal(options);
  }

  const transporter = nodemailer.createTransport({
    host: config.email.host,
    port: config.email.port,
    secure: config.email.secure, // true for 465, false for other ports
    auth: {
      user: config.email.user,
      pass: config.email.pass,
    },
    // Jika menggunakan self-signed certificate di development
    // tls: {
    //   rejectUnauthorized: false
    // }
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
    console.log("Message sent with SMTP: %s", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending email with SMTP:", error);
    // Jika SMTP gagal, bisa fallback ke Ethereal untuk development
    console.warn(
      "SMTP send failed. Trying Ethereal as fallback for development."
    );
    return sendEmailWithEthereal(options);
    // return { success: false, error };
  }
};

/**
 * Mengirim email menggunakan Mailgun API.
 * @param {object} options - Opsi email (to, subject, text, html).
 * @returns {Promise<{success: boolean, messageId?: string, error?: Error}>}
 */
const sendEmailWithMailgun = async (options) => {
  if (!config.mailgun.apiKey || !config.mailgun.domain) {
    console.warn("Konfigurasi Mailgun tidak lengkap. Coba fallback jika ada.");
    // Anda bisa memutuskan untuk fallback ke Ethereal atau SMTP Gmail di sini jika mau
    return sendEmailWithEthereal(options); // Contoh fallback ke Ethereal
    // return { success: false, error: new Error("Mailgun configuration is missing.") };
  }

  const mailgunAuth = {
    auth: {
      api_key: config.mailgun.apiKey,
      domain: config.mailgun.domain,
    },
  };

  const transporter = nodemailer.createTransport(mailgunTransport(mailgunAuth));

  const message = {
    from: config.mailgun.senderEmail, // Gunakan email pengirim dari config
    to: options.email,
    subject: options.subject,
    text: options.text,
    html: options.html, // Opsional
    // 'h:Reply-To': 'balas.ke.email.ini@example.com' // Header Mailgun kustom jika perlu
  };

  try {
    const info = await transporter.sendMail(message);
    console.log("Message sent with Mailgun: %s", info.id || info.messageId); // Mailgun biasanya mengembalikan 'id'
    return { success: true, messageId: info.id || info.messageId };
  } catch (error) {
    console.error("Error sending email with Mailgun:", error);
    return { success: false, error };
  }
};

// Logika pemilihan metode pengiriman email
let emailSendingFunction;

if (process.env.NODE_ENV === "production") {
  if (config.mailgun.apiKey && config.mailgun.domain) {
    emailSendingFunction = sendEmailWithMailgun; // Prioritaskan Mailgun di produksi
    console.info("Email Service: Using Mailgun for production.");
  } else if (config.email.host && config.email.user && config.email.pass) {
    emailSendingFunction = sendEmailWithSmtp; // Fallback ke SMTP Gmail jika Mailgun tidak ada tapi Gmail ada
    console.warn(
      "Email Service: Mailgun not configured for production, falling back to SMTP (Gmail). This is not recommended for high volume."
    );
  } else {
    emailSendingFunction = sendEmailWithEthereal; // Fallback terakhir ke Ethereal (seharusnya tidak terjadi di prod)
    console.error(
      "Email Service: CRITICAL - No primary email service (Mailgun/SMTP) configured for production. Falling back to Ethereal."
    );
  }
} else {
  // Untuk development atau environment lain
  if (config.mailgun.apiKey && config.mailgun.domain) {
    emailSendingFunction = sendEmailWithMailgun; // Gunakan Mailgun jika ada di dev
    console.info("Email Service: Using Mailgun for development.");
  } else if (config.email.host && config.email.user && config.email.pass) {
    emailSendingFunction = sendEmailWithSmtp; // Atau SMTP Gmail jika ada
    console.info(
      "Email Service: Mailgun not configured, using SMTP (Gmail) for development."
    );
  } else {
    emailSendingFunction = sendEmailWithEthereal; // Default ke Ethereal jika tidak ada yang lain
    console.info(
      "Email Service: No Mailgun/SMTP configured, using Ethereal for development."
    );
  }
}

// Fungsi sendEmail utama yang akan dipanggil oleh service lain
const sendEmail = async (options) => {
  return emailSendingFunction(options);
};

module.exports = sendEmail;
