const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: [true, 'Nội dung bình luận không được để trống'],
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const postSchema = new mongoose.Schema({
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: [true, 'Nội dung bài viết không được để trống'],
    trim: true
  },
  images: [{
    type: String
  }],
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [commentSchema],
  isDeleted: {
    type: Boolean,
    default: false
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
postSchema.index({ event: 1, createdAt: -1 });
postSchema.index({ author: 1 });
postSchema.index({ event: 1, isDeleted: 1, createdAt: -1 });

// Virtual để đếm số lượng likes
postSchema.virtual('likesCount').get(function() {
  return this.likes.length;
});

// Virtual để đếm số lượng comments
postSchema.virtual('commentsCount').get(function() {
  return this.comments.length;
});

module.exports = mongoose.model('Post', postSchema);