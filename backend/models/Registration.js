const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  volunteer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed', 'no_show'],
    default: 'pending'
  },
  registeredAt: {
    type: Date,
    default: Date.now
  },
  confirmedAt: {
    type: Date
  },
  cancelledAt: {
    type: Date
  },
  completedAt: {
    type: Date
  },
  cancelReason: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  },
  attendance: {
    checkIn: {
      type: Date
    },
    checkOut: {
      type: Date
    },
    hours: {
      type: Number,
      default: 0
    }
  },
  feedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      trim: true
    },
    submittedAt: {
      type: Date
    }
  }
}, {
  timestamps: true
});

// Index để tối ưu query
registrationSchema.index({ event: 1, volunteer: 1 }, { unique: true });
registrationSchema.index({ volunteer: 1, status: 1 });
registrationSchema.index({ event: 1, status: 1 });
registrationSchema.index({ registeredAt: -1 });

// Static method để check trùng đăng ký
registrationSchema.statics.isAlreadyRegistered = async function(eventId, volunteerId) {
  const registration = await this.findOne({
    event: eventId,
    volunteer: volunteerId,
    status: { $nin: ['cancelled'] }
  });
  return !!registration;
};

module.exports = mongoose.model('Registration', registrationSchema);