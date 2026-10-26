const express = require('express');
const router = express.Router();
const {
  submitApplication,
  trackApplication,
  scheduleCampusVisit,
  getCampusVisits,
  getAllApplications,
  updateApplicationStatus,
} = require('../controllers/admissionsController');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Public endpoints
router.post('/apply', submitApplication);
router.get('/track/:appNumber', trackApplication);
router.post('/visit', scheduleCampusVisit);
router.get('/visits', getCampusVisits);

// Faculty / Staff endpoints
router.get('/applications', authenticateToken, requireRole('TEACHER'), getAllApplications);
router.patch('/applications/:id/status', authenticateToken, requireRole('TEACHER'), updateApplicationStatus);

module.exports = router;
