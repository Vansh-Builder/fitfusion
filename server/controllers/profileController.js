const { Profile, User, WeightLog, BMIRecord, WaterLog, SleepLog, WorkoutLog, HabitLog, Reward } = require('../models');
const { calculateBMR, calculateTDEE, calculateWaterGoal, calculateBMI } = require('../utils/helpers');
const path = require('path');

// @desc Get profile
const getProfile = async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ where: { user_id: req.user.id } });
    const reward = await Reward.findOne({ where: { user_id: req.user.id } });
    res.json({ success: true, data: { ...profile?.toJSON(), reward } });
  } catch (err) { next(err); }
};

// @desc Update profile
const updateProfile = async (req, res, next) => {
  try {
    const { age, gender, height, weight, goal, activity_level, diet_preference, workout_time, equipment, bio } = req.body;
    let profile = await Profile.findOne({ where: { user_id: req.user.id } });

    const updateData = { age, gender, height, weight, goal, activity_level, diet_preference, workout_time, equipment, bio };

    // Auto-calculate goals
    if (age && height && weight && gender && activity_level) {
      const bmr = calculateBMR(weight, height, age, gender);
      const tdee = calculateTDEE(bmr, activity_level);
      updateData.daily_calories_goal = tdee;
      updateData.daily_water_goal = calculateWaterGoal(weight);
    }

    await profile.update(updateData);

    // Log weight if provided
    if (weight) {
      const today = new Date().toISOString().split('T')[0];
      await WeightLog.findOrCreate({ where: { user_id: req.user.id, date: today }, defaults: { weight } });
      const { bmi, category } = calculateBMI(weight, height || profile.height);
      await BMIRecord.findOrCreate({ where: { user_id: req.user.id, date: today }, defaults: { height: height || profile.height, weight, bmi, category } });
    }

    res.json({ success: true, data: profile, message: 'Profile updated' });
  } catch (err) { next(err); }
};

// @desc Complete wizard
const completeWizard = async (req, res, next) => {
  try {
    const { age, gender, height, weight, goal, activity_level, diet_preference, workout_time, equipment } = req.body;
    const profile = await Profile.findOne({ where: { user_id: req.user.id } });
    const bmr = calculateBMR(weight, height, age, gender);
    const tdee = calculateTDEE(bmr, activity_level);
    let calorieGoal = tdee;
    if (goal === 'lose_weight') calorieGoal = tdee - 500;
    if (goal === 'gain_muscle') calorieGoal = tdee + 300;

    await profile.update({
      age, gender, height, weight, goal, activity_level, diet_preference, workout_time, equipment,
      daily_calories_goal: calorieGoal,
      daily_water_goal: calculateWaterGoal(weight),
      daily_sleep_goal: 8,
      wizard_completed: true,
    });
    await User.update({ is_first_login: false }, { where: { id: req.user.id } });

    // Log initial weight/BMI
    const today = new Date().toISOString().split('T')[0];
    await WeightLog.create({ user_id: req.user.id, weight, date: today });
    const { bmi, category } = calculateBMI(weight, height);
    await BMIRecord.create({ user_id: req.user.id, height, weight, age, bmi, category, date: today });

    res.json({
      success: true,
      message: 'Health goals set up successfully!',
      data: {
        daily_calories_goal: calorieGoal,
        daily_water_goal: calculateWaterGoal(weight),
        bmi, category,
      }
    });
  } catch (err) { next(err); }
};

// @desc Upload profile photo
const uploadPhoto = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
    const photo_url = `/uploads/profiles/${req.file.filename}`;
    await Profile.update({ photo_url }, { where: { user_id: req.user.id } });
    res.json({ success: true, photo_url, message: 'Photo updated' });
  } catch (err) { next(err); }
};

// @desc Get dashboard summary
const getDashboard = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const today = new Date().toISOString().split('T')[0];
    const profile = await Profile.findOne({ where: { user_id: userId } });
    const reward = await Reward.findOne({ where: { user_id: userId } });

    // Today's water
    const waterToday = await WaterLog.findAll({ where: { user_id: userId, date: today } });
    const totalWater = waterToday.reduce((sum, log) => sum + log.amount_ml, 0);

    // Today's sleep (latest)
    const sleepToday = await SleepLog.findOne({ where: { user_id: userId, date: today } });

    // Today's workouts
    const workoutsToday = await WorkoutLog.findAll({ where: { user_id: userId, date: today } });
    const caloriesBurned = workoutsToday.reduce((sum, log) => sum + (log.calories_burned || 0), 0);

    // Habit completion today
    const habitsToday = await HabitLog.findAll({ where: { user_id: userId, date: today } });
    const completedHabits = habitsToday.filter(h => h.completed).length;

    // Last 7 days weight
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const { Op } = require('sequelize');
    const weightLogs = await WeightLog.findAll({
      where: { user_id: userId, date: { [Op.gte]: sevenDaysAgo } },
      order: [['date', 'ASC']]
    });

    // Latest BMI
    const latestBMI = await BMIRecord.findOne({ where: { user_id: userId }, order: [['created_at', 'DESC']] });

    res.json({
      success: true,
      data: {
        profile: {
          daily_calories_goal: profile?.daily_calories_goal || 2000,
          daily_water_goal: profile?.daily_water_goal || 2000,
          daily_sleep_goal: profile?.daily_sleep_goal || 8,
          weight: profile?.weight,
        },
        today: {
          water_ml: totalWater,
          water_percentage: Math.round((totalWater / (profile?.daily_water_goal || 2000)) * 100),
          sleep_hours: sleepToday?.duration || 0,
          sleep_quality: sleepToday?.quality || null,
          calories_burned: caloriesBurned,
          workouts_completed: workoutsToday.filter(w => w.status === 'completed').length,
          habits_completed: completedHabits,
          habits_total: habitsToday.length,
        },
        bmi: latestBMI,
        weight_trend: weightLogs,
        reward: { xp: reward?.xp || 0, level: reward?.level || 1, streak: reward?.streak || 0, badges: reward?.badges || [] },
      }
    });
  } catch (err) { next(err); }
};

module.exports = { getProfile, updateProfile, completeWizard, uploadPhoto, getDashboard };
