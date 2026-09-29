const { Op } = require('sequelize');
const { User, Profile, Exercise, Meal, Challenge, Blog, CommunityPost, WorkoutLog, WaterLog, SleepLog } = require('../models');
const { sequelize } = require('../config/db');
const bcrypt = require('bcryptjs');

// @desc Admin dashboard stats
const getStats = async (req, res, next) => {
  try {
    const totalUsers = await User.count({ where: { role: 'user' } });
    const totalExercises = await Exercise.count();
    const totalMeals = await Meal.count();
    const totalChallenges = await Challenge.count();
    const totalPosts = await CommunityPost.count({ where: { is_active: true } });
    const totalBlogs = await Blog.count({ where: { is_published: true } });

    // New users in last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const newUsers = await User.count({ where: { created_at: { [Op.gte]: thirtyDaysAgo } } });

    // Activity stats
    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
    const todayWorkouts = await WorkoutLog.count({ where: { created_at: { [Op.gte]: todayStart } } });

    res.json({
      success: true, data: {
        totalUsers, totalExercises, totalMeals, totalChallenges,
        totalPosts, totalBlogs, newUsers, todayWorkouts,
      }
    });
  } catch (err) { next(err); }
};

// @desc Get all users
const getUsers = async (req, res, next) => {
  try {
    const { search, page = 1, limit = 15 } = req.query;
    const where = { role: 'user' };
    if (search) where[Op.or] = [{ name: { [Op.like]: `%${search}%` } }, { email: { [Op.like]: `%${search}%` } }];
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { count, rows } = await User.findAndCountAll({
      where, offset, limit: parseInt(limit),
      attributes: { exclude: ['password_hash', 'verification_token', 'reset_token'] },
      include: [{ model: Profile, as: 'profile', attributes: ['goal', 'weight', 'wizard_completed'] }],
      order: [['created_at', 'DESC']]
    });
    res.json({ success: true, data: rows, total: count });
  } catch (err) { next(err); }
};

// @desc Toggle user active status
const toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    await user.update({ is_active: !user.is_active });
    res.json({ success: true, message: `User ${user.is_active ? 'activated' : 'deactivated'}` });
  } catch (err) { next(err); }
};

// @desc Create admin account
const createAdmin = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const password_hash = await bcrypt.hash(password, 12);
    const admin = await User.create({ name, email, password_hash, role: 'admin', is_verified: true });
    await Profile.create({ user_id: admin.id });
    res.status(201).json({ success: true, message: 'Admin created', data: { id: admin.id, name: admin.name, email: admin.email } });
  } catch (err) { next(err); }
};

// @desc Get all community posts (admin)
const adminGetPosts = async (req, res, next) => {
  try {
    const posts = await CommunityPost.findAll({
      include: [{ model: User, as: 'author', attributes: ['id', 'name', 'email'] }],
      order: [['created_at', 'DESC']], limit: 50
    });
    res.json({ success: true, data: posts });
  } catch (err) { next(err); }
};

// @desc Delete any post (admin)
const adminDeletePost = async (req, res, next) => {
  try {
    await CommunityPost.update({ is_active: false }, { where: { id: req.params.id } });
    res.json({ success: true, message: 'Post removed' });
  } catch (err) { next(err); }
};

// @desc Monthly user registration chart data
const getUserGrowthChart = async (req, res, next) => {
  try {
    const data = await User.findAll({
      attributes: [
        [sequelize.fn('MONTH', sequelize.col('created_at')), 'month'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      where: { created_at: { [Op.gte]: new Date(new Date().getFullYear(), 0, 1) } },
      group: [sequelize.fn('MONTH', sequelize.col('created_at'))],
      order: [[sequelize.fn('MONTH', sequelize.col('created_at')), 'ASC']]
    });
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

module.exports = { getStats, getUsers, toggleUserStatus, createAdmin, adminGetPosts, adminDeletePost, getUserGrowthChart };
