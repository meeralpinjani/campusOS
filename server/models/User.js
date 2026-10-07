const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// 9 Exact Campus Departments specified
const DEPARTMENTS = [
  'Biotechnology',
  'Civil Engineering',
  'Civil & Environmental Engineering',
  'Computer Science & Engineering',
  'Computer Science & Business Systems',
  'Computer Science Engineering - Artificial Intelligence And Machine Learning',
  'Electrical Engineering',
  'Electronics & Telecomm Engineering',
  'Mechanical Engineering',
];

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      minlength: [3, 'Username must be at least 3 characters'],
      maxlength: [30, 'Username cannot exceed 30 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email address is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email address'],
    },
    passwordHash: {
      type: String,
      required: [true, 'Password is required'],
      select: false,
    },
    avatarUrl: {
      type: String,
      default: function () {
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(this.username || 'User')}&background=2563eb&color=fff&bold=true`;
      },
    },
    branch: {
      type: String,
      required: [true, 'Department branch is required'],
      enum: DEPARTMENTS,
      trim: true,
    },
    year: {
      type: String,
      default: 'N/A', // Set to 'N/A' for Faculty, or '1st Year', '2nd Year', etc. for Students
      trim: true,
    },
    bio: {
      type: String,
      default: '',
      maxlength: [250, 'Bio cannot exceed 250 characters'],
    },
    reputationScore: {
      type: Number,
      default: 0,
    },
    role: {
      type: String,
      enum: ['student', 'faculty', 'moderator', 'admin'],
      default: 'student',
    },
    savedPosts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
      },
    ],
  },
  {
    timestamps: true,
  }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash') || this.passwordHash.startsWith('$2a$') || this.passwordHash.startsWith('$2b$')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.passwordHash);
};

module.exports = mongoose.model('User', userSchema);
module.exports.DEPARTMENTS = DEPARTMENTS;
