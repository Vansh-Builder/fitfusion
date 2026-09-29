const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const WorkoutPlan = sequelize.define('WorkoutPlan', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  name: { type: DataTypes.STRING(200), allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: true },
  start_date: { type: DataTypes.DATEONLY, allowNull: false },
  end_date: { type: DataTypes.DATEONLY, allowNull: true },
  is_generated: { type: DataTypes.BOOLEAN, defaultValue: false },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
  schedule: { type: DataTypes.JSON, allowNull: true, comment: 'weekly schedule object' },
}, { tableName: 'workout_plans' });

const WorkoutLog = sequelize.define('WorkoutLog', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  exercise_id: { type: DataTypes.INTEGER, allowNull: false },
  plan_id: { type: DataTypes.INTEGER, allowNull: true },
  date: { type: DataTypes.DATEONLY, allowNull: false },
  sets: { type: DataTypes.INTEGER, allowNull: true },
  reps: { type: DataTypes.INTEGER, allowNull: true },
  duration: { type: DataTypes.INTEGER, allowNull: true, comment: 'in minutes' },
  calories_burned: { type: DataTypes.INTEGER, allowNull: true },
  status: { type: DataTypes.ENUM('completed', 'skipped', 'rescheduled'), defaultValue: 'completed' },
  notes: { type: DataTypes.TEXT, allowNull: true },
}, { tableName: 'workout_logs' });

module.exports = { WorkoutPlan, WorkoutLog };
