const express = require('express');
const router = express.Router();
const therapistController = require('../controllers/therapistController');
const { authenticate } = require('../middleware/authMiddleware');

router.use(authenticate);

router.get('/', therapistController.getAll);
router.get('/:id', therapistController.getOne);
// Default delete, usually only for admins, we keep it simple here
router.delete('/:id', therapistController.delete);

module.exports = router;
