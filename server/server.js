require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const rateLimit = require('express-rate-limit');

const { connectDB } = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Routes
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const exerciseRoutes = require('./routes/exercises');
const healthRoutes = require('./routes/health');
const mealRoutes = require('./routes/meals');
const workoutRoutes = require('./routes/workout');
const communityRoutes = require('./routes/community');
const { challengeRouter, blogRouter, aiRouter, adminRouter, extrasRouter } = require('./routes/misc');

// Seed functions
const { seedExercises } = require('./controllers/exerciseController');
const { seedMeals } = require('./controllers/mealController');
const { seedChallenges } = require('./controllers/challengeController');
const { seedBlogs } = require('./controllers/blogController');

const app = express();

// Security middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));

// Rate limiting
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200, message: 'Too many requests, please try again later.' });
app.use('/api/', limiter);

// Logging & parsing
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static file serving
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/exercises', exerciseRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/meals', mealRoutes);
app.use('/api/workout', workoutRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/challenges', challengeRouter);
app.use('/api/blogs', blogRouter);
app.use('/api/ai', aiRouter);
app.use('/api/admin', adminRouter);
app.use('/api/extras', extrasRouter);

// Root & API welcome endpoints
app.get('/', (req, res) => res.json({ success: true, message: 'Welcome to FitFusion API Server 🚀', health: '/api/health-check', docs: '/api' }));
app.get('/api', (req, res) => res.json({
  success: true,
  message: 'FitFusion API is online and healthy ⚡',
  endpoints: {
    healthCheck: '/api/health-check',
    auth: '/api/auth',
    profile: '/api/profile',
    exercises: '/api/exercises',
    health: '/api/health',
    meals: '/api/meals',
    workout: '/api/workout',
    community: '/api/community',
    challenges: '/api/challenges',
    blogs: '/api/blogs',
    ai: '/api/ai',
    admin: '/api/admin',
    extras: '/api/extras',
  }
}));

// Health check
app.get('/api/health-check', (req, res) => res.json({ status: 'ok', message: 'FitFusion API running' }));

// 404 handler
app.use('/{*path}', (req, res) => res.status(404).json({ success: false, message: 'Route not found' }));

// Global error handler
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  // Seed data
  await seedExercises();
  await seedMeals();
  await seedChallenges();

  // Create default admin if not exists
  const { User, Profile } = require('./models');
  const bcrypt = require('bcryptjs');
  const adminExists = await User.findOne({ where: { role: 'admin' } });
  if (!adminExists) {
    const password_hash = await bcrypt.hash('Admin@123', 12);
    const admin = await User.create({ name: 'FitFusion Admin', email: 'admin@fitfusion.com', password_hash, role: 'admin', is_verified: true });
    await Profile.create({ user_id: admin.id });
    console.log('✅ Default admin created: admin@fitfusion.com / Admin@123');
  }

  await seedBlogs();

  app.listen(PORT, () => {
    console.log(`🚀 FitFusion Server running on http://localhost:${PORT}`);
    console.log(`📊 API available at http://localhost:${PORT}/api`);
  });
};

startServer().catch(console.error);

module.exports = app;
