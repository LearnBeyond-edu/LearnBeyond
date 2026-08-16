const express = require('express');
const router = express.Router();
const parentController = require('../controllers/parentController');
const { authenticate } = require('../middleware/authMiddleware');

router.use(authenticate);

router.get('/', parentController.getAll);
router.get('/:id', parentController.getOne);
// Default delete, usually only for admins, we keep it simple here
router.delete('/:id', parentController.delete);

module.exports = router;
