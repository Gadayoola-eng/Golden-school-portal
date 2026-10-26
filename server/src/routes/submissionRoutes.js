const express = require('express');
const router = express.Router();
const {
  submitAssignment,
  getSubmissionsForAssignment,
  getMySubmission,
  gradeSubmission,
  getClassGradebook,
  getMyGradesInClass,
} = require('../controllers/submissionController');
const { authenticateToken, requireTeacher, requireStudent } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

router.use(authenticateToken);

// Student submit / edit (handles text answer and/or single file upload)
router.post(
  '/assignment/:assignmentId/submit',
  requireStudent,
  upload.single('file'),
  submitAssignment
);

// Student get own submission
router.get('/assignment/:assignmentId/mine', requireStudent, getMySubmission);

// Teacher get all submissions for an assignment
router.get('/assignment/:assignmentId', requireTeacher, getSubmissionsForAssignment);

// Teacher grade a submission
router.post('/:id/grade', requireTeacher, gradeSubmission);

// Teacher class gradebook matrix
router.get('/class/:classId/gradebook', requireTeacher, getClassGradebook);

// Student view all grades for a class
router.get('/class/:classId/my-grades', requireStudent, getMyGradesInClass);

module.exports = router;
