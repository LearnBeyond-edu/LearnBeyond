const express = require('express');
const router = express.Router();
const classController = require('../controllers/classController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(authenticate);

router.get('/', authorize('Platform Admin', 'Institution Admin', 'Teacher', 'Student', 'Parent'), classController.getAll);
router.get('/:id', authorize('Platform Admin', 'Institution Admin', 'Teacher', 'Student', 'Parent'), classController.getOne);
router.post('/', authorize('Platform Admin', 'Institution Admin'), classController.create);
router.put('/:id', authorize('Platform Admin', 'Institution Admin'), classController.update);
router.delete('/:id', authorize('Platform Admin', 'Institution Admin'), classController.delete);

module.exports = router;
