const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Profile = sequelize.define('Profile', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false, unique: true },
  age: { type: DataTypes.INTEGER, allowNull: true },
  gender: { type: DataTypes.ENUM('male', 'female', 'other'), allowNull: true },
  height: { type: DataTypes.FLOAT, allowNull: true, comment: 'in cm' },
  weight: { type: DataTypes.FLOAT, allowNull: true, comment: 'in kg' },
  goal: { type: DataTypes.ENUM('lose_weight', 'gain_muscle', 'maintain', 'improve_fitness', 'eat_healthy'), allowNull: true },
  activity_level: { type: DataTypes.ENUM('sedentary', 'light', 'moderate', 'active', 'very_active'), allowNull: true },
  diet_preference: { type: DataTypes.ENUM('none', 'vegetarian', 'vegan', 'keto', 'paleo', 'mediterranean'), defaultValue: 'none' },
  workout_time: { type: DataTypes.ENUM('morning', 'afternoon', 'evening', 'night'), allowNull: true },
  equipment: { type: DataTypes.JSON, allowNull: true, comment: 'array of equipment user has' },
  photo_url: { type: DataTypes.STRING(500), allowNull: true },
  daily_calories_goal: { type: DataTypes.INTEGER, allowNull: true },
  daily_water_goal: { type: DataTypes.INTEGER, defaultValue: 2000, comment: 'in ml' },
  daily_sleep_goal: { type: DataTypes.FLOAT, defaultValue: 8, comment: 'in hours' },
  bio: { type: DataTypes.TEXT, allowNull: true },
  wizard_completed: { type: DataTypes.BOOLEAN, defaultValue: false },
}, { tableName: 'profiles' });

module.exports = Profile;
