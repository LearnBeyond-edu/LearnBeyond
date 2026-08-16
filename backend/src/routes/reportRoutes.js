const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { authenticate } = require('../middleware/authMiddleware');

router.use(authenticate);

router.get('/', reportController.getAll);
router.get('/:id', reportController.getOne);
// Default delete, usually only for admins, we keep it simple here
router.delete('/:id', reportController.delete);

module.exports = router;
