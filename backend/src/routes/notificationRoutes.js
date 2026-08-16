const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { authenticate } = require('../middleware/authMiddleware');

router.use(authenticate);

router.get('/', notificationController.getAll);
router.get('/:id', notificationController.getOne);
router.post('/', notificationController.create);
// Default delete, usually only for admins, we keep it simple here
router.delete('/:id', notificationController.delete);

module.exports = router;
