const { Op } = require('sequelize');
const { CommunityPost, Comment, Like, Follow, User, Profile, Notification } = require('../models');

// @desc Get all posts
const getPosts = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { count, rows } = await CommunityPost.findAndCountAll({
      where: { is_active: true },
      include: [{ model: User, as: 'author', attributes: ['id', 'name'], include: [{ model: Profile, as: 'profile', attributes: ['photo_url'] }] }],
      offset, limit: parseInt(limit), order: [['created_at', 'DESC']]
    });
    res.json({ success: true, data: rows, total: count, page: parseInt(page) });
  } catch (err) { next(err); }
};

// @desc Create post
const createPost = async (req, res, next) => {
  try {
    const { content } = req.body;
    const image_url = req.file ? `/uploads/posts/${req.file.filename}` : null;
    const post = await CommunityPost.create({ user_id: req.user.id, content, image_url });
    res.status(201).json({ success: true, data: post, message: 'Post created!' });
  } catch (err) { next(err); }
};

// @desc Delete post
const deletePost = async (req, res, next) => {
  try {
    const post = await CommunityPost.findByPk(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    if (post.user_id !== req.user.id && req.user.role !== 'admin')
      return res.status(403).json({ success: false, message: 'Not authorized' });
    await post.update({ is_active: false });
    res.json({ success: true, message: 'Post deleted' });
  } catch (err) { next(err); }
};

// @desc Get comments
const getComments = async (req, res, next) => {
  try {
    const comments = await Comment.findAll({
      where: { post_id: req.params.postId, is_active: true },
      include: [{ model: User, as: 'author', attributes: ['id', 'name'], include: [{ model: Profile, as: 'profile', attributes: ['photo_url'] }] }],
      order: [['created_at', 'ASC']]
    });
    res.json({ success: true, data: comments });
  } catch (err) { next(err); }
};

// @desc Add comment
const addComment = async (req, res, next) => {
  try {
    const { content } = req.body;
    const comment = await Comment.create({ post_id: req.params.postId, user_id: req.user.id, content });
    await CommunityPost.increment('comments_count', { where: { id: req.params.postId } });
    // Notify post author
    const post = await CommunityPost.findByPk(req.params.postId);
    if (post && post.user_id !== req.user.id) {
      await Notification.create({ user_id: post.user_id, type: 'comment', message: `${req.user.name} commented on your post.`, link: `/community` });
    }
    res.status(201).json({ success: true, data: comment, message: 'Comment added!' });
  } catch (err) { next(err); }
};

// @desc Toggle like
const toggleLike = async (req, res, next) => {
  try {
    const postId = req.params.postId;
    const exists = await Like.findOne({ where: { post_id: postId, user_id: req.user.id } });
    if (exists) {
      await exists.destroy();
      await CommunityPost.decrement('likes_count', { where: { id: postId } });
      return res.json({ success: true, liked: false });
    }
    await Like.create({ post_id: postId, user_id: req.user.id });
    await CommunityPost.increment('likes_count', { where: { id: postId } });
    const post = await CommunityPost.findByPk(postId);
    if (post && post.user_id !== req.user.id) {
      await Notification.create({ user_id: post.user_id, type: 'like', message: `${req.user.name} liked your post.`, link: `/community` });
    }
    res.json({ success: true, liked: true });
  } catch (err) { next(err); }
};

// @desc Follow / unfollow user
const toggleFollow = async (req, res, next) => {
  try {
    const followingId = parseInt(req.params.userId);
    if (followingId === req.user.id) return res.status(400).json({ success: false, message: "Can't follow yourself" });
    const exists = await Follow.findOne({ where: { follower_id: req.user.id, following_id: followingId } });
    if (exists) {
      await exists.destroy();
      return res.json({ success: true, following: false });
    }
    await Follow.create({ follower_id: req.user.id, following_id: followingId });
    await Notification.create({ user_id: followingId, type: 'follow', message: `${req.user.name} started following you.`, link: `/profile/${req.user.id}` });
    res.json({ success: true, following: true });
  } catch (err) { next(err); }
};

// @desc Get notifications
const getNotifications = async (req, res, next) => {
  try {
    const notes = await Notification.findAll({
      where: { user_id: req.user.id }, order: [['created_at', 'DESC']], limit: 20
    });
    res.json({ success: true, data: notes });
  } catch (err) { next(err); }
};

// @desc Mark notifications read
const markNotificationsRead = async (req, res, next) => {
  try {
    await Notification.update({ is_read: true }, { where: { user_id: req.user.id, is_read: false } });
    res.json({ success: true, message: 'Notifications marked as read' });
  } catch (err) { next(err); }
};

module.exports = { getPosts, createPost, deletePost, getComments, addComment, toggleLike, toggleFollow, getNotifications, markNotificationsRead };
