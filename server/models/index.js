const User = require('./User');
const Profile = require('./Profile');
const Exercise = require('./Exercise');
const Meal = require('./Meal');
const { WorkoutPlan, WorkoutLog } = require('./Workout');
const { MealPlan, MealUpload } = require('./MealPlan');
const { WaterLog, SleepLog, HabitLog, WeightLog, BMIRecord } = require('./HealthLogs');
const { Challenge, ChallengeProgress } = require('./Challenge');
const { CommunityPost, Comment, Like, Follow, Blog, Notification } = require('./Social');
const {
  MedicalRecord, Medicine, Appointment, Pantry,
  ShoppingList, FamilyMember, Reward, ExerciseFavorite, ProgressPhoto
} = require('./Extras');

// User associations
User.hasOne(Profile, { foreignKey: 'user_id', as: 'profile', onDelete: 'CASCADE' });
Profile.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasMany(WorkoutLog, { foreignKey: 'user_id', as: 'workoutLogs' });
User.hasMany(WorkoutPlan, { foreignKey: 'user_id', as: 'workoutPlans' });
User.hasMany(MealPlan, { foreignKey: 'user_id', as: 'mealPlans' });
User.hasMany(MealUpload, { foreignKey: 'user_id', as: 'mealUploads' });
User.hasMany(WaterLog, { foreignKey: 'user_id', as: 'waterLogs' });
User.hasMany(SleepLog, { foreignKey: 'user_id', as: 'sleepLogs' });
User.hasMany(HabitLog, { foreignKey: 'user_id', as: 'habitLogs' });
User.hasMany(WeightLog, { foreignKey: 'user_id', as: 'weightLogs' });
User.hasMany(BMIRecord, { foreignKey: 'user_id', as: 'bmiRecords' });
User.hasMany(ChallengeProgress, { foreignKey: 'user_id', as: 'challengeProgress' });
User.hasMany(CommunityPost, { foreignKey: 'user_id', as: 'posts' });
User.hasMany(Comment, { foreignKey: 'user_id', as: 'comments' });
User.hasMany(Blog, { foreignKey: 'author_id', as: 'blogs' });
User.hasMany(Notification, { foreignKey: 'user_id', as: 'notifications' });
User.hasMany(MedicalRecord, { foreignKey: 'user_id', as: 'medicalRecords' });
User.hasMany(Medicine, { foreignKey: 'user_id', as: 'medicines' });
User.hasMany(Appointment, { foreignKey: 'user_id', as: 'appointments' });
User.hasMany(Pantry, { foreignKey: 'user_id', as: 'pantry' });
User.hasMany(ShoppingList, { foreignKey: 'user_id', as: 'shoppingList' });
User.hasMany(FamilyMember, { foreignKey: 'user_id', as: 'familyMembers' });
User.hasOne(Reward, { foreignKey: 'user_id', as: 'reward' });
User.hasMany(ExerciseFavorite, { foreignKey: 'user_id', as: 'favorites' });
User.hasMany(ProgressPhoto, { foreignKey: 'user_id', as: 'progressPhotos' });

// Exercise associations
Exercise.hasMany(WorkoutLog, { foreignKey: 'exercise_id', as: 'logs' });
Exercise.hasMany(ExerciseFavorite, { foreignKey: 'exercise_id', as: 'favoritedBy' });
WorkoutLog.belongsTo(Exercise, { foreignKey: 'exercise_id', as: 'exercise' });
WorkoutLog.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Meal associations
Meal.hasMany(MealPlan, { foreignKey: 'meal_id', as: 'plans' });
MealPlan.belongsTo(Meal, { foreignKey: 'meal_id', as: 'meal' });
MealPlan.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Community
CommunityPost.hasMany(Comment, { foreignKey: 'post_id', as: 'comments' });
CommunityPost.hasMany(Like, { foreignKey: 'post_id', as: 'likes' });
CommunityPost.belongsTo(User, { foreignKey: 'user_id', as: 'author' });
Comment.belongsTo(User, { foreignKey: 'user_id', as: 'author' });
Comment.belongsTo(CommunityPost, { foreignKey: 'post_id', as: 'post' });
Like.belongsTo(User, { foreignKey: 'user_id' });

// Challenge
Challenge.hasMany(ChallengeProgress, { foreignKey: 'challenge_id', as: 'progress' });
ChallengeProgress.belongsTo(Challenge, { foreignKey: 'challenge_id', as: 'challenge' });
ChallengeProgress.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Blog
Blog.belongsTo(User, { foreignKey: 'author_id', as: 'author' });

// Follow
User.belongsToMany(User, {
  through: Follow,
  as: 'followers',
  foreignKey: 'following_id',
  otherKey: 'follower_id',
});
User.belongsToMany(User, {
  through: Follow,
  as: 'following',
  foreignKey: 'follower_id',
  otherKey: 'following_id',
});

module.exports = {
  User, Profile, Exercise, Meal,
  WorkoutPlan, WorkoutLog,
  MealPlan, MealUpload,
  WaterLog, SleepLog, HabitLog, WeightLog, BMIRecord,
  Challenge, ChallengeProgress,
  CommunityPost, Comment, Like, Follow, Blog, Notification,
  MedicalRecord, Medicine, Appointment, Pantry,
  ShoppingList, FamilyMember, Reward, ExerciseFavorite, ProgressPhoto
};
