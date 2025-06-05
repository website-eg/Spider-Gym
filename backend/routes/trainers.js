const express = require('express');
const router = express.Router();
const trainerController = require('../controllers/trainerController');
const authenticateToken = require('../middleware/authMiddleware');

router.get('/', authenticateToken, trainerController.getAllTrainers);
router.post('/', authenticateToken, trainerController.addTrainer);
router.delete('/:id', authenticateToken, trainerController.deleteTrainer);

module.exports = router;
