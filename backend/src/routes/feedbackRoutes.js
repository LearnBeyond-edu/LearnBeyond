const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');
const { authenticate } = require('../middleware/authMiddleware');

router.use(authenticate);

router.get('/', feedbackController.getAll);
router.get('/:id', feedbackController.getOne);
// Default delete, usually only for admins, we keep it simple here
router.delete('/:id', feedbackController.delete);

module.exports = router;
