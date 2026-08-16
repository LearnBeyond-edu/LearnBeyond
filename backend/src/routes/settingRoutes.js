const express = require('express');
const router = express.Router();
const settingController = require('../controllers/settingController');
const { authenticate } = require('../middleware/authMiddleware');

router.use(authenticate);

router.get('/', settingController.getAll);
router.get('/:id', settingController.getOne);
router.post('/profile', settingController.updateProfile);
router.delete('/:id', settingController.delete);

module.exports = router;
