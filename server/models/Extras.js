const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const MedicalRecord = sequelize.define('MedicalRecord', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  title: { type: DataTypes.STRING(200), allowNull: false },
  file_url: { type: DataTypes.STRING(500), allowNull: true },
  record_date: { type: DataTypes.DATEONLY, allowNull: true },
  notes: { type: DataTypes.TEXT, allowNull: true },
  record_type: { type: DataTypes.ENUM('lab_result', 'prescription', 'report', 'scan', 'other'), defaultValue: 'other' },
}, { tableName: 'medical_records' });

const Medicine = sequelize.define('Medicine', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  name: { type: DataTypes.STRING(200), allowNull: false },
  dosage: { type: DataTypes.STRING(100), allowNull: true },
  frequency: { type: DataTypes.ENUM('once_daily', 'twice_daily', 'thrice_daily', 'weekly', 'as_needed'), allowNull: false },
  reminder_times: { type: DataTypes.JSON, allowNull: true },
  start_date: { type: DataTypes.DATEONLY, allowNull: true },
  end_date: { type: DataTypes.DATEONLY, allowNull: true },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
  notes: { type: DataTypes.TEXT, allowNull: true },
}, { tableName: 'medicines' });

const Appointment = sequelize.define('Appointment', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  doctor_name: { type: DataTypes.STRING(200), allowNull: false },
  specialization: { type: DataTypes.STRING(100), allowNull: true },
  date: { type: DataTypes.DATEONLY, allowNull: false },
  time: { type: DataTypes.TIME, allowNull: true },
  location: { type: DataTypes.STRING(300), allowNull: true },
  notes: { type: DataTypes.TEXT, allowNull: true },
  status: { type: DataTypes.ENUM('scheduled', 'completed', 'cancelled'), defaultValue: 'scheduled' },
}, { tableName: 'appointments' });

const Pantry = sequelize.define('Pantry', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  ingredient_name: { type: DataTypes.STRING(200), allowNull: false },
  quantity: { type: DataTypes.STRING(100), allowNull: true },
  unit: { type: DataTypes.STRING(50), allowNull: true },
  expiry_date: { type: DataTypes.DATEONLY, allowNull: true },
  category: { type: DataTypes.ENUM('protein', 'vegetable', 'fruit', 'grain', 'dairy', 'spice', 'other'), defaultValue: 'other' },
}, { tableName: 'pantry' });

const ShoppingList = sequelize.define('ShoppingList', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  item_name: { type: DataTypes.STRING(200), allowNull: false },
  quantity: { type: DataTypes.STRING(100), allowNull: true },
  category: { type: DataTypes.STRING(100), allowNull: true },
  purchased: { type: DataTypes.BOOLEAN, defaultValue: false },
  source: { type: DataTypes.ENUM('manual', 'meal_plan'), defaultValue: 'manual' },
}, { tableName: 'shopping_lists' });

const FamilyMember = sequelize.define('FamilyMember', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  name: { type: DataTypes.STRING(100), allowNull: false },
  age: { type: DataTypes.INTEGER, allowNull: true },
  gender: { type: DataTypes.ENUM('male', 'female', 'other'), allowNull: true },
  relationship: { type: DataTypes.STRING(50), allowNull: true },
  height: { type: DataTypes.FLOAT, allowNull: true },
  weight: { type: DataTypes.FLOAT, allowNull: true },
  health_notes: { type: DataTypes.TEXT, allowNull: true },
}, { tableName: 'family_members' });

const Reward = sequelize.define('Reward', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false, unique: true },
  xp: { type: DataTypes.INTEGER, defaultValue: 0 },
  level: { type: DataTypes.INTEGER, defaultValue: 1 },
  badges: { type: DataTypes.JSON, defaultValue: [] },
  streak: { type: DataTypes.INTEGER, defaultValue: 0 },
  last_active: { type: DataTypes.DATEONLY, allowNull: true },
  total_workouts: { type: DataTypes.INTEGER, defaultValue: 0 },
  total_challenges_completed: { type: DataTypes.INTEGER, defaultValue: 0 },
}, { tableName: 'rewards' });

const ExerciseFavorite = sequelize.define('ExerciseFavorite', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  exercise_id: { type: DataTypes.INTEGER, allowNull: false },
}, { tableName: 'exercise_favorites' });

const ProgressPhoto = sequelize.define('ProgressPhoto', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  photo_url: { type: DataTypes.STRING(500), allowNull: false },
  date: { type: DataTypes.DATEONLY, allowNull: false },
  notes: { type: DataTypes.TEXT, allowNull: true },
  weight_at_time: { type: DataTypes.FLOAT, allowNull: true },
}, { tableName: 'progress_photos' });

module.exports = {
  MedicalRecord, Medicine, Appointment, Pantry,
  ShoppingList, FamilyMember, Reward, ExerciseFavorite, ProgressPhoto
};
