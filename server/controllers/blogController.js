const { Op } = require('sequelize');
const { Blog, User, Profile } = require('../models');

// @desc Get all blogs
const getBlogs = async (req, res, next) => {
  try {
    const { category, search, page = 1, limit = 9 } = req.query;
    const where = { is_published: true };
    if (category) where.category = category;
    if (search) where.title = { [Op.like]: `%${search}%` };
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { count, rows } = await Blog.findAndCountAll({
      where, offset, limit: parseInt(limit),
      include: [{ model: User, as: 'author', attributes: ['id', 'name'], include: [{ model: Profile, as: 'profile', attributes: ['photo_url'] }] }],
      order: [['created_at', 'DESC']]
    });
    res.json({ success: true, data: rows, total: count, page: parseInt(page), pages: Math.ceil(count / limit) });
  } catch (err) { next(err); }
};

// @desc Get single blog
const getBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findOne({
      where: { id: req.params.id, is_published: true },
      include: [{ model: User, as: 'author', attributes: ['id', 'name'], include: [{ model: Profile, as: 'profile', attributes: ['photo_url'] }] }]
    });
    if (!blog) return res.status(404).json({ success: false, message: 'Blog not found' });
    await blog.increment('views');
    res.json({ success: true, data: blog });
  } catch (err) { next(err); }
};

// @desc Create blog (admin)
const createBlog = async (req, res, next) => {
  try {
    const { title, content, category, tags } = req.body;
    const image_url = req.file ? `/uploads/posts/${req.file.filename}` : null;
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const blog = await Blog.create({ title, content, category, tags, image_url, slug, author_id: req.user.id });
    res.status(201).json({ success: true, data: blog, message: 'Blog published!' });
  } catch (err) { next(err); }
};

// @desc Update blog (admin)
const updateBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findByPk(req.params.id);
    if (!blog) return res.status(404).json({ success: false, message: 'Blog not found' });
    if (blog.author_id !== req.user.id && req.user.role !== 'admin')
      return res.status(403).json({ success: false, message: 'Not authorized' });
    await blog.update(req.body);
    res.json({ success: true, data: blog });
  } catch (err) { next(err); }
};

// @desc Delete blog
const deleteBlog = async (req, res, next) => {
  try {
    await Blog.destroy({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Blog deleted' });
  } catch (err) { next(err); }
};

// Seed blogs
const seedBlogs = async () => {
  const count = await Blog.count();
  if (count > 0) return;
  const adminUser = await User.findOne({ where: { role: 'admin' } });
  if (!adminUser) return;
  await Blog.bulkCreate([
    { title: '10 Best Foods for Muscle Gain', content: 'Building muscle requires proper nutrition. Here are the top 10 foods...\n\n1. Chicken Breast\n2. Eggs\n3. Greek Yogurt\n4. Salmon\n5. Quinoa\n6. Brown Rice\n7. Cottage Cheese\n8. Edamame\n9. Tuna\n10. Sweet Potato', category: 'muscle_gain', author_id: adminUser.id, is_published: true, tags: ['protein', 'muscle', 'diet'] },
    { title: 'Complete Guide to Weight Loss', content: 'Losing weight sustainably requires a caloric deficit combined with exercise...\n\nKey principles:\n1. Create a 500 calorie daily deficit\n2. Focus on protein intake\n3. Stay hydrated\n4. Get quality sleep\n5. Consistent exercise routine', category: 'weight_loss', author_id: adminUser.id, is_published: true, tags: ['weight loss', 'diet', 'fitness'] },
    { title: 'The Importance of Sleep for Fitness', content: 'Sleep is often the most overlooked aspect of fitness. Here\'s why it matters...\n\nDuring sleep, your body releases growth hormone, repairs muscle tissue, and consolidates motor learning from your workouts.', category: 'lifestyle', author_id: adminUser.id, is_published: true, tags: ['sleep', 'recovery', 'health'] },
    { title: 'Beginner\'s Guide to Meditation', content: 'Meditation can significantly improve your mental and physical health...\n\nStart with just 5 minutes daily and gradually increase duration. Focus on your breath and gently redirect when your mind wanders.', category: 'mental_health', author_id: adminUser.id, is_published: true, tags: ['meditation', 'mindfulness', 'stress'] },
  ]);
  console.log('✅ Blogs seeded');
};

module.exports = { getBlogs, getBlog, createBlog, updateBlog, deleteBlog, seedBlogs };
