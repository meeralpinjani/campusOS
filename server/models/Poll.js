const mongoose = require('mongoose');

const pollOptionSchema = new mongoose.Schema({
  text: { type: String, required: true, trim: true },
  votes: { type: Number, default: 0 },
});

const pollSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: [true, 'Poll question is required'],
      trim: true,
    },
    options: [pollOptionSchema],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      default: null,
    },
    targetRoles: [
      {
        type: String,
        enum: ['student', 'faculty', 'moderator', 'admin'],
      },
    ],
    targetBranches: [
      {
        type: String,
        trim: true,
      },
    ],
    voters: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        optionId: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
        },
        votedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    totalVotes: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Database-level index constraint enforcing anti-tamper one vote per user per poll
pollSchema.index({ _id: 1, 'voters.userId': 1 });

module.exports = mongoose.model('Poll', pollSchema);
