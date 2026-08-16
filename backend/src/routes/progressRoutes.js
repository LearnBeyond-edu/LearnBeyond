const express = require('express');
const router = express.Router();
const progressController = require('../controllers/progressController');
const { authenticate } = require('../middleware/authMiddleware');

router.use(authenticate);

router.get('/', progressController.getAll);
router.get('/:id', progressController.getOne);
router.post('/', progressController.create);
router.put('/:id', progressController.update);
// Default delete, usually only for admins, we keep it simple here
router.delete('/:id', progressController.delete);

module.exports = router;
