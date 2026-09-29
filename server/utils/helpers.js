const jwt = require('jsonwebtoken');

const generateToken = (id, role) =>
  jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

const generateRefreshToken = (id) =>
  jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '30d' });

// BMI calculation
const calculateBMI = (weight, height) => {
  const h = height / 100; // cm to m
  const bmi = weight / (h * h);
  let category = '';
  if (bmi < 18.5) category = 'Underweight';
  else if (bmi < 25) category = 'Normal weight';
  else if (bmi < 30) category = 'Overweight';
  else category = 'Obese';
  return { bmi: parseFloat(bmi.toFixed(1)), category };
};

// BMR calculation (Mifflin-St Jeor Equation)
const calculateBMR = (weight, height, age, gender) => {
  let bmr;
  if (gender === 'male') bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  else bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  return Math.round(bmr);
};

const activityMultipliers = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

const calculateTDEE = (bmr, activityLevel) =>
  Math.round(bmr * (activityMultipliers[activityLevel] || 1.55));

// Water goal based on weight
const calculateWaterGoal = (weight) => Math.round(weight * 33); // ml

// XP/level system
const calculateLevel = (xp) => Math.floor(xp / 100) + 1;

// Sleep duration from times
const calculateSleepDuration = (sleepTime, wakeTime) => {
  const sleep = new Date(sleepTime);
  const wake = new Date(wakeTime);
  let diff = (wake - sleep) / (1000 * 60 * 60);
  if (diff < 0) diff += 24;
  return parseFloat(diff.toFixed(1));
};

// Nutrition score (0-100)
const calculateNutritionScore = (calories, protein, fat, carbs, dailyGoal) => {
  let score = 100;
  const calorieRatio = calories / (dailyGoal || 2000);
  if (calorieRatio > 1.2 || calorieRatio < 0.6) score -= 20;
  const proteinGoal = (dailyGoal || 2000) * 0.25 / 4;
  if (protein < proteinGoal * 0.7) score -= 15;
  const fatGoal = (dailyGoal || 2000) * 0.30 / 9;
  if (fat > fatGoal * 1.3) score -= 10;
  return Math.max(0, Math.min(100, score));
};

module.exports = {
  generateToken, generateRefreshToken,
  calculateBMI, calculateBMR, calculateTDEE,
  calculateWaterGoal, calculateLevel,
  calculateSleepDuration, calculateNutritionScore
};
