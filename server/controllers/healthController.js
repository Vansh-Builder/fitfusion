const { Op } = require('sequelize');
const { WaterLog, SleepLog, HabitLog, WeightLog, BMIRecord, ProgressPhoto } = require('../models');
const { calculateBMI, calculateBMR, calculateTDEE } = require('../utils/helpers');

// ===== WATER TRACKER =====
const logWater = async (req, res, next) => {
  try {
    const { amount_ml, date } = req.body;
    const today = date || new Date().toISOString().split('T')[0];
    const log = await WaterLog.create({ user_id: req.user.id, amount_ml, date: today });
    res.status(201).json({ success: true, data: log, message: `${amount_ml}ml logged!` });
  } catch (err) { next(err); }
};

const getDailyWater = async (req, res, next) => {
  try {
    const date = req.query.date || new Date().toISOString().split('T')[0];
    const logs = await WaterLog.findAll({ where: { user_id: req.user.id, date }, order: [['created_at', 'ASC']] });
    const total = logs.reduce((sum, l) => sum + l.amount_ml, 0);
    res.json({ success: true, data: { logs, total, date } });
  } catch (err) { next(err); }
};

const getWeeklyWater = async (req, res, next) => {
  try {
    const { sequelize } = require('../config/db');
    const sevenDaysAgo = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const logs = await WaterLog.findAll({
      where: { user_id: req.user.id, date: { [Op.gte]: sevenDaysAgo } },
      attributes: ['date', [sequelize.fn('SUM', sequelize.col('amount_ml')), 'total']],
      group: ['date'], order: [['date', 'ASC']]
    });
    res.json({ success: true, data: logs });
  } catch (err) { next(err); }
};

const deleteWaterLog = async (req, res, next) => {
  try {
    await WaterLog.destroy({ where: { id: req.params.id, user_id: req.user.id } });
    res.json({ success: true, message: 'Water log removed' });
  } catch (err) { next(err); }
};

// ===== SLEEP TRACKER =====
const logSleep = async (req, res, next) => {
  try {
    const { sleep_time, wake_time, quality, notes } = req.body;
    const sleep = new Date(sleep_time);
    const wake = new Date(wake_time);
    let duration = (wake - sleep) / (1000 * 60 * 60);
    if (duration < 0) duration += 24;
    const date = wake.toISOString().split('T')[0];
    const log = await SleepLog.create({ user_id: req.user.id, sleep_time, wake_time, duration: parseFloat(duration.toFixed(1)), quality, date, notes });
    res.status(201).json({ success: true, data: log, message: 'Sleep logged!' });
  } catch (err) { next(err); }
};

const getSleepLogs = async (req, res, next) => {
  try {
    const { period = 'week' } = req.query;
    const daysBack = period === 'month' ? 30 : 7;
    const fromDate = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const logs = await SleepLog.findAll({
      where: { user_id: req.user.id, date: { [Op.gte]: fromDate } },
      order: [['date', 'ASC']]
    });
    const avg = logs.length ? (logs.reduce((s, l) => s + l.duration, 0) / logs.length).toFixed(1) : 0;
    res.json({ success: true, data: logs, average_duration: parseFloat(avg) });
  } catch (err) { next(err); }
};

// ===== HABIT TRACKER =====
const getTodayHabits = async (req, res, next) => {
  try {
    const date = new Date().toISOString().split('T')[0];
    const habits = ['workout', 'water', 'meditation', 'reading', 'sleep', 'fruits', 'no_sugar', 'steps'];
    const logs = await HabitLog.findAll({ where: { user_id: req.user.id, date } });
    const existingHabits = new Set(logs.map(l => l.habit_name));

    // Create missing habits for today
    const missing = habits.filter(h => !existingHabits.has(h));
    if (missing.length > 0) {
      await HabitLog.bulkCreate(missing.map(h => ({ user_id: req.user.id, habit_name: h, completed: false, date })));
    }

    const allLogs = await HabitLog.findAll({ where: { user_id: req.user.id, date } });
    res.json({ success: true, data: allLogs, date });
  } catch (err) { next(err); }
};

const toggleHabit = async (req, res, next) => {
  try {
    const habit = await HabitLog.findOne({ where: { id: req.params.id, user_id: req.user.id } });
    if (!habit) return res.status(404).json({ success: false, message: 'Habit not found' });
    await habit.update({ completed: !habit.completed });
    res.json({ success: true, data: habit, message: habit.completed ? 'Habit completed!' : 'Habit unchecked' });
  } catch (err) { next(err); }
};

const getHabitStreak = async (req, res, next) => {
  try {
    const logs = await HabitLog.findAll({
      where: { user_id: req.user.id, habit_name: req.params.habit, completed: true },
      order: [['date', 'DESC']], limit: 30
    });
    let streak = 0;
    const today = new Date().toISOString().split('T')[0];
    for (let i = 0; i < logs.length; i++) {
      const expected = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      if (logs[i].date === expected) streak++;
      else break;
    }
    res.json({ success: true, streak });
  } catch (err) { next(err); }
};

