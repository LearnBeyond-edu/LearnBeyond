const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const { authenticate } = require('../middleware/authMiddleware');

router.use(authenticate);

router.get('/', attendanceController.getAll);
router.get('/:id', attendanceController.getOne);
// Default delete, usually only for admins, we keep it simple here
router.delete('/:id', attendanceController.delete);

module.exports = router;
