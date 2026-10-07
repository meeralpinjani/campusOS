const mongoose = require('mongoose');

const daySchema = new mongoose.Schema(
  {
    date: { type: Number, default: null },
    category: {
      type: String,
      enum: ['academic', 'student-activity', 'holiday', 'examination', 'none'],
      default: 'none',
    },
  },
  { _id: false }
);

const weekSchema = new mongoose.Schema(
  {
    weekNumber: { type: String, default: '-' },
    days: {
      Mon: { type: daySchema, default: () => ({ date: null, category: 'none' }) },
      Tue: { type: daySchema, default: () => ({ date: null, category: 'none' }) },
      Wed: { type: daySchema, default: () => ({ date: null, category: 'none' }) },
      Thu: { type: daySchema, default: () => ({ date: null, category: 'none' }) },
      Fri: { type: daySchema, default: () => ({ date: null, category: 'none' }) },
      Sat: { type: daySchema, default: () => ({ date: null, category: 'none' }) },
      Sun: { type: daySchema, default: () => ({ date: null, category: 'none' }) },
    },
    eventsText: { type: String, default: '' },
  },
  { _id: false }
);

const monthSchema = new mongoose.Schema(
  {
    monthLabel: { type: String, required: true },
    instructionDaysThisMonth: { type: Number, default: 0 },
    weeks: [weekSchema],
  },
  { _id: false }
);

const academicCalendarSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Calendar title is required'],
      default: 'S.Y.B.Tech, T.Y.B.Tech and Final Year B.Tech',
    },
    semesterLabel: {
      type: String,
      required: [true, 'Semester label is required'],
      default: '(ODD SEMESTER, 2026-27)',
    },
    academicYear: {
      type: String,
      default: '2026-27',
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    months: [monthSchema],
    summary: {
      totalInstructionDays: { type: Number, default: 111 },
      notes: [{ type: String }],
    },
    legend: [
      {
        category: {
          type: String,
          enum: ['academic', 'student-activity', 'holiday', 'examination'],
        },
        title: { type: String },
        description: { type: String },
        dateRange: { type: String },
      },
    ],
    approvals: [
      {
        role: { type: String },
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('AcademicCalendar', academicCalendarSchema);
