import AnalyzedComment from './analyzed-comment.model.js';

export class AnalyzedCommentRepository {
  static findOne(query) {
    return AnalyzedComment.findOne(query);
  }

  static findById(id) {
    return AnalyzedComment.findById(id);
  }

  static findByIdAndUpdate(id, updateData, options = {}) {
    return AnalyzedComment.findByIdAndUpdate(id, updateData, options);
  }

  static updateMany(query, updateData) {
    return AnalyzedComment.updateMany(query, updateData);
  }

  static create(data) {
    return AnalyzedComment.create(data);
  }

  static find(query) {
    return AnalyzedComment.find(query);
  }

  static countDocuments(query) {
    return AnalyzedComment.countDocuments(query);
  }

  static bulkWrite(operations) {
    return AnalyzedComment.bulkWrite(operations);
  }
}
