const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getActiveCalendar,
  getAllCalendars,
  getCalendarById,
  createCalendar,
  updateCalendar,
  activateCalendar,
  deleteCalendar,
} = require('../controllers/academicCalendarController');

router.use(protect);

router.route('/')
  .get(getActiveCalendar)
  .post(createCalendar);

router.get('/all', getAllCalendars);

router.route('/:id')
  .get(getCalendarById)
  .put(updateCalendar)
  .delete(deleteCalendar);

router.post('/:id/activate', activateCalendar);

module.exports = router;
