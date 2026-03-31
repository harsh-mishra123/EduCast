const mongoose = require('mongoose');

const liveLectureSchema = new mongoose.Schema({
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
  maxStudents: {
    type: Number,
    default: null
  },
  scheduledStartTime: {
    type: Date,
    required: true
  },
  scheduledEndTime: {
    type: Date,
    required: true
  },
  actualStartTime: Date,
  actualEndTime: Date,
  status: {
    type: String,
    enum: ['scheduled', 'live', 'ended', 'cancelled', 'recorded'],
    default: 'scheduled'
  },
  recordingUrl: String,
  recordingAvailable: {
    type: Boolean,
    default: false
  },
  roomId: {
    type: String,
    unique: true,
    sparse: true
  },
  totalEnrolled: {
    type: Number,
    default: 0
  },
  peakViewers: {
    type: Number,
    default: 0
  },
  totalRevenue: {
    type: Number,
    default: 0
  },
  stripePaymentLinkId: String,
  stripeProductId: String
}, {
  timestamps: true
});

// Generate room ID before saving
liveLectureSchema.pre('save', function(next) {
  if (!this.roomId && this._id) {
    this.roomId = `room_${this._id.toString()}_${Date.now()}`;
  }
  next();
});

module.exports = mongoose.model('LiveLecture', liveLectureSchema);