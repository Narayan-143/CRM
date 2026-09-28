const express = require('express');
const router = express.Router();
const { generateFollowUp } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/follow-up', generateFollowUp);

module.exports = router;
