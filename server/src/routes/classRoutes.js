const express = require('express');
const router = express.Router();
const {
  getClasses,
  getAvailableClasses,
  createClass,
  getClassById,
  updateClass,
  deleteClass,
  enrollStudent,
  unenrollStudent,
} = require('../controllers/classController');
const { authenticateToken, requireTeacher } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/', getClasses);
router.get('/available', getAvailableClasses);
router.post('/', requireTeacher, createClass);
router.get('/:id', getClassById);
router.put('/:id', requireTeacher, updateClass);
router.delete('/:id', requireTeacher, deleteClass);
router.post('/:id/enroll', enrollStudent);
router.delete('/:id/enroll/:studentId', unenrollStudent);

module.exports = router;
