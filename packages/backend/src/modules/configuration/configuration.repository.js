import { Whitelist, Blacklist } from '#modules/configuration/configuration.model.js';

export class WhitelistRepository {
  static async create(data) {
    return Whitelist.create(data);
  }

  static async findByUserId(userId) {
    return Whitelist.find({ userId }).sort({ createdAt: -1 });
  }

  static async deleteByIdAndUserId(id, userId) {
    return Whitelist.findOneAndDelete({ _id: id, userId });
  }
}

export class BlacklistRepository {
  static async findByUserId(userId) {
    return Blacklist.find({ userId }).sort({ createdAt: -1 });
  }

  static async findByUserIdAndKeywords(userId, keywords) {
    return Blacklist.find({ userId, keyword: { $in: keywords } });
  }

  static async insertMany(docs) {
    return Blacklist.insertMany(docs);
  }

  static async deleteByIdAndUserId(id, userId) {
    return Blacklist.findOneAndDelete({ _id: id, userId });
  }
}
