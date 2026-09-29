const { Op } = require('sequelize');
const { WorkoutPlan, WorkoutLog, Exercise } = require('../models');

// @desc Get user's workout plans
const getWorkoutPlans = async (req, res, next) => {
  try {
    const plans = await WorkoutPlan.findAll({
      where: { user_id: req.user.id }, order: [['created_at', 'DESC']]
    });
    res.json({ success: true, data: plans });
  } catch (err) { next(err); }
};

// @desc Create workout plan
const createPlan = async (req, res, next) => {
  try {
    const { name, description, start_date, end_date, schedule } = req.body;
    const plan = await WorkoutPlan.create({ user_id: req.user.id, name, description, start_date, end_date, schedule });
    res.status(201).json({ success: true, data: plan, message: 'Workout plan created!' });
  } catch (err) { next(err); }
};

// @desc Generate AI workout plan from profile
const generatePlan = async (req, res, next) => {
  try {
    const { goal, activity_level, equipment, days_per_week = 4 } = req.body;

    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const workoutDays = dayNames.slice(0, parseInt(days_per_week));
    const restDays = dayNames.slice(parseInt(days_per_week));

    // Get exercises matching criteria
    const equipmentFilter = equipment && equipment.length ? { equipment: { [Op.overlap]: equipment } } : {};
    const exercises = await Exercise.findAll({ limit: 20 });

    const schedule = {};
    workoutDays.forEach((day, i) => {
      const dayExercises = exercises.slice(i * 3, i * 3 + 3);
      schedule[day] = {
        type: i % 2 === 0 ? 'strength' : 'cardio',
        exercises: dayExercises.map(e => ({ id: e.id, name: e.name, sets: 3, reps: 12, duration: e.duration }))
      };
    });
    restDays.forEach(day => { schedule[day] = { type: 'rest', exercises: [] }; });

    const plan = await WorkoutPlan.create({
      user_id: req.user.id,
      name: `AI Generated ${goal || 'Fitness'} Plan`,
      description: 'Auto-generated based on your fitness profile',
      start_date: new Date().toISOString().split('T')[0],
      is_generated: true,
      schedule,
    });

    res.status(201).json({ success: true, data: plan, message: 'Workout plan generated!' });
  } catch (err) { next(err); }
};

// @desc Log a workout
const logWorkout = async (req, res, next) => {
  try {
    const { exercise_id, date, sets, reps, duration, calories_burned, status, notes, plan_id } = req.body;
    const log = await WorkoutLog.create({
      user_id: req.user.id, exercise_id, date, sets, reps, duration,
      calories_burned, status: status || 'completed', notes, plan_id
    });
    res.status(201).json({ success: true, data: log, message: 'Workout logged!' });
  } catch (err) { next(err); }
};

// @desc Get workout logs
const getWorkoutLogs = async (req, res, next) => {
  try {
    const { date, days = 7 } = req.query;
    let where = { user_id: req.user.id };
    if (date) {
      where.date = date;
    } else {
      const fromDate = new Date(Date.now() - parseInt(days) * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      where.date = { [Op.gte]: fromDate };
    }
    const logs = await WorkoutLog.findAll({
      where, include: [{ model: Exercise, as: 'exercise' }], order: [['date', 'DESC']]
    });
    res.json({ success: true, data: logs });
  } catch (err) { next(err); }
};

// @desc Update workout log status
const updateWorkoutLog = async (req, res, next) => {
  try {
    const log = await WorkoutLog.findOne({ where: { id: req.params.id, user_id: req.user.id } });
    if (!log) return res.status(404).json({ success: false, message: 'Log not found' });
    await log.update(req.body);
    res.json({ success: true, data: log });
  } catch (err) { next(err); }
};

module.exports = { getWorkoutPlans, createPlan, generatePlan, logWorkout, getWorkoutLogs, updateWorkoutLog };
