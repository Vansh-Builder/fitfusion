const { Op } = require('sequelize');
const { Challenge, ChallengeProgress, Reward, User, Profile } = require('../models');

// @desc Get all challenges
const getChallenges = async (req, res, next) => {
  try {
    const challenges = await Challenge.findAll({ where: { is_active: true } });
    // Get user's joined challenges if logged in
    let userProgress = [];
    if (req.user) {
      userProgress = await ChallengeProgress.findAll({ where: { user_id: req.user.id } });
    }
    const data = challenges.map(c => ({
      ...c.toJSON(),
      user_progress: userProgress.find(p => p.challenge_id === c.id) || null,
    }));
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

// @desc Join challenge
const joinChallenge = async (req, res, next) => {
  try {
    const { challenge_id } = req.body;
    const exists = await ChallengeProgress.findOne({ where: { user_id: req.user.id, challenge_id } });
    if (exists) return res.status(409).json({ success: false, message: 'Already joined this challenge' });
    const progress = await ChallengeProgress.create({ user_id: req.user.id, challenge_id });
    res.status(201).json({ success: true, data: progress, message: 'Challenge joined!' });
  } catch (err) { next(err); }
};

// @desc Update challenge progress
const updateProgress = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;
    const progress = await ChallengeProgress.findOne({ where: { id, user_id: req.user.id }, include: [{ model: Challenge, as: 'challenge' }] });
    if (!progress) return res.status(404).json({ success: false, message: 'Progress not found' });

    const today = new Date().toISOString().split('T')[0];
    const dailyLogs = progress.daily_logs || {};
    dailyLogs[today] = (dailyLogs[today] || 0) + parseInt(amount);

    const newTotal = progress.current + parseInt(amount);
    const completed = newTotal >= progress.challenge.target;

    await progress.update({ current: newTotal, daily_logs: dailyLogs, completed, completed_at: completed ? new Date() : null });

    // Award XP if completed
    if (completed && !progress.completed) {
      await Reward.increment({ xp: progress.challenge.xp_reward || 100 }, { where: { user_id: req.user.id } });
    }

    res.json({ success: true, data: progress, completed, message: completed ? '🎉 Challenge completed! XP awarded!' : 'Progress updated!' });
  } catch (err) { next(err); }
};

// @desc Get leaderboard
const getLeaderboard = async (req, res, next) => {
  try {
    const { challenge_id } = req.query;
    const where = { completed: true };
    if (challenge_id) where.challenge_id = challenge_id;

    const leaders = await ChallengeProgress.findAll({
      where,
      include: [{ model: User, as: 'user', attributes: ['id', 'name'], include: [{ model: Profile, as: 'profile', attributes: ['photo_url'] }] }],
      order: [['current', 'DESC']], limit: 20
    });
    res.json({ success: true, data: leaders });
  } catch (err) { next(err); }
};

// Seed challenges
const seedChallenges = async () => {
  const count = await Challenge.count();
  if (count > 0) return;
  const challenges = [
    { title: '30-Day Push-up Challenge', description: 'Build chest and arm strength with daily push-ups', type: 'pushup', duration_days: 30, target: 100, xp_reward: 500, is_active: true },
    { title: '10K Steps Daily', description: 'Walk 10,000 steps every day for 21 days', type: 'steps', duration_days: 21, target: 10000, xp_reward: 400, is_active: true },
    { title: 'Hydration Challenge', description: 'Drink 3L of water daily for 14 days', type: 'water', duration_days: 14, target: 3000, xp_reward: 300, is_active: true },
    { title: '30 Days No Sugar', description: 'Eliminate added sugar from your diet', type: 'no_sugar', duration_days: 30, target: 30, xp_reward: 600, is_active: true },
    { title: '7-Day Meditation', description: 'Meditate for 10 minutes daily', type: 'meditation', duration_days: 7, target: 7, xp_reward: 200, is_active: true },
    { title: '21-Day Workout Streak', description: 'Complete a workout every day for 3 weeks', type: 'workout', duration_days: 21, target: 21, xp_reward: 700, is_active: true },
  ];
  await Challenge.bulkCreate(challenges);
  console.log('✅ Challenges seeded');
};

module.exports = { getChallenges, joinChallenge, updateProgress, getLeaderboard, seedChallenges };
