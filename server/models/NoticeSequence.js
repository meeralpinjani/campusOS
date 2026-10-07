const mongoose = require('mongoose');

const noticeSequenceSchema = new mongoose.Schema(
  {
    academicYear: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    lastSequenceNumber: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('NoticeSequence', noticeSequenceSchema);
