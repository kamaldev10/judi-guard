// src/api/controllers/user.controller.js

const User = require("../../models/User.model");
const { NotFoundError, BadRequestError } = require("../../utils/errors");

const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return next(new NotFoundError("User tidak ditemukan."));
    }
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

const updateMe = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const forbiddenFields = [
      "email",
      "password",
      "role",
      "isVerified",
      "_id",
      "id",
      "createdAt",
      "updatedAt",
    ];

    for (const field of forbiddenFields) {
      if (req.body[field] !== undefined) {
        return next(
          new BadRequestError(
            `Field '${field}' tidak dapat diubah melalui rute ini.`
          )
        );
      }
    }

    const allowedUpdates = {};
    const modifiableFields = ["username", "bio", "profilePicture"];

    modifiableFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        allowedUpdates[field] = req.body[field];
      }
    });

    // if (req.body.email) {
    //   // allowedUpdates.isVerified = false;
    // }

    if (Object.keys(allowedUpdates).length === 0) {
      return next(
        new BadRequestError("Tidak ada data valid yang dikirim untuk diupdate.")
      );
    }

    const updatedUser = await User.findByIdAndUpdate(userId, allowedUpdates, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!updatedUser) {
      return next(new NotFoundError("User tidak ditemukan untuk diupdate."));
    }

    // if (req.body.email && allowedUpdates.isVerified === false) {
    //   // logic untuk kirim email verifikasi
    // }

    res.status(200).json({
      status: "success",
      data: {
        user: updatedUser,
      },
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((el) => el.message);
      const message = `Data input tidak valid: ${messages.join(". ")}`;
      return next(new BadRequestError(message));
    }
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      const value = error.keyValue[field];
      const message = `Nilai '${value}' untuk field '${field}' sudah digunakan. Silakan gunakan nilai lain.`;
      return next(new BadRequestError(message));
    }
    next(error);
  }
};

const deleteMe = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await User.findByIdAndUpdate(
      userId,
      { active: false },
      { new: true }
    );

    if (!user) {
      return next(new NotFoundError("User tidak ditemukan untuk dihapus."));
    }

    res.status(200).json({
      status: "success",
      message: "Akun pengguna telah berhasil dihapus.",
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMe,
  updateMe,
  deleteMe,
};
