const express = require('express');
const router = express.Router();
const institutionController = require('../controllers/institutionController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// Only Super Admin can manage institutions
router.use(authenticate);

router.get('/', authorize('Platform Admin'), institutionController.getAll);
router.get('/history', authorize('Platform Admin'), institutionController.getHistory);
router.get('/:id', authorize('Platform Admin', 'Institution Admin', 'Teacher'), institutionController.getOne);
router.post('/', authorize('Platform Admin'), institutionController.create);
router.put('/:id', authorize('Platform Admin', 'Institution Admin'), institutionController.update);
router.delete('/:id', authorize('Platform Admin'), institutionController.delete);

module.exports = router;