// ===== WEIGHT LOG =====
const logWeight = async (req, res, next) => {
  try {
    const { weight, date, notes } = req.body;
    const today = date || new Date().toISOString().split('T')[0];
    const [log, created] = await WeightLog.findOrCreate({
      where: { user_id: req.user.id, date: today },
      defaults: { weight, notes }
    });
    if (!created) await log.update({ weight, notes });
    res.json({ success: true, data: log, message: 'Weight logged!' });
  } catch (err) { next(err); }
};

const getWeightLogs = async (req, res, next) => {
  try {
    const { days = 30 } = req.query;
    const fromDate = new Date(Date.now() - parseInt(days) * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const logs = await WeightLog.findAll({
      where: { user_id: req.user.id, date: { [Op.gte]: fromDate } },
      order: [['date', 'ASC']]
    });
    res.json({ success: true, data: logs });
  } catch (err) { next(err); }
};

// ===== BMI =====
const calculateBMIRecord = async (req, res, next) => {
  try {
    const { height, weight, age } = req.body;
    const { bmi, category } = calculateBMI(weight, height);
    const date = new Date().toISOString().split('T')[0];
    const record = await BMIRecord.create({ user_id: req.user.id, height, weight, age, bmi, category, date });
    const suggestions = {
      'Underweight': ['Increase caloric intake', 'Focus on protein-rich foods', 'Strength training'],
      'Normal weight': ['Maintain current diet', 'Regular exercise routine', 'Stay hydrated'],
      'Overweight': ['Reduce caloric intake by 500/day', 'Increase cardio activity', 'Avoid processed foods'],
      'Obese': ['Consult a healthcare provider', 'Low-impact exercises like walking', 'Structured meal plan'],
    };
    res.json({ success: true, data: record, suggestions: suggestions[category] || [] });
  } catch (err) { next(err); }
};

const getBMIHistory = async (req, res, next) => {
  try {
    const records = await BMIRecord.findAll({ where: { user_id: req.user.id }, order: [['date', 'DESC']], limit: 20 });
    res.json({ success: true, data: records });
  } catch (err) { next(err); }
};

// ===== CALORIE CALCULATOR =====
const calculateCalories = async (req, res, next) => {
  try {
    const { weight, height, age, gender, activity_level } = req.body;
    const bmr = calculateBMR(weight, height, age, gender);
    const tdee = calculateTDEE(bmr, activity_level);
    res.json({
      success: true,
      data: {
        bmr,
        maintenance: tdee,
        weight_loss: tdee - 500,
        mild_weight_loss: tdee - 250,
        weight_gain: tdee + 300,
        bulk: tdee + 500,
      }
    });
  } catch (err) { next(err); }
};

// ===== PROGRESS =====
const getProgressSummary = async (req, res, next) => {
  try {
    const { days = 30 } = req.query;
    const fromDate = new Date(Date.now() - parseInt(days) * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const userId = req.user.id;

    const [weightLogs, waterLogs, sleepLogs, bmiRecords, photos] = await Promise.all([
      WeightLog.findAll({ where: { user_id: userId, date: { [Op.gte]: fromDate } }, order: [['date', 'ASC']] }),
      WaterLog.findAll({ where: { user_id: userId, date: { [Op.gte]: fromDate } }, order: [['date', 'ASC']] }),
      SleepLog.findAll({ where: { user_id: userId, date: { [Op.gte]: fromDate } }, order: [['date', 'ASC']] }),
      BMIRecord.findAll({ where: { user_id: userId }, order: [['date', 'ASC']] }),
      ProgressPhoto.findAll({ where: { user_id: userId }, order: [['date', 'ASC']] }),
    ]);

    res.json({ success: true, data: { weightLogs, waterLogs, sleepLogs, bmiRecords, photos } });
  } catch (err) { next(err); }
};

// ===== PROGRESS PHOTOS =====
const uploadProgressPhoto = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No photo uploaded' });
    const { notes, weight_at_time } = req.body;
    const photo = await ProgressPhoto.create({
      user_id: req.user.id,
      photo_url: `/uploads/progress/${req.file.filename}`,
      date: new Date().toISOString().split('T')[0],
      notes,
      weight_at_time,
    });
    res.status(201).json({ success: true, data: photo, message: 'Progress photo uploaded!' });
  } catch (err) { next(err); }
};

module.exports = {
  logWater, getDailyWater, getWeeklyWater, deleteWaterLog,
  logSleep, getSleepLogs,
  getTodayHabits, toggleHabit, getHabitStreak,
  logWeight, getWeightLogs,
  calculateBMIRecord, getBMIHistory,
  calculateCalories,
  getProgressSummary, uploadProgressPhoto,
};
