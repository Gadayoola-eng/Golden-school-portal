const express = require('express');
const {
  getTermsList,
  getStudentReportCard,
  getAllWardsReports,
  verifyResultToken,
  saveReportCard,
} = require('../controllers/reportCardController');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Public / Parent Result Checker by unique Student Number + Token PIN
router.post('/verify-token', verifyResultToken);

// Authenticated Routes
router.use(authenticateToken);

router.get('/terms', getTermsList);
router.get('/parent/all-reports', getAllWardsReports);
router.get('/student/:studentId', getStudentReportCard);
router.post('/student/:studentId', requireRole(['TEACHER', 'ADMIN']), saveReportCard);

module.exports = router;
