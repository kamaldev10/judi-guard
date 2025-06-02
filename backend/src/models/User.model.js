// src/models/User.model.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      minlength: [3, "Username must be at least 3 characters long"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/\S+@\S+\.\S+/, "Please use a valid email address"],
    },
    password: {
      type: String,
      required: false, // Jika mendaftar via Google, password bisa tidak ada
      minlength: [6, "Password must be at least 6 characters long"],
      select: false,
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
      select: false,
    },
    isVerified: {
      // Status verifikasi email/akun
      type: Boolean,
      default: false,
    },
    otpCode: {
      // Kode OTP yang dikirim
      type: String,
      select: false, // Jangan kirim OTP ke client secara default
    },
    otpExpiresAt: {
      // Waktu kedaluwarsa OTP
      type: Date,
      select: false,
    },
    // Untuk V1, token YouTube akan disimpan di sini
    youtubeAccessToken: { type: String, select: false },
    youtubeRefreshToken: { type: String, select: false },
    youtubeTokenExpiresAt: { type: Date, select: false },
    youtubeChannelId: { type: String },
    youtubeChannelName: { type: String },
  },
  {
    timestamps: true, // Otomatis membuat createdAt dan updatedAt
    toJSON: { virtuals: true }, // Izinkan virtuals di JSON output
    toObject: { virtuals: true }, // Izinkan virtuals di object output
  }
);

// Middleware: Hash password sebelum user disimpan
userSchema.pre("save", async function (next) {
  // Hanya jalankan fungsi ini jika password dimodifikasi (atau baru)
  if (!this.isModified("password")) return next();

  // Hash password dengan cost 12
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Method instance: Untuk membandingkan password kandidat dengan password user
userSchema.methods.comparePassword = async function (candidatePassword) {
  // this.password tidak tersedia karena select: false, jadi kita perlu query lagi atau pastikan password ada saat validasi
  // Cara yang lebih baik adalah mengambil password secara eksplisit saat dibutuhkan untuk login
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("User", userSchema);

module.exports = User;
