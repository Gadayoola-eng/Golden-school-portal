const express = require('express');
const {
  getTermsList,
  getStudentReportCard,
  saveReportCard,
} = require('../controllers/reportCardController');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

router.use(authenticateToken);

router.get('/terms', getTermsList);
router.get('/student/:studentId', getStudentReportCard);
router.post('/student/:studentId', requireRole(['TEACHER', 'ADMIN']), saveReportCard);

module.exports = router;
