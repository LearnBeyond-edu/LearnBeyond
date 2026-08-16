const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { authenticate } = require('../middleware/authMiddleware');

router.use(authenticate);

router.get('/', studentController.getAll);
router.get('/:id', studentController.getOne);
// Default delete, usually only for admins, we keep it simple here
router.delete('/:id', studentController.delete);

module.exports = router;
