const express = require('express');
const { getMyTimetable, getClassTimetable } = require('../controllers/timetableController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.use(authenticateToken);

router.get('/my', getMyTimetable);
router.get('/class/:classId', getClassTimetable);

module.exports = router;
