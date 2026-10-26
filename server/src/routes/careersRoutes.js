const express = require('express');
const router = express.Router();
const {
  getJobListings,
  getJobDetail,
  submitJobApplication,
  getAllJobApplications,
} = require('../controllers/careersController');

// Public endpoints
router.get('/jobs', getJobListings);
router.get('/jobs/:id', getJobDetail);
router.post('/apply', submitJobApplication);

// Faculty & HR review
router.get('/applications', getAllJobApplications);

module.exports = router;
