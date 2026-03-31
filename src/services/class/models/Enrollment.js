const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  },
  lectureId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LiveLecture'
  },
  type: {
    type: String,
    enum: ['course', 'live'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  paymentId: String,
  status: {
    type: String,
    enum: ['pending', 'active', 'completed', 'refunded'],
    default: 'active'
  },
  progress: {
    type: Number,
    default: 0
  },
  certificateIssued: {
    type: Boolean,
    default: false
  },
  certificateUrl: String,
  enrolledAt: {
    type: Date,
    default: Date.now
  },
  completedAt: Date
}, {
  timestamps: true
});

// Ensure either courseId or lectureId is present
enrollmentSchema.pre('validate', function(next) {
  if (!this.courseId && !this.lectureId) {
    next(new Error('Either courseId or lectureId is required'));
  }
  if (this.courseId && this.lectureId) {
    next(new Error('Cannot have both courseId and lectureId'));
  }
  next();
});

module.exports = mongoose.model('Enrollment', enrollmentSchema);