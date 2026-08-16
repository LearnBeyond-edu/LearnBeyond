const express = require('express');
const router = express.Router();
const assignmentController = require('../controllers/assignmentController');
const { authenticate } = require('../middleware/authMiddleware');

router.use(authenticate);

router.get('/', assignmentController.getAll);
router.get('/:id', assignmentController.getOne);
router.post('/', assignmentController.create);
router.put('/:id', assignmentController.update);
router.delete('/:id', assignmentController.delete);

module.exports = router;
