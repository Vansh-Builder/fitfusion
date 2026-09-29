const express = require('express');
const router = express.Router();
const workout = require('../controllers/workoutController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/plans', workout.getWorkoutPlans);
router.post('/plans', workout.createPlan);
router.post('/plans/generate', workout.generatePlan);
router.get('/logs', workout.getWorkoutLogs);
router.post('/logs', workout.logWorkout);
router.put('/logs/:id', workout.updateWorkoutLog);

module.exports = router;
