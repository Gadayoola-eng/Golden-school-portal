const express = require('express');
const router = express.Router();
const {
  getHighlights,
  getNewsList,
  getEventsList,
  getDownloadsList,
  recordDownload,
} = require('../controllers/contentController');

router.get('/highlights', getHighlights);
router.get('/news', getNewsList);
router.get('/events', getEventsList);
router.get('/downloads', getDownloadsList);
router.post('/downloads/:id/track', recordDownload);

module.exports = router;
