import PasswordReset from './password-reset.model.js';

export class PasswordResetRepository {
  static async deleteManyByUserId(userId) {
    return PasswordReset.deleteMany({ userId });
  }

  static async create(data) {
    return PasswordReset.create(data);
  }

  static async deleteByTokenAndUserId(token, userId) {
    return PasswordReset.deleteOne({ token, userId });
  }

  static async findByToken(token) {
    return PasswordReset.findOne({ token });
  }

  static async deleteById(id) {
    return PasswordReset.findByIdAndDelete(id);
  }
}
