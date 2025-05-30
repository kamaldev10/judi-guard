// src/api/controllers/user.controller.js

// Fungsi untuk mendapatkan detail user yang sedang login
const getMe = async (req, res, next) => {
  try {
    // req.user sudah diset oleh middleware isAuthenticated
    // Tidak perlu query database lagi jika sudah diset lengkap di middleware
    const user = req.user;

    res.status(200).json({
      status: "success",
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMe,
};
