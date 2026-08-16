const express = require('express');
const router = express.Router();
const lauraMemoryController = require('../controllers/lauraMemoryController');
const { authenticate } = require('../middleware/authMiddleware');

router.use(authenticate);

router.get('/', lauraMemoryController.getAll);
router.get('/:id', lauraMemoryController.getOne);
// Default delete, usually only for admins, we keep it simple here
router.delete('/:id', lauraMemoryController.delete);

module.exports = router;
