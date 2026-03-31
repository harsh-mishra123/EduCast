const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  videoUrl: { type: String, required: true },
  duration: Number,
  order: { type: Number, default: 0 }
});

const sectionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  videos: [videoSchema],
  order: { type: Number, default: 0 }
});

const courseSchema = new mongoose.Schema({
  educatorId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  thumbnail: String,
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  sections: [sectionSchema],
  totalStudents: {
    type: Number,
    default: 0
  },
  totalRevenue: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Course', courseSchema);