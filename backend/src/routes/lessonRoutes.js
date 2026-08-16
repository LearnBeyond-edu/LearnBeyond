const express = require('express');
const router = express.Router();
const lessonController = require('../controllers/lessonController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(authenticate);

router.get('/', authorize('Platform Admin', 'Institution Admin', 'Teacher', 'Student', 'Parent'), lessonController.getAll);
router.get('/:id', authorize('Platform Admin', 'Institution Admin', 'Teacher', 'Student', 'Parent'), lessonController.getOne);
router.post('/', authorize('Platform Admin', 'Institution Admin', 'Teacher'), lessonController.create);
router.put('/:id', authorize('Platform Admin', 'Institution Admin', 'Teacher'), lessonController.update);
router.delete('/:id', authorize('Platform Admin', 'Institution Admin', 'Teacher'), lessonController.delete);

module.exports = router;
