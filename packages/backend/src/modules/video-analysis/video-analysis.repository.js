import VideoAnalysis from './video-analysis.model.js';

export class VideoAnalysisRepository {
  static findOne(query) {
    return VideoAnalysis.findOne(query);
  }

  static findById(id) {
    return VideoAnalysis.findById(id);
  }

  static findByIdAndUpdate(id, updateData, options = {}) {
    return VideoAnalysis.findByIdAndUpdate(id, updateData, options);
  }

  static create(data) {
    return VideoAnalysis.create(data);
  }

  static find(query) {
    return VideoAnalysis.find(query);
  }

  static countDocuments(query) {
    return VideoAnalysis.countDocuments(query);
  }
}
