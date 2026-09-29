const nodemailer = require('nodemailer');

const createTransporter = () => nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async ({ to, subject, html, text }) => {
  const transporter = createTransporter();
  const info = await transporter.sendMail({
    from: `"FitFusion" <${process.env.EMAIL_FROM}>`,
    to,
    subject,
    html,
    text,
  });
  console.log('Email sent:', info.messageId);
  return info;
};

const sendVerificationEmail = (email, token) => sendEmail({
  to: email,
  subject: 'Verify your FitFusion account',
  html: `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;background:#f9f9f9;">
      <div style="background:linear-gradient(135deg,#667eea,#764ba2);padding:30px;border-radius:12px 12px 0 0;text-align:center;">
        <h1 style="color:white;margin:0;">🏋️ FitFusion</h1>
      </div>
      <div style="background:white;padding:30px;border-radius:0 0 12px 12px;">
        <h2>Verify Your Email</h2>
        <p>Click the button below to verify your account:</p>
        <a href="${process.env.CLIENT_URL}/verify-email?token=${token}"
           style="display:inline-block;padding:12px 24px;background:linear-gradient(135deg,#667eea,#764ba2);color:white;text-decoration:none;border-radius:8px;font-weight:bold;">
          Verify Email
        </a>
        <p style="color:#999;font-size:12px;margin-top:20px;">This link expires in 24 hours.</p>
      </div>
    </div>
  `
});

const sendPasswordResetEmail = (email, token) => sendEmail({
  to: email,
  subject: 'Reset your FitFusion password',
  html: `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;background:#f9f9f9;">
      <div style="background:linear-gradient(135deg,#667eea,#764ba2);padding:30px;border-radius:12px 12px 0 0;text-align:center;">
        <h1 style="color:white;margin:0;">🏋️ FitFusion</h1>
      </div>
      <div style="background:white;padding:30px;border-radius:0 0 12px 12px;">
        <h2>Reset Your Password</h2>
        <p>Click the button below to reset your password:</p>
        <a href="${process.env.CLIENT_URL}/reset-password?token=${token}"
           style="display:inline-block;padding:12px 24px;background:linear-gradient(135deg,#f093fb,#f5576c);color:white;text-decoration:none;border-radius:8px;font-weight:bold;">
          Reset Password
        </a>
        <p style="color:#999;font-size:12px;margin-top:20px;">This link expires in 1 hour. If you didn't request this, ignore this email.</p>
      </div>
    </div>
  `
});

module.exports = { sendEmail, sendVerificationEmail, sendPasswordResetEmail };
