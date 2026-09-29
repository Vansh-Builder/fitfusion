// Format numbers
export const formatNumber = (n) => {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n?.toString() || '0';
};

// Format date
export const formatDate = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export const formatTime = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
};

export const formatDateShort = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// Get today's date as YYYY-MM-DD
export const today = () => new Date().toISOString().split('T')[0];

// BMI color
export const getBMIColor = (bmi) => {
  if (!bmi) return 'text-slate-500';
  if (bmi < 18.5) return 'text-blue-500';
  if (bmi < 25) return 'text-emerald-500';
  if (bmi < 30) return 'text-amber-500';
  return 'text-rose-500';
};

// BMI category
export const getBMICategory = (bmi) => {
  if (!bmi) return '-';
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
};

// Sleep quality colors
export const sleepQualityColors = {
  poor: 'text-rose-500',
  fair: 'text-amber-500',
  good: 'text-blue-500',
  excellent: 'text-emerald-500',
};

// Category colors
export const categoryColors = {
  cardio: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
  strength: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
  flexibility: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  hiit: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  yoga: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  pilates: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
  balance: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
  sports: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
};

// Difficulty colors
export const difficultyColors = {
  beginner: 'text-emerald-600 dark:text-emerald-400',
  intermediate: 'text-amber-600 dark:text-amber-400',
  advanced: 'text-rose-600 dark:text-rose-400',
};

// Truncate text
export const truncate = (text, len = 100) => {
  if (!text) return '';
  return text.length > len ? text.substring(0, len) + '...' : text;
};

// Get image URL
export const getImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${url}`;
};

// Avatar from name
export const getInitials = (name) => {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
};

// Validation
export const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// Calculate percentage
export const pct = (value, total) => total ? Math.min(100, Math.round((value / total) * 100)) : 0;

// Days of week
export const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// Motivational quotes
export const QUOTES = [
  "The only bad workout is the one that didn't happen.",
  "Success is the sum of small efforts, repeated day in and day out.",
  "Take care of your body. It's the only place you have to live.",
  "Strength does not come from the body. It comes from the will.",
  "The difference between try and triumph is a little 'umph'.",
  "Push yourself because no one else is going to do it for you.",
  "Your body can stand almost anything. It's your mind you have to convince.",
  "It never gets easier. You just get stronger.",
];

export const getRandomQuote = () => QUOTES[Math.floor(Math.random() * QUOTES.length)];
