const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staffController');
const { authenticate } = require('../middleware/authMiddleware');

router.use(authenticate);

router.get('/', staffController.getAll);
router.get('/:id', staffController.getOne);
// Default delete, usually only for admins, we keep it simple here
router.delete('/:id', staffController.delete);

module.exports = router;
