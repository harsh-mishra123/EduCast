const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  educatorId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
    index: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  },
  lectureId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LiveLecture'
  },
  title: {
    type: String,
    required: true
  },
  description: String,
  filename: String,
  originalName: String,
  size: Number,
  mimeType: String,
  duration: Number,
  thumbnailUrl: String,
  hlsUrl: String,
  status: {
    type: String,
    enum: ['uploading', 'processing', 'ready', 'failed'],
    default: 'uploading'
  },
  processingError: String,
  processedAt: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Video', videoSchema);
