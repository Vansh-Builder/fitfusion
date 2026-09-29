const express = require('express');
const router = express.Router();
const health = require('../controllers/healthController');
const { protect } = require('../middleware/auth');
const { uploadProgress } = require('../middleware/upload');

router.use(protect);

// Water
router.post('/water', health.logWater);
router.get('/water/daily', health.getDailyWater);
router.get('/water/weekly', health.getWeeklyWater);
router.delete('/water/:id', health.deleteWaterLog);

// Sleep
router.post('/sleep', health.logSleep);
router.get('/sleep', health.getSleepLogs);

// Habits
router.get('/habits/today', health.getTodayHabits);
router.put('/habits/:id/toggle', health.toggleHabit);
router.get('/habits/:habit/streak', health.getHabitStreak);

// Weight
router.post('/weight', health.logWeight);
router.get('/weight', health.getWeightLogs);

// BMI
router.post('/bmi', health.calculateBMIRecord);
router.get('/bmi', health.getBMIHistory);

// Calories
router.post('/calories/calculate', health.calculateCalories);

// Progress
router.get('/progress', health.getProgressSummary);
router.post('/progress/photo', uploadProgress.single('photo'), health.uploadProgressPhoto);

module.exports = router;
