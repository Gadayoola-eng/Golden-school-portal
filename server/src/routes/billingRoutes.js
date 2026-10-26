const express = require('express');
const router = express.Router();
const { getBills, payBill, getReceipt } = require('../controllers/billingController');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

// All authenticated users (Parent, Student, Teacher) can view appropriate bills
router.get('/', getBills);
router.post('/pay/:id', payBill);
router.get('/receipt/:id', getReceipt);

module.exports = router;
