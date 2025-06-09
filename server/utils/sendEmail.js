const sgMail = require('@sendgrid/mail');

// Set SendGrid API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

/**
 * Send email using SendGrid
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Plain text content
 * @param {string} options.html - HTML content
 * @returns {Promise} - SendGrid response
 */
const sendEmail = async (options) => {
  const msg = {
    to: options.to,
    from: process.env.FROM_EMAIL,
    subject: options.subject,
    text: options.text,
    html: options.html || options.text
  };

  try {
    return await sgMail.send(msg);
  } catch (error) {
    console.error('SendGrid error:', error);
    if (error.response) {
      console.error(error.response.body);
    }
    throw new Error('Email could not be sent');
  }
};

/**
 * Send verification email with code
 * @param {string} email - User's email
 * @param {string} name - User's name
 * @param {string} verificationCode - Code for email verification
 * @returns {Promise} - SendGrid response
 */
const sendVerificationEmail = async (email, name, verificationCode) => {
  return await sendEmail({
    to: email,
    subject: 'Email Verification Code',
    text: `Hello ${name},\n\nYour verification code is: ${verificationCode}\n\nThis code will expire in 24 hours.\n\nIf you did not create an account, please ignore this email.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1976d2;">Verify Your Email Address</h2>
        <p>Hello ${name},</p>
        <p>Thank you for registering! Please use the following verification code to verify your account:</p>
        <div style="background-color: #f4f4f4; padding: 15px; border-radius: 5px; margin: 20px 0; text-align: center;">
          <span style="font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #1976d2;">${verificationCode}</span>
        </div>
        <p>Enter this code on the verification page to complete your registration.</p>
        <p>This code will expire in 24 hours.</p>
        <p>If you did not create an account, please ignore this email.</p>
        <p>Best regards,<br>The Auth App Team</p>
      </div>
    `
  });
};

/**
 * Send password reset email
 * @param {string} email - User's email
 * @param {string} name - User's name
 * @param {string} resetToken - Token for password reset
 * @returns {Promise} - SendGrid response
 */
const sendPasswordResetEmail = async (email, name, resetToken) => {
  // In a real app, you would use a frontend URL
  const resetUrl = `http://localhost:3000/reset-password?token=${resetToken}`;
  
  return await sendEmail({
    to: email,
    subject: 'Password Reset',
    text: `Hello ${name},\n\nYou requested a password reset. Please click on the following link to reset your password: ${resetUrl}\n\nThis link will expire in 10 minutes.\n\nIf you did not request a password reset, please ignore this email.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1976d2;">Reset Your Password</h2>
        <p>Hello ${name},</p>
        <p>You requested a password reset. Please click the button below to set a new password:</p>
        <p style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #1976d2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
            Reset Password
          </a>
        </p>
        <p>This link will expire in 10 minutes.</p>
        <p>If you did not request a password reset, please ignore this email.</p>
        <p>Best regards,<br>The Auth App Team</p>
      </div>
    `
  });
};

module.exports = {
  sendEmail,
  sendVerificationEmail,
  sendPasswordResetEmail
}; 