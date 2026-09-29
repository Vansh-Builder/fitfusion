const express = require('express');
const router = express.Router();
const { getExercises, getExercise, createExercise, updateExercise, deleteExercise, toggleFavorite, getFavorites } = require('../controllers/exerciseController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', getExercises);
router.get('/favorites', protect, getFavorites);
router.post('/favorites', protect, toggleFavorite);
router.get('/:id', getExercise);
router.post('/', protect, adminOnly, createExercise);
router.put('/:id', protect, adminOnly, updateExercise);
router.delete('/:id', protect, adminOnly, deleteExercise);

module.exports = router;
