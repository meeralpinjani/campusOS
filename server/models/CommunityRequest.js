const mongoose = require('mongoose');

const communityRequestSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Community name is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, 'Description/Purpose is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['branch', 'interest', 'general'],
      default: 'interest',
    },
    category: {
      type: String,
      default: 'Communities (Reddit-Style)',
    },
    group: {
      type: String,
      default: 'Communities (Reddit-Style)',
    },
    icon: {
      type: String,
      default: 'Users',
    },
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reason: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewComment: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('CommunityRequest', communityRequestSchema);
