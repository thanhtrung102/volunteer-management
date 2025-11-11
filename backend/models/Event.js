const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Vui lòng nhập tên sự kiện'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Vui lòng nhập mô tả'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Vui lòng chọn danh mục'],
    enum: ['tree_planting', 'cleanup', 'charity', 'education', 'other']
  },
  location: {
    address: {
      type: String,
      required: [true, 'Vui lòng nhập địa điểm']
    },
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  startDate: {
    type: Date,
    required: [true, 'Vui lòng nhập ngày bắt đầu']
  },
  endDate: {
    type: Date,
    required: [true, 'Vui lòng nhập ngày kết thúc']
  },
  maxParticipants: {
    type: Number,
    required: [true, 'Vui lòng nhập số lượng tối đa'],
    min: 1
  },
  currentParticipants: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['draft', 'pending', 'approved', 'rejected', 'ongoing', 'completed', 'cancelled'],
    default: 'draft'
  },
  images: [{
    type: String
  }],
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  requirements: {
    type: String,
    default: ''
  },
  benefits: {
    type: String,
    default: ''
  },
  contactInfo: {
    name: String,
    phone: String,
    email: String
  },
  // Thống kê tương tác
  stats: {
    totalPosts: {
      type: Number,
      default: 0
    },
    totalLikes: {
      type: Number,
      default: 0
    },
    totalComments: {
      type: Number,
      default: 0
    },
    recentActivityCount: {
      type: Number,
      default: 0
    },
    lastActivityAt: {
      type: Date,
      default: null
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index để tối ưu query
eventSchema.index({ category: 1, status: 1 });
eventSchema.index({ startDate: 1 });
eventSchema.index({ status: 1, startDate: 1 });
eventSchema.index({ organizer: 1 });
eventSchema.index({ 'stats.recentActivityCount': -1 });
eventSchema.index({ createdAt: -1 });

// Virtual để check event đã full chưa
eventSchema.virtual('isFull').get(function() {
  return this.currentParticipants >= this.maxParticipants;
});

// Virtual để check event đã qua chưa
eventSchema.virtual('isPast').get(function() {
  return this.endDate < new Date();
});

module.exports = mongoose.model('Event', eventSchema);