const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const WaterLog = sequelize.define('WaterLog', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  amount_ml: { type: DataTypes.INTEGER, allowNull: false },
  date: { type: DataTypes.DATEONLY, allowNull: false },
  time: { type: DataTypes.TIME, allowNull: true },
}, { tableName: 'water_logs' });

const SleepLog = sequelize.define('SleepLog', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  sleep_time: { type: DataTypes.DATE, allowNull: false },
  wake_time: { type: DataTypes.DATE, allowNull: false },
  duration: { type: DataTypes.FLOAT, allowNull: false, comment: 'hours' },
  quality: { type: DataTypes.ENUM('poor', 'fair', 'good', 'excellent'), allowNull: false },
  date: { type: DataTypes.DATEONLY, allowNull: false },
  notes: { type: DataTypes.TEXT, allowNull: true },
}, { tableName: 'sleep_logs' });

const HabitLog = sequelize.define('HabitLog', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  habit_name: { type: DataTypes.ENUM('workout', 'water', 'meditation', 'reading', 'sleep', 'fruits', 'no_sugar', 'steps'), allowNull: false },
  completed: { type: DataTypes.BOOLEAN, defaultValue: false },
  date: { type: DataTypes.DATEONLY, allowNull: false },
}, { tableName: 'habit_logs' });

const WeightLog = sequelize.define('WeightLog', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  weight: { type: DataTypes.FLOAT, allowNull: false, comment: 'in kg' },
  date: { type: DataTypes.DATEONLY, allowNull: false },
  notes: { type: DataTypes.TEXT, allowNull: true },
}, { tableName: 'weight_logs' });

const BMIRecord = sequelize.define('BMIRecord', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  height: { type: DataTypes.FLOAT, allowNull: false },
  weight: { type: DataTypes.FLOAT, allowNull: false },
  age: { type: DataTypes.INTEGER, allowNull: true },
  bmi: { type: DataTypes.FLOAT, allowNull: false },
  category: { type: DataTypes.STRING(50), allowNull: false },
  date: { type: DataTypes.DATEONLY, allowNull: false },
}, { tableName: 'bmi_records' });

module.exports = { WaterLog, SleepLog, HabitLog, WeightLog, BMIRecord };
