const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Exercise = sequelize.define('Exercise', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(200), allowNull: false },
  category: { type: DataTypes.ENUM('cardio', 'strength', 'flexibility', 'balance', 'hiit', 'yoga', 'pilates', 'sports'), allowNull: false },
  difficulty: { type: DataTypes.ENUM('beginner', 'intermediate', 'advanced'), allowNull: false },
  duration: { type: DataTypes.INTEGER, allowNull: false, comment: 'in minutes' },
  calories_burned: { type: DataTypes.INTEGER, allowNull: false, comment: 'per session' },
  equipment: { type: DataTypes.JSON, allowNull: true },
  muscle_group: { type: DataTypes.JSON, allowNull: true },
  video_url: { type: DataTypes.STRING(500), allowNull: true },
  thumbnail_url: { type: DataTypes.STRING(500), allowNull: true },
  instructions: { type: DataTypes.TEXT, allowNull: true },
  description: { type: DataTypes.TEXT, allowNull: true },
  sets: { type: DataTypes.INTEGER, allowNull: true },
  reps: { type: DataTypes.INTEGER, allowNull: true },
  rest_seconds: { type: DataTypes.INTEGER, allowNull: true },
  is_featured: { type: DataTypes.BOOLEAN, defaultValue: false },
}, { tableName: 'exercises' });

module.exports = Exercise;
