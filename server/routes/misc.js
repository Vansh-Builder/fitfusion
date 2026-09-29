const express = require('express');
const challengeRouter = express.Router();
const blogRouter = express.Router();
const aiRouter = express.Router();
const adminRouter = express.Router();
const extrasRouter = express.Router();

const challenge = require('../controllers/challengeController');
const blog = require('../controllers/blogController');
const { chat } = require('../controllers/aiController');
const admin = require('../controllers/adminController');
const extras = require('../controllers/extrasController');
const { protect, adminOnly } = require('../middleware/auth');
const { uploadMedical, uploadPost } = require('../middleware/upload');

// Challenges
challengeRouter.get('/', challenge.getChallenges);
challengeRouter.post('/join', protect, challenge.joinChallenge);
challengeRouter.put('/progress/:id', protect, challenge.updateProgress);
challengeRouter.get('/leaderboard', challenge.getLeaderboard);

// Blogs
blogRouter.get('/', blog.getBlogs);
blogRouter.get('/:id', blog.getBlog);
blogRouter.post('/', protect, adminOnly, uploadPost.single('image'), blog.createBlog);
blogRouter.put('/:id', protect, adminOnly, blog.updateBlog);
blogRouter.delete('/:id', protect, adminOnly, blog.deleteBlog);

// AI
aiRouter.post('/chat', protect, chat);

// Admin
adminRouter.use(protect, adminOnly);
adminRouter.get('/stats', admin.getStats);
adminRouter.get('/users', admin.getUsers);
adminRouter.put('/users/:id/toggle', admin.toggleUserStatus);
adminRouter.post('/admin', admin.createAdmin);
adminRouter.get('/posts', admin.adminGetPosts);
adminRouter.delete('/posts/:id', admin.adminDeletePost);
adminRouter.get('/growth', admin.getUserGrowthChart);

// Extras
extrasRouter.use(protect);
extrasRouter.get('/medical', extras.getMedicalRecords);
extrasRouter.post('/medical', uploadMedical.single('file'), extras.addMedicalRecord);
extrasRouter.delete('/medical/:id', extras.deleteMedicalRecord);
extrasRouter.get('/medicines', extras.getMedicines);
extrasRouter.post('/medicines', extras.addMedicine);
extrasRouter.put('/medicines/:id', extras.updateMedicine);
extrasRouter.delete('/medicines/:id', extras.deleteMedicine);
extrasRouter.get('/appointments', extras.getAppointments);
extrasRouter.post('/appointments', extras.addAppointment);
extrasRouter.delete('/appointments/:id', extras.deleteAppointment);
extrasRouter.get('/pantry', extras.getPantry);
extrasRouter.post('/pantry', extras.addPantryItem);
extrasRouter.delete('/pantry/:id', extras.deletePantryItem);
extrasRouter.get('/shopping', extras.getShoppingList);
extrasRouter.post('/shopping', extras.addShoppingItem);
extrasRouter.put('/shopping/:id/toggle', extras.toggleShoppingItem);
extrasRouter.delete('/shopping/:id', extras.deleteShoppingItem);
extrasRouter.get('/family', extras.getFamilyMembers);
extrasRouter.post('/family', extras.addFamilyMember);
extrasRouter.delete('/family/:id', extras.deleteFamilyMember);
extrasRouter.get('/rewards', extras.getRewards);

module.exports = { challengeRouter, blogRouter, aiRouter, adminRouter, extrasRouter };
