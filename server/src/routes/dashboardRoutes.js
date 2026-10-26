const express = require('express');
const router = express.Router();
const { getTeacherDashboard, getStudentDashboard } = require('../controllers/dashboardController');
const { authenticateToken, requireTeacher, requireStudent } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/teacher', requireTeacher, getTeacherDashboard);
router.get('/student', requireStudent, getStudentDashboard);

module.exports = router;
