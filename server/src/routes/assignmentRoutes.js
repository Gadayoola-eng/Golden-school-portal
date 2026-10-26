const express = require('express');
const router = express.Router();
const {
  getAssignmentsByClass,
  getAssignmentById,
  createAssignment,
  updateAssignment,
  deleteAssignment,
} = require('../controllers/assignmentController');
const { authenticateToken, requireTeacher } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/class/:classId', getAssignmentsByClass);
router.get('/:id', getAssignmentById);
router.post('/', requireTeacher, createAssignment);
router.put('/:id', requireTeacher, updateAssignment);
router.delete('/:id', requireTeacher, deleteAssignment);

module.exports = router;
