const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { User, Profile, Reward } = require('../models');
const { generateToken } = require('../utils/helpers');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../utils/email');

// @desc Register new user
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ success: false, message: 'All fields are required' });
    if (password.length < 6)
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });

    const exists = await User.findOne({ where: { email } });
    if (exists) return res.status(409).json({ success: false, message: 'Email already registered' });

    const password_hash = await bcrypt.hash(password, 12);
    const verification_token = crypto.randomBytes(32).toString('hex');

    const user = await User.create({ name, email, password_hash, verification_token });
    await Profile.create({ user_id: user.id });
    await Reward.create({ user_id: user.id });

    // Send verification email (non-blocking)
    sendVerificationEmail(email, verification_token).catch(console.error);

    const token = generateToken(user.id, user.role);
    res.status(201).json({
      success: true,
      message: 'Registration successful. Please verify your email.',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, is_first_login: user.is_first_login }
    });
  } catch (err) { next(err); }
};

// @desc Login user
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Email and password required' });

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });
    if (!user.is_active) return res.status(403).json({ success: false, message: 'Account disabled' });

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const token = generateToken(user.id, user.role);
    const profile = await Profile.findOne({ where: { user_id: user.id } });

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        is_first_login: user.is_first_login,
        is_verified: user.is_verified,
        wizard_completed: profile?.wizard_completed || false,
        photo_url: profile?.photo_url || null,
      }
    });
  } catch (err) { next(err); }
};

// @desc Verify email
const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.query;
    const user = await User.findOne({ where: { verification_token: token } });
    if (!user) return res.status(400).json({ success: false, message: 'Invalid or expired token' });
    await user.update({ is_verified: true, verification_token: null });
    res.json({ success: true, message: 'Email verified successfully' });
  } catch (err) { next(err); }
};

// @desc Forgot password
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ success: false, message: 'No account with that email' });

    const reset_token = crypto.randomBytes(32).toString('hex');
    const reset_token_expires = new Date(Date.now() + 3600000); // 1 hour
    await user.update({ reset_token, reset_token_expires });
    await sendPasswordResetEmail(email, reset_token);
    res.json({ success: true, message: 'Password reset email sent' });
  } catch (err) { next(err); }
};

// @desc Reset password
const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    const user = await User.findOne({
      where: { reset_token: token },
    });
    if (!user || user.reset_token_expires < new Date())
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });

    const password_hash = await bcrypt.hash(password, 12);
    await user.update({ password_hash, reset_token: null, reset_token_expires: null });
    res.json({ success: true, message: 'Password reset successful' });
  } catch (err) { next(err); }
};

// @desc Get current user
const getMe = async (req, res) => {
  const profile = await Profile.findOne({ where: { user_id: req.user.id } });
  res.json({ success: true, user: { ...req.user.toJSON(), profile } });
};

// @desc Change password
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findByPk(req.user.id);
    const match = await bcrypt.compare(currentPassword, user.password_hash);
    if (!match) return res.status(400).json({ success: false, message: 'Current password incorrect' });
    const password_hash = await bcrypt.hash(newPassword, 12);
    await user.update({ password_hash });
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (err) { next(err); }
};

module.exports = { register, login, verifyEmail, forgotPassword, resetPassword, getMe, changePassword };
