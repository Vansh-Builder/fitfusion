const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Meal = sequelize.define('Meal', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(200), allowNull: false },
  category: { type: DataTypes.ENUM('breakfast', 'lunch', 'dinner', 'snack'), allowNull: false },
  calories: { type: DataTypes.INTEGER, allowNull: false },
  protein: { type: DataTypes.FLOAT, defaultValue: 0 },
  fat: { type: DataTypes.FLOAT, defaultValue: 0 },
  carbs: { type: DataTypes.FLOAT, defaultValue: 0 },
  fiber: { type: DataTypes.FLOAT, defaultValue: 0 },
  sugar: { type: DataTypes.FLOAT, defaultValue: 0 },
  image_url: { type: DataTypes.STRING(500), allowNull: true },
  description: { type: DataTypes.TEXT, allowNull: true },
  recipe: { type: DataTypes.TEXT, allowNull: true },
  prep_time: { type: DataTypes.INTEGER, allowNull: true, comment: 'in minutes' },
  tags: { type: DataTypes.JSON, allowNull: true, comment: 'vegetarian, vegan, keto, etc.' },
  serving_size: { type: DataTypes.STRING(50), allowNull: true },
  is_featured: { type: DataTypes.BOOLEAN, defaultValue: false },
}, { tableName: 'meals' });

module.exports = Meal;
