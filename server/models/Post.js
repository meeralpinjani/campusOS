const mongoose = require('mongoose');

const attachmentSchema = new mongoose.Schema({
  url: { type: String, required: true },
  fileType: { type: String, enum: ['image', 'video', 'pdf'], required: true },
  name: { type: String, default: 'attachment' },
  size: { type: String, default: '' },
});

const noticeMetadataSchema = new mongoose.Schema(
  {
    noticeNo: { type: String, default: '' },
    date: { type: String, default: '' },
    englishBody: { type: String, default: '' },
    subject: { type: String, default: '' },
    marathiBody: { type: String, default: '' },
    closingRemark: { type: String, default: '' },
    signatory: { type: String, default: 'संचालक' },
    signatureUrl: { type: String, default: '' },
  },
  { _id: false }
);

const postSchema = new mongoose.Schema(
  {
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    channelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Channel',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Post title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [300, 'Title cannot exceed 300 characters'],
    },
    body: {
      type: String,
      required: [true, 'Post body content is required'],
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    attachments: [attachmentSchema],
    noticeMetadata: {
      type: noticeMetadataSchema,
      default: null,
    },
    upvotes: {
      type: Number,
      default: 0,
    },
    downvotes: {
      type: Number,
      default: 0,
    },
    upvotedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    downvotedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    commentCount: {
      type: Number,
      default: 0,
    },
    score: {
      type: Number,
      default: 0,
    },
    hotScore: {
      type: Number,
      default: 0,
    },
    isNotice: {
      type: Boolean,
      default: false, // Indicates an official notice circular
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    isRemoved: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

postSchema.index({ channelId: 1, createdAt: -1 });
postSchema.index({ hotScore: -1 });
postSchema.index({ title: 'text', body: 'text', tags: 'text' });

module.exports = mongoose.model('Post', postSchema);
