const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(authenticate);
router.use(authorize('Platform Admin'));

router.get('/system-health', analyticsController.getSystemHealth);

module.exports = router;
