import api from './axios';

// Auth
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  getMe: () => api.get('/auth/me'),
  changePassword: (data) => api.put('/auth/change-password', data),
};

// Profile
export const profileAPI = {
  get: () => api.get('/profile'),
  update: (data) => api.put('/profile', data),
  completeWizard: (data) => api.post('/profile/wizard', data),
  uploadPhoto: (form) => api.post('/profile/photo', form, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getDashboard: () => api.get('/profile/dashboard'),
};

// Exercises
export const exerciseAPI = {
  getAll: (params) => api.get('/exercises', { params }),
  getOne: (id) => api.get(`/exercises/${id}`),
  create: (data) => api.post('/exercises', data),
  update: (id, data) => api.put(`/exercises/${id}`, data),
  delete: (id) => api.delete(`/exercises/${id}`),
  getFavorites: () => api.get('/exercises/favorites'),
  toggleFavorite: (exercise_id) => api.post('/exercises/favorites', { exercise_id }),
};

// Health
export const healthAPI = {
  logWater: (data) => api.post('/health/water', data),
  getDailyWater: (date) => api.get('/health/water/daily', { params: { date } }),
  getWeeklyWater: () => api.get('/health/water/weekly'),
  deleteWaterLog: (id) => api.delete(`/health/water/${id}`),
  logSleep: (data) => api.post('/health/sleep', data),
  getSleepLogs: (period) => api.get('/health/sleep', { params: { period } }),
  getTodayHabits: () => api.get('/health/habits/today'),
  toggleHabit: (id) => api.put(`/health/habits/${id}/toggle`),
  getHabitStreak: (habit) => api.get(`/health/habits/${habit}/streak`),
  logWeight: (data) => api.post('/health/weight', data),
  getWeightLogs: (days) => api.get('/health/weight', { params: { days } }),
  calculateBMI: (data) => api.post('/health/bmi', data),
  getBMIHistory: () => api.get('/health/bmi'),
  calculateCalories: (data) => api.post('/health/calories/calculate', data),
  getProgress: (days) => api.get('/health/progress', { params: { days } }),
  uploadProgressPhoto: (form) => api.post('/health/progress/photo', form, { headers: { 'Content-Type': 'multipart/form-data' } }),
};

// Meals
export const mealAPI = {
  getAll: (params) => api.get('/meals', { params }),
  getMealPlan: (date) => api.get('/meals/plan', { params: { date } }),
  addToMealPlan: (data) => api.post('/meals/plan', data),
  removeFromPlan: (id) => api.delete(`/meals/plan/${id}`),
  completeMeal: (id) => api.put(`/meals/plan/${id}/complete`),
  uploadMeal: (form) => api.post('/meals/upload', form, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getUploadHistory: (params) => api.get('/meals/uploads', { params }),
};

// Workout
export const workoutAPI = {
  getPlans: () => api.get('/workout/plans'),
  createPlan: (data) => api.post('/workout/plans', data),
  generatePlan: (data) => api.post('/workout/plans/generate', data),
  getLogs: (params) => api.get('/workout/logs', { params }),
  logWorkout: (data) => api.post('/workout/logs', data),
  updateLog: (id, data) => api.put(`/workout/logs/${id}`, data),
};

// Community
export const communityAPI = {
  getPosts: (params) => api.get('/community/posts', { params }),
  createPost: (form) => api.post('/community/posts', form, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deletePost: (id) => api.delete(`/community/posts/${id}`),
  getComments: (postId) => api.get(`/community/posts/${postId}/comments`),
  addComment: (postId, data) => api.post(`/community/posts/${postId}/comments`, data),
  toggleLike: (postId) => api.post(`/community/posts/${postId}/like`),
  toggleFollow: (userId) => api.post(`/community/follow/${userId}`),
  getNotifications: () => api.get('/community/notifications'),
  markNotificationsRead: () => api.put('/community/notifications/read'),
};

// Challenges
export const challengeAPI = {
  getAll: () => api.get('/challenges'),
  join: (challenge_id) => api.post('/challenges/join', { challenge_id }),
  updateProgress: (id, amount) => api.put(`/challenges/progress/${id}`, { amount }),
  getLeaderboard: (challenge_id) => api.get('/challenges/leaderboard', { params: { challenge_id } }),
};

// Blogs
export const blogAPI = {
  getAll: (params) => api.get('/blogs', { params }),
  getOne: (id) => api.get(`/blogs/${id}`),
  create: (form) => api.post('/blogs', form, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, data) => api.put(`/blogs/${id}`, data),
  delete: (id) => api.delete(`/blogs/${id}`),
};

// AI
export const aiAPI = {
  chat: (message) => api.post('/ai/chat', { message }),
};

// Admin
export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getUsers: (params) => api.get('/admin/users', { params }),
  toggleUserStatus: (id) => api.put(`/admin/users/${id}/toggle`),
  getPosts: () => api.get('/admin/posts'),
  deletePost: (id) => api.delete(`/admin/posts/${id}`),
  getGrowthChart: () => api.get('/admin/growth'),
};

// Extras
export const extrasAPI = {
  getMedicalRecords: () => api.get('/extras/medical'),
  addMedicalRecord: (form) => api.post('/extras/medical', form, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deleteMedicalRecord: (id) => api.delete(`/extras/medical/${id}`),
  getMedicines: () => api.get('/extras/medicines'),
  addMedicine: (data) => api.post('/extras/medicines', data),
  updateMedicine: (id, data) => api.put(`/extras/medicines/${id}`, data),
  deleteMedicine: (id) => api.delete(`/extras/medicines/${id}`),
  getAppointments: () => api.get('/extras/appointments'),
  addAppointment: (data) => api.post('/extras/appointments', data),
  deleteAppointment: (id) => api.delete(`/extras/appointments/${id}`),
  getPantry: () => api.get('/extras/pantry'),
  addPantryItem: (data) => api.post('/extras/pantry', data),
  deletePantryItem: (id) => api.delete(`/extras/pantry/${id}`),
  getShoppingList: () => api.get('/extras/shopping'),
  addShoppingItem: (data) => api.post('/extras/shopping', data),
  toggleShoppingItem: (id) => api.put(`/extras/shopping/${id}/toggle`),
  deleteShoppingItem: (id) => api.delete(`/extras/shopping/${id}`),
  getFamilyMembers: () => api.get('/extras/family'),
  addFamilyMember: (data) => api.post('/extras/family', data),
  deleteFamilyMember: (id) => api.delete(`/extras/family/${id}`),
  getRewards: () => api.get('/extras/rewards'),
};
