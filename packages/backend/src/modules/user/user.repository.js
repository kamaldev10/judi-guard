import User from '#modules/user/user.model.js';

export class UserRepository {
  static async findById(userId) {
    return User.findById(userId);
  }

  static async findByIdWithTokens(userId) {
    return User.findById(userId).select(
      '+youtubeAccessToken +youtubeRefreshToken +youtubeTokenExpiresAt',
    );
  }

  static async findByIdWithPassword(userId) {
    return User.findById(userId).select('+password');
  }

  static async findByEmail(email) {
    return User.findOne({ email });
  }

  static async findByEmailWithOtp(email) {
    return User.findOne({ email }).select('+otpCode +otpExpiresAt');
  }

  static async findByEmailWithPassword(email) {
    return User.findOne({ email }).select('+password');
  }

  static async findByEmailWithPasswordAndGoogleId(email) {
    return User.findOne({ email }).select('+password +googleId');
  }

  static async findByUsername(username) {
    return User.findOne({ username });
  }

  static async findByGoogleIdOrEmail(googleId, email) {
    return User.findOne({
      $or: [{ googleId: googleId }, { email: email }],
    });
  }

  static async updateById(userId, updateData, options = { new: true }) {
    return User.findByIdAndUpdate(userId, updateData, options);
  }

  static async create(userData) {
    return User.create(userData);
  }

  static async countDocuments(query = {}) {
    return User.countDocuments(query);
  }
}
