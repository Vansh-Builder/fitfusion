const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Challenge = sequelize.define('Challenge', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING(200), allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: true },
  type: { type: DataTypes.ENUM('pushup', 'steps', 'water', 'no_sugar', 'sleep', 'meditation', 'workout'), allowNull: false },
  duration_days: { type: DataTypes.INTEGER, allowNull: false },
  target: { type: DataTypes.INTEGER, allowNull: false, comment: 'daily target value' },
  badge_url: { type: DataTypes.STRING(500), allowNull: true },
  image_url: { type: DataTypes.STRING(500), allowNull: true },
  xp_reward: { type: DataTypes.INTEGER, defaultValue: 100 },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
}, { tableName: 'challenges' });

const ChallengeProgress = sequelize.define('ChallengeProgress', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  challenge_id: { type: DataTypes.INTEGER, allowNull: false },
  current: { type: DataTypes.INTEGER, defaultValue: 0 },
  streak: { type: DataTypes.INTEGER, defaultValue: 0 },
  completed: { type: DataTypes.BOOLEAN, defaultValue: false },
  joined_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  completed_at: { type: DataTypes.DATE, allowNull: true },
  daily_logs: { type: DataTypes.JSON, allowNull: true },
}, { tableName: 'challenge_progress' });

module.exports = { Challenge, ChallengeProgress };
