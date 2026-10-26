const express = require('express');
const router = express.Router();
const { getParentOverview } = require('../controllers/parentController');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/overview', getParentOverview);

module.exports = router;
