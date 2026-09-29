const { Op } = require('sequelize');
const { Exercise, ExerciseFavorite } = require('../models');

// @desc Get exercises with search, filter, pagination
const getExercises = async (req, res, next) => {
  try {
    const { search, category, difficulty, equipment, muscle_group, page = 1, limit = 12 } = req.query;
    const where = {};
    if (search) where.name = { [Op.like]: `%${search}%` };
    if (category) where.category = category;
    if (difficulty) where.difficulty = difficulty;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { count, rows } = await Exercise.findAndCountAll({
      where, offset, limit: parseInt(limit),
      order: [['is_featured', 'DESC'], ['name', 'ASC']]
    });

    res.json({ success: true, data: rows, total: count, page: parseInt(page), pages: Math.ceil(count / limit) });
  } catch (err) { next(err); }
};

// @desc Get single exercise
const getExercise = async (req, res, next) => {
  try {
    const exercise = await Exercise.findByPk(req.params.id);
    if (!exercise) return res.status(404).json({ success: false, message: 'Exercise not found' });
    res.json({ success: true, data: exercise });
  } catch (err) { next(err); }
};

// @desc Create exercise (admin)
const createExercise = async (req, res, next) => {
  try {
    const exercise = await Exercise.create(req.body);
    res.status(201).json({ success: true, data: exercise, message: 'Exercise created' });
  } catch (err) { next(err); }
};

// @desc Update exercise (admin)
const updateExercise = async (req, res, next) => {
  try {
    const exercise = await Exercise.findByPk(req.params.id);
    if (!exercise) return res.status(404).json({ success: false, message: 'Exercise not found' });
    await exercise.update(req.body);
    res.json({ success: true, data: exercise, message: 'Exercise updated' });
  } catch (err) { next(err); }
};

// @desc Delete exercise (admin)
const deleteExercise = async (req, res, next) => {
  try {
    await Exercise.destroy({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Exercise deleted' });
  } catch (err) { next(err); }
};

// @desc Toggle favorite
const toggleFavorite = async (req, res, next) => {
  try {
    const { exercise_id } = req.body;
    const exists = await ExerciseFavorite.findOne({ where: { user_id: req.user.id, exercise_id } });
    if (exists) {
      await exists.destroy();
      return res.json({ success: true, favorited: false, message: 'Removed from favorites' });
    }
    await ExerciseFavorite.create({ user_id: req.user.id, exercise_id });
    res.json({ success: true, favorited: true, message: 'Added to favorites' });
  } catch (err) { next(err); }
};

// @desc Get user favorites
const getFavorites = async (req, res, next) => {
  try {
    const favorites = await ExerciseFavorite.findAll({
      where: { user_id: req.user.id },
      include: [{ model: Exercise, as: 'exercise' }]
    });
    res.json({ success: true, data: favorites.map(f => f.exercise) });
  } catch (err) { next(err); }
};

// Seed exercises
const seedExercises = async () => {
  const count = await Exercise.count();
  if (count > 0) return;
  const exercises = [
    { name: 'Push-ups', category: 'strength', difficulty: 'beginner', duration: 10, calories_burned: 80, equipment: [], muscle_group: ['chest', 'triceps', 'shoulders'], instructions: 'Start in plank position, lower body until chest touches ground, push back up.', is_featured: true },
    { name: 'Squats', category: 'strength', difficulty: 'beginner', duration: 10, calories_burned: 100, equipment: [], muscle_group: ['quads', 'glutes', 'hamstrings'], instructions: 'Stand with feet shoulder-width apart, lower into squat position, return to standing.', is_featured: true },
    { name: 'Burpees', category: 'hiit', difficulty: 'intermediate', duration: 10, calories_burned: 150, equipment: [], muscle_group: ['full body'], instructions: 'Start standing, drop to squat, kick feet back to plank, do a push-up, return to squat, jump up.', is_featured: true },
    { name: 'Plank', category: 'strength', difficulty: 'beginner', duration: 5, calories_burned: 30, equipment: [], muscle_group: ['core', 'back', 'shoulders'], instructions: 'Hold push-up position with elbows on ground, keep body straight.', is_featured: true },
    { name: 'Jumping Jacks', category: 'cardio', difficulty: 'beginner', duration: 10, calories_burned: 100, equipment: [], muscle_group: ['full body'], instructions: 'Jump while spreading legs and arms, return to starting position.', is_featured: false },
    { name: 'Deadlift', category: 'strength', difficulty: 'advanced', duration: 20, calories_burned: 200, equipment: ['barbell'], muscle_group: ['back', 'glutes', 'hamstrings'], instructions: 'Stand with feet hip-width apart, hinge at hips to grip bar, lift with legs and hips.', is_featured: false },
    { name: 'Running', category: 'cardio', difficulty: 'beginner', duration: 30, calories_burned: 300, equipment: [], muscle_group: ['legs', 'cardiovascular'], instructions: 'Run at a comfortable pace maintaining good posture.', is_featured: true },
    { name: 'Yoga Sun Salutation', category: 'yoga', difficulty: 'beginner', duration: 15, calories_burned: 60, equipment: ['yoga mat'], muscle_group: ['full body'], instructions: 'Flow through 12 yoga poses in sequence with breathing.', is_featured: false },
    { name: 'Bicycle Crunches', category: 'strength', difficulty: 'intermediate', duration: 10, calories_burned: 70, equipment: [], muscle_group: ['core', 'obliques'], instructions: 'Lie on back, bring opposite elbow to knee in cycling motion.', is_featured: false },
    { name: 'Mountain Climbers', category: 'hiit', difficulty: 'intermediate', duration: 10, calories_burned: 120, equipment: [], muscle_group: ['core', 'shoulders', 'legs'], instructions: 'In plank position, alternate driving knees to chest rapidly.', is_featured: true },
  ];
  await Exercise.bulkCreate(exercises);
  console.log('✅ Exercises seeded');
};

module.exports = { getExercises, getExercise, createExercise, updateExercise, deleteExercise, toggleFavorite, getFavorites, seedExercises };
