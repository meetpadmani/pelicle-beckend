const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Send an email
 * @param {string} to - recipient email
 * @param {string} subject - email subject
 * @param {string} html - HTML body content
 */
const sendEmail = async (to, subject, html) => {
  const mailOptions = {
    from: `"PELLICLE" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  };

  await transporter.sendMail(mailOptions);
};

// ─── Email Templates ──────────────────────────────────────────────────────────
exports.sendPasswordResetEmail = async (to, resetToken) => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
      <div style="background: linear-gradient(135deg, #1a1a2e, #16213e); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
        <h1 style="color: #e2b96f; margin: 0; font-size: 28px; letter-spacing: 4px;">PELLICLE</h1>
        <p style="color: #aaa; font-size: 12px; letter-spacing: 2px;">WEAR YOUR STORY</p>
      </div>
      <div style="background: #fff; padding: 40px; border-radius: 0 0 12px 12px; border: 1px solid #eee;">
        <h2 style="color: #1a1a2e;">Reset Your Password</h2>
        <p style="color: #666; line-height: 1.6;">You requested a password reset. Click the button below to create a new password. This link expires in <strong>15 minutes</strong>.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background: linear-gradient(135deg, #1a1a2e, #e2b96f); color: #fff; padding: 14px 36px; border-radius: 50px; text-decoration: none; font-weight: bold; font-size: 15px;">Reset Password</a>
        </div>
        <p style="color: #999; font-size: 13px;">If you didn't request this, please ignore this email. Your password won't change.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #ccc; font-size: 12px; text-align: center;">© 2024 PELLICLE. All rights reserved.</p>
      </div>
    </div>
  `;
  await sendEmail(to, 'Password Reset - PELLICLE', html);
};

exports.sendOrderConfirmationEmail = async (to, order) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
      <div style="background: linear-gradient(135deg, #1a1a2e, #16213e); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
        <h1 style="color: #e2b96f; margin: 0; font-size: 28px; letter-spacing: 4px;">PELLICLE</h1>
      </div>
      <div style="background: #fff; padding: 40px; border-radius: 0 0 12px 12px; border: 1px solid #eee;">
        <h2 style="color: #1a1a2e;">Order Confirmed! 🎉</h2>
        <p style="color: #666;">Your order <strong>${order.orderNumber}</strong> has been placed successfully.</p>
        <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; font-size: 14px; color: #333;">
            <strong>Total Amount:</strong> ₹${order.totalAmount.toLocaleString('en-IN')}<br/>
            <strong>Status:</strong> Processing<br/>
            <strong>Estimated Delivery:</strong> 3-7 business days
          </p>
        </div>
        <p style="color: #999; font-size: 13px;">Thank you for shopping with PELLICLE!</p>
      </div>
    </div>
  `;
  await sendEmail(to, `Order Confirmed: ${order.orderNumber} - PELLICLE`, html);
};

module.exports = { sendEmail, ...exports };
