const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const MealPlan = sequelize.define('MealPlan', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  date: { type: DataTypes.DATEONLY, allowNull: false },
  meal_type: { type: DataTypes.ENUM('breakfast', 'lunch', 'dinner', 'snack'), allowNull: false },
  meal_id: { type: DataTypes.INTEGER, allowNull: false },
  completed: { type: DataTypes.BOOLEAN, defaultValue: false },
}, { tableName: 'meal_plans' });

const MealUpload = sequelize.define('MealUpload', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  image_url: { type: DataTypes.STRING(500), allowNull: true },
  meal_name: { type: DataTypes.STRING(200), allowNull: false },
  quantity: { type: DataTypes.STRING(100), allowNull: true },
  calories: { type: DataTypes.INTEGER, allowNull: true },
  protein: { type: DataTypes.FLOAT, allowNull: true },
  fat: { type: DataTypes.FLOAT, allowNull: true },
  carbs: { type: DataTypes.FLOAT, allowNull: true },
  date: { type: DataTypes.DATEONLY, allowNull: false },
  notes: { type: DataTypes.TEXT, allowNull: true },
}, { tableName: 'meal_uploads' });

module.exports = { MealPlan, MealUpload };
