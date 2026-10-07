const AcademicCalendar = require('../models/AcademicCalendar');

/**
 * @desc    Get current active academic calendar (or fallback to latest)
 * @route   GET /api/academic-calendar
 * @access  Private (All authenticated roles)
 */
const getActiveCalendar = async (req, res) => {
  try {
    let calendar = await AcademicCalendar.findOne({ isActive: true });
    if (!calendar) {
      calendar = await AcademicCalendar.findOne().sort({ createdAt: -1 });
    }

    if (!calendar) {
      return res.status(404).json({ message: 'No academic calendar available' });
    }

    return res.status(200).json({ calendar });
  } catch (error) {
    console.error('[Get Active Calendar Error]:', error);
    return res.status(500).json({ message: 'Server error fetching academic calendar' });
  }
};

/**
 * @desc    Get list of all academic calendars (for selector / admin)
 * @route   GET /api/academic-calendar/all
 * @access  Private (All authenticated roles)
 */
const getAllCalendars = async (req, res) => {
  try {
    const calendars = await AcademicCalendar.find()
      .select('title semesterLabel academicYear isActive createdAt')
      .sort({ createdAt: -1 });

    return res.status(200).json({ calendars });
  } catch (error) {
    console.error('[Get All Calendars Error]:', error);
    return res.status(500).json({ message: 'Server error fetching calendar list' });
  }
};

/**
 * @desc    Get single academic calendar by ID
 * @route   GET /api/academic-calendar/:id
 * @access  Private
 */
const getCalendarById = async (req, res) => {
  try {
    const calendar = await AcademicCalendar.findById(req.params.id);
    if (!calendar) {
      return res.status(404).json({ message: 'Academic calendar not found' });
    }
    return res.status(200).json({ calendar });
  } catch (error) {
    console.error('[Get Calendar By ID Error]:', error);
    return res.status(500).json({ message: 'Server error fetching academic calendar' });
  }
};

/**
 * @desc    Create new academic calendar
 * @route   POST /api/academic-calendar
 * @access  Private (Admin & Moderator only)
 */
const createCalendar = async (req, res) => {
  try {
    if (!['admin', 'moderator'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: Restricted to Administrators and Moderators' });
    }

    const { title, semesterLabel, academicYear, months, summary, legend, approvals, isActive } = req.body;

    if (isActive) {
      await AcademicCalendar.updateMany({}, { isActive: false });
    }

    const calendar = await AcademicCalendar.create({
      title: title || 'S.Y.B.Tech, T.Y.B.Tech and Final Year B.Tech',
      semesterLabel: semesterLabel || '(ODD SEMESTER, 2026-27)',
      academicYear: academicYear || '2026-27',
      isActive: isActive !== undefined ? isActive : true,
      months: months || [],
      summary: summary || { totalInstructionDays: 111, notes: [] },
      legend: legend || [],
      approvals: approvals || [],
      createdBy: req.user._id,
    });

    return res.status(201).json({
      message: 'Academic calendar created successfully',
      calendar,
    });
  } catch (error) {
    console.error('[Create Calendar Error]:', error);
    return res.status(500).json({ message: error.message || 'Server error creating academic calendar' });
  }
};

/**
 * @desc    Update existing academic calendar
 * @route   PUT /api/academic-calendar/:id
 * @access  Private (Admin & Moderator only)
 */
const updateCalendar = async (req, res) => {
  try {
    if (!['admin', 'moderator'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: Restricted to Administrators and Moderators' });
    }

    const calendar = await AcademicCalendar.findById(req.params.id);
    if (!calendar) {
      return res.status(404).json({ message: 'Academic calendar not found' });
    }

    const { title, semesterLabel, academicYear, months, summary, legend, approvals, isActive } = req.body;

    if (isActive && !calendar.isActive) {
      await AcademicCalendar.updateMany({}, { isActive: false });
    }

    if (title !== undefined) calendar.title = title;
    if (semesterLabel !== undefined) calendar.semesterLabel = semesterLabel;
    if (academicYear !== undefined) calendar.academicYear = academicYear;
    if (months !== undefined) calendar.months = months;
    if (summary !== undefined) calendar.summary = summary;
    if (legend !== undefined) calendar.legend = legend;
    if (approvals !== undefined) calendar.approvals = approvals;
    if (isActive !== undefined) calendar.isActive = isActive;

    await calendar.save();

    return res.status(200).json({
      message: 'Academic calendar updated successfully',
      calendar,
    });
  } catch (error) {
    console.error('[Update Calendar Error]:', error);
    return res.status(500).json({ message: error.message || 'Server error updating academic calendar' });
  }
};

/**
 * @desc    Toggle active calendar
 * @route   POST /api/academic-calendar/:id/activate
 * @access  Private (Admin & Moderator only)
 */
const activateCalendar = async (req, res) => {
  try {
    if (!['admin', 'moderator'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: Restricted to Administrators and Moderators' });
    }

    await AcademicCalendar.updateMany({}, { isActive: false });
    const calendar = await AcademicCalendar.findByIdAndUpdate(
      req.params.id,
      { isActive: true },
      { new: true }
    );

    if (!calendar) {
      return res.status(404).json({ message: 'Academic calendar not found' });
    }

    return res.status(200).json({
      message: `Calendar "${calendar.title}" set as active live calendar`,
      calendar,
    });
  } catch (error) {
    console.error('[Activate Calendar Error]:', error);
    return res.status(500).json({ message: 'Server error setting active calendar' });
  }
};

/**
 * @desc    Delete academic calendar
 * @route   DELETE /api/academic-calendar/:id
 * @access  Private (Admin & Moderator only)
 */
const deleteCalendar = async (req, res) => {
  try {
    if (!['admin', 'moderator'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: Restricted to Administrators and Moderators' });
    }

    const calendar = await AcademicCalendar.findByIdAndDelete(req.params.id);
    if (!calendar) {
      return res.status(404).json({ message: 'Academic calendar not found' });
    }

    return res.status(200).json({ message: 'Academic calendar deleted successfully' });
  } catch (error) {
    console.error('[Delete Calendar Error]:', error);
    return res.status(500).json({ message: 'Server error deleting academic calendar' });
  }
};

module.exports = {
  getActiveCalendar,
  getAllCalendars,
  getCalendarById,
  createCalendar,
  updateCalendar,
  activateCalendar,
  deleteCalendar,
};
