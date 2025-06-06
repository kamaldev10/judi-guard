// src/models/PasswordReset.model.js
const mongoose = require("mongoose");

const passwordResetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User", // Pastikan 'User' adalah nama model pengguna Anda yang diekspor
    },
    token: {
      type: String,
      required: true,
      unique: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      // MongoDB akan otomatis menghapus dokumen setelah waktu ini tercapai
      index: { expires: "60s" }, // Token akan dihapus setelah 1 detik dari 'expiresAt'
    },
  },
  {
    timestamps: true, // Menambahkan createdAt dan updatedAt secara otomatis
  }
);

const PasswordReset = mongoose.model("PasswordReset", passwordResetSchema);

module.exports = {
  PasswordReset,
};
