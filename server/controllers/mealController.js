const { Op } = require('sequelize');
const { Meal, MealPlan, MealUpload } = require('../models');

// @desc Get meals
const getMeals = async (req, res, next) => {
  try {
    const { search, category, tags, page = 1, limit = 12 } = req.query;
    const where = {};
    if (search) where.name = { [Op.like]: `%${search}%` };
    if (category) where.category = category;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { count, rows } = await Meal.findAndCountAll({ where, offset, limit: parseInt(limit), order: [['is_featured', 'DESC'], ['name', 'ASC']] });
    res.json({ success: true, data: rows, total: count, page: parseInt(page), pages: Math.ceil(count / limit) });
  } catch (err) { next(err); }
};

// @desc Get meal plan for date
const getMealPlan = async (req, res, next) => {
  try {
    const { date } = req.query;
    const planDate = date || new Date().toISOString().split('T')[0];
    const plans = await MealPlan.findAll({
      where: { user_id: req.user.id, date: planDate },
      include: [{ model: Meal, as: 'meal' }]
    });
    const organized = { breakfast: [], lunch: [], dinner: [], snack: [] };
    plans.forEach(p => organized[p.meal_type]?.push(p));
    res.json({ success: true, data: organized, date: planDate });
  } catch (err) { next(err); }
};

// @desc Add meal to plan
const addMealToPlan = async (req, res, next) => {
  try {
    const { date, meal_type, meal_id } = req.body;
    const plan = await MealPlan.create({ user_id: req.user.id, date, meal_type, meal_id });
    res.status(201).json({ success: true, data: plan, message: 'Meal added to plan!' });
  } catch (err) { next(err); }
};

// @desc Remove from plan
const removeMealFromPlan = async (req, res, next) => {
  try {
    await MealPlan.destroy({ where: { id: req.params.id, user_id: req.user.id } });
    res.json({ success: true, message: 'Meal removed from plan' });
  } catch (err) { next(err); }
};

// @desc Toggle meal completed
const completeMeal = async (req, res, next) => {
  try {
    const plan = await MealPlan.findOne({ where: { id: req.params.id, user_id: req.user.id } });
    if (!plan) return res.status(404).json({ success: false, message: 'Meal plan not found' });
    await plan.update({ completed: !plan.completed });
    res.json({ success: true, data: plan });
  } catch (err) { next(err); }
};

// @desc Upload meal photo
const uploadMeal = async (req, res, next) => {
  try {
    const { meal_name, quantity, calories, protein, fat, carbs, notes } = req.body;
    const image_url = req.file ? `/uploads/meals/${req.file.filename}` : null;
    const upload = await MealUpload.create({
      user_id: req.user.id,
      image_url,
      meal_name,
      quantity,
      calories: parseInt(calories) || null,
      protein: parseFloat(protein) || null,
      fat: parseFloat(fat) || null,
      carbs: parseFloat(carbs) || null,
      date: new Date().toISOString().split('T')[0],
      notes,
    });
    res.status(201).json({ success: true, data: upload, message: 'Meal uploaded successfully!' });
  } catch (err) { next(err); }
};

// @desc Get upload history
const getMealUploadHistory = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { count, rows } = await MealUpload.findAndCountAll({
      where: { user_id: req.user.id }, offset, limit: parseInt(limit),
      order: [['created_at', 'DESC']]
    });
    res.json({ success: true, data: rows, total: count });
  } catch (err) { next(err); }
};

// @desc Create meal (admin)
const createMeal = async (req, res, next) => {
  try {
    const meal = await Meal.create(req.body);
    res.status(201).json({ success: true, data: meal });
  } catch (err) { next(err); }
};

// Seed meals
const seedMeals = async () => {
  const count = await Meal.count();
  if (count > 0) return;
  const meals = [
    { name: 'Oatmeal with Berries', category: 'breakfast', calories: 320, protein: 12, fat: 6, carbs: 58, fiber: 8, description: 'Hearty oats with fresh mixed berries', tags: ['vegetarian', 'vegan', 'high_fiber'], serving_size: '1 bowl', is_featured: true },
    { name: 'Greek Yogurt Parfait', category: 'breakfast', calories: 280, protein: 20, fat: 5, carbs: 40, description: 'Greek yogurt layered with granola and honey', tags: ['vegetarian', 'high_protein'], serving_size: '1 cup', is_featured: true },
    { name: 'Grilled Chicken Salad', category: 'lunch', calories: 380, protein: 45, fat: 12, carbs: 20, description: 'Lean grilled chicken on mixed greens', tags: ['high_protein', 'weight_loss', 'keto'], serving_size: '1 plate', is_featured: true },
    { name: 'Quinoa Buddha Bowl', category: 'lunch', calories: 450, protein: 18, fat: 14, carbs: 65, fiber: 10, description: 'Nutrient-packed quinoa with roasted veggies', tags: ['vegan', 'vegetarian', 'high_fiber'], serving_size: '1 bowl', is_featured: true },
    { name: 'Baked Salmon', category: 'dinner', calories: 520, protein: 55, fat: 28, carbs: 12, description: 'Omega-3 rich salmon with herbs', tags: ['keto', 'high_protein', 'weight_loss'], serving_size: '200g', is_featured: true },
    { name: 'Lentil Soup', category: 'dinner', calories: 350, protein: 22, fat: 4, carbs: 58, fiber: 14, description: 'Hearty lentil soup with vegetables', tags: ['vegan', 'vegetarian', 'high_fiber'], serving_size: '1 bowl', is_featured: false },
    { name: 'Protein Smoothie', category: 'snack', calories: 250, protein: 30, fat: 5, carbs: 25, description: 'High protein blend with banana and protein powder', tags: ['high_protein', 'muscle_gain'], serving_size: '400ml', is_featured: true },
    { name: 'Apple & Almond Butter', category: 'snack', calories: 200, protein: 5, fat: 12, carbs: 25, description: 'Fresh apple slices with almond butter', tags: ['vegetarian', 'vegan'], serving_size: '1 apple + 2 tbsp', is_featured: false },
    { name: 'Chicken & Brown Rice', category: 'dinner', calories: 580, protein: 48, fat: 10, carbs: 70, description: 'Classic muscle building meal', tags: ['high_protein', 'muscle_gain'], serving_size: '1 plate', is_featured: true },
    { name: 'Avocado Toast', category: 'breakfast', calories: 350, protein: 10, fat: 18, carbs: 38, description: 'Whole grain toast with fresh avocado', tags: ['vegetarian', 'vegan', 'keto'], serving_size: '2 slices', is_featured: false },
  ];
  await Meal.bulkCreate(meals);
  console.log('✅ Meals seeded');
};

module.exports = { getMeals, getMealPlan, addMealToPlan, removeMealFromPlan, completeMeal, uploadMeal, getMealUploadHistory, createMeal, seedMeals };
