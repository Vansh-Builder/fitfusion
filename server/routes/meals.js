const express = require('express');
const router = express.Router();
const meal = require('../controllers/mealController');
const { protect, adminOnly } = require('../middleware/auth');
const { uploadMeal } = require('../middleware/upload');

// Public
router.get('/', meal.getMeals);

// Protected
router.use(protect);
router.get('/plan', meal.getMealPlan);
router.post('/plan', meal.addMealToPlan);
router.delete('/plan/:id', meal.removeMealFromPlan);
router.put('/plan/:id/complete', meal.completeMeal);
router.post('/upload', uploadMeal.single('image'), meal.uploadMeal);
router.get('/uploads', meal.getMealUploadHistory);

// Admin
router.post('/', adminOnly, meal.createMeal);

module.exports = router;
