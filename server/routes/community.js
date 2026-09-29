const express = require('express');
const router = express.Router();
const community = require('../controllers/communityController');
const { protect } = require('../middleware/auth');
const { uploadPost } = require('../middleware/upload');

router.use(protect);
router.get('/posts', community.getPosts);
router.post('/posts', uploadPost.single('image'), community.createPost);
router.delete('/posts/:id', community.deletePost);
router.get('/posts/:postId/comments', community.getComments);
router.post('/posts/:postId/comments', community.addComment);
router.post('/posts/:postId/like', community.toggleLike);
router.post('/follow/:userId', community.toggleFollow);
router.get('/notifications', community.getNotifications);
router.put('/notifications/read', community.markNotificationsRead);

module.exports = router;
