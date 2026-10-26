const express = require('express');
const {
  getClassAttendance,
  recordClassAttendance,
  getStudentAttendanceSummary,
} = require('../controllers/attendanceController');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// All attendance routes require authentication
router.use(authenticateToken);

// Student/Parent summary
router.get('/student/:studentId', getStudentAttendanceSummary);

// Teacher/Admin class roster & roll-call submission
router.get('/class/:classId', requireRole(['TEACHER', 'ADMIN']), getClassAttendance);
router.post('/class/:classId', requireRole(['TEACHER', 'ADMIN']), recordClassAttendance);

module.exports = router;
