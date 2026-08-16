const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');
const { authenticate } = require('../middleware/authMiddleware');

router.use(authenticate);

router.get('/', quizController.getAll);
router.get('/:id', quizController.getOne);
router.post('/', quizController.create);
router.put('/:id', quizController.update);
router.delete('/:id', quizController.delete);

module.exports = router;
