const express = require('express');
const router = express.Router();
const {
  getAdminOverview,
  getAdminApplications,
  updateAdminApplication,
  getAdminUsers,
  getAdminBilling,
  updateBillStatus,
  getAdminCareers,
} = require('../controllers/adminController');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Protect all admin routes for ADMIN and authorized Faculty (TEACHER)
router.use(authenticateToken);
router.use(requireRole(['ADMIN', 'TEACHER']));

router.get('/overview', getAdminOverview);
router.get('/applications', getAdminApplications);
router.patch('/applications/:id', updateAdminApplication);
router.get('/users', getAdminUsers);
router.get('/billing', getAdminBilling);
router.patch('/billing/:id/status', updateBillStatus);
router.get('/careers', getAdminCareers);

module.exports = router;
