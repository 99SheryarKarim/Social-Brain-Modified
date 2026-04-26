const nodemailer = require('nodemailer');

const getTransporter = () => nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

exports.sendOTPEmail = async (toEmail, otp) => {
  await getTransporter().sendMail({
    from: `"Social Brain" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: 'Your Social Brain Verification Code',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 32px; border-radius: 12px; border: 1px solid #e0e0e0;">
        <h2 style="color: #667eea; margin-bottom: 8px;">🧠 Social Brain</h2>
        <p style="color: #555; font-size: 15px;">Use the verification code below to complete your sign up:</p>
        <div style="text-align: center; margin: 32px 0;">
          <span style="font-size: 40px; font-weight: 800; letter-spacing: 10px; color: #333;">${otp}</span>
        </div>
        <p style="color: #888; font-size: 13px;">This code expires in <strong>10 minutes</strong>. Do not share it with anyone.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
        <p style="color: #aaa; font-size: 12px;">If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  });
};

exports.sendWelcomeEmail = async (toEmail) => {
  await getTransporter().sendMail({
    from: `"Social Brain" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: 'Welcome to Social Brain! 🎉',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 520px; margin: auto; padding: 40px; border-radius: 12px; border: 1px solid #e0e0e0;">
        <h1 style="background: linear-gradient(135deg, #667eea, #764ba2); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-size: 28px;">🧠 Welcome to Social Brain!</h1>
        <p style="color: #444; font-size: 15px; line-height: 1.6;">
          Hi <strong>${toEmail}</strong>,<br/><br/>
          Your account has been successfully created. You're now part of the Social Brain community!
        </p>
        <div style="background: #f8f9ff; border-radius: 10px; padding: 20px; margin: 24px 0;">
          <p style="margin: 0 0 10px; font-weight: 600; color: #333;">Here's what you can do:</p>
          <ul style="color: #555; font-size: 14px; line-height: 2; padding-left: 20px; margin: 0;">
            <li>✨ Generate AI-powered social media posts</li>
            <li>🎯 Choose tone and style for your content</li>
            <li>📸 Get relevant images for your posts</li>
            <li>🚀 Post directly to Facebook</li>
          </ul>
        </div>
        <a href="http://localhost:5173" style="display: inline-block; background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px;">
          Start Creating →
        </a>
        <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0;" />
        <p style="color: #aaa; font-size: 12px;">© 2025 Social Brain. All rights reserved.</p>
      </div>
    `,
  });
};
