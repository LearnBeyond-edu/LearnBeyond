const express = require('express');
const router = express.Router();
const submissionController = require('../controllers/submissionController');
const { authenticate } = require('../middleware/authMiddleware');

router.use(authenticate);

router.get('/', submissionController.getAll);
router.get('/:id', submissionController.getOne);
router.post('/', submissionController.create);
router.put('/:id', submissionController.update);
// Default delete, usually only for admins, we keep it simple here
router.delete('/:id', submissionController.delete);

module.exports = router;
