const mongoose = require('mongoose');

const channelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Channel name is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    type: {
      type: String,
      enum: ['branch', 'interest', 'general'],
      default: 'general',
    },
    category: {
      type: String,
      default: 'Engineering Departments',
      trim: true,
    },
    group: {
      type: String,
      default: 'General',
      trim: true,
    },
    icon: {
      type: String,
      default: 'Hash',
      trim: true,
    },
    isRestricted: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Channel', channelSchema);
