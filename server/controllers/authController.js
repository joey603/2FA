const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../utils/sendEmail');

/**
 * Generate JWT token
 * @param {string} id - User ID 
 * @returns {string} - JWT token
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
exports.register = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    
    if (existingUser) {
      return next(new ErrorResponse('Email already registered', 400));
    }

    // Create new user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password
    });

    // Generate verification code
    const verificationCode = user.generateVerificationCode();
    await user.save({ validateBeforeSave: false });

    // Send verification email
    try {
      await sendVerificationEmail(
        user.email,
        `${user.firstName} ${user.lastName}`,
        verificationCode
      );

      res.status(201).json({
        success: true,
        message: 'User registered successfully. Please check your email to verify your account.'
      });
    } catch (error) {
      // If email sending fails, rollback code
      user.verificationCode = undefined;
      user.verificationCodeExpires = undefined;
      await user.save({ validateBeforeSave: false });

      return next(new ErrorResponse('Email could not be sent', 500));
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return next(new ErrorResponse('Please provide email and password', 400));
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return next(new ErrorResponse('Invalid credentials', 401));
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return next(new ErrorResponse('Invalid credentials', 401));
    }

    // Check if user has verified their email
    if (!user.isVerified) {
      return next(new ErrorResponse('Account not verified. Please verify your email to login.', 401));
    }

    // Create and send token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Verify email
 * @route   POST /api/auth/verify-email
 * @access  Public
 */
exports.verifyEmail = async (req, res, next) => {
  try {
    const { code, email } = req.body;

    console.log('Verification attempt:', { 
      receivedEmail: email, 
      receivedCode: code,
      codeType: typeof code
    });

    if (!code || !email) {
      return next(new ErrorResponse('Please provide verification code and email', 400));
    }

    // Find user with matching code and code not expired
    const user = await User.findOne({
      email
    });

    if (!user) {
      console.log('User not found with email:', email);
      return next(new ErrorResponse('Invalid or expired verification code', 400));
    }
    
    console.log('User found:', { 
      email: user.email,
      storedCode: user.verificationCode,
      codeExpires: user.verificationCodeExpires,
      expired: user.verificationCodeExpires < Date.now(),
      isMatch: user.verificationCode === code
    });

    // Check code match and expiration
    if (!user.verificationCode || user.verificationCodeExpires < Date.now()) {
      console.log('Code expired or not found');
      return next(new ErrorResponse('Verification code has expired', 400));
    }
    
    if (user.verificationCode !== code) {
      console.log('Code mismatch');
      return next(new ErrorResponse('Invalid verification code', 400));
    }

    // Update user verification status
    user.isVerified = true;
    user.verificationCode = undefined;
    user.verificationCodeExpires = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Email verified successfully. You can now login.'
    });
  } catch (error) {
    console.error('Verification error:', error);
    next(error);
  }
};

/**
 * @desc    Resend verification email
 * @route   POST /api/auth/resend-verification
 * @access  Public
 */
exports.resendVerification = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return next(new ErrorResponse('Please provide your email', 400));
    }

    // Find user
    const user = await User.findOne({ email });

    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }

    // Check if already verified
    if (user.isVerified) {
      return next(new ErrorResponse('Email already verified', 400));
    }

    // Generate new verification code
    const verificationCode = user.generateVerificationCode();
    await user.save({ validateBeforeSave: false });

    // Send verification email
    try {
      await sendVerificationEmail(
        user.email,
        `${user.firstName} ${user.lastName}`,
        verificationCode
      );

      res.status(200).json({
        success: true,
        message: 'Verification code resent successfully'
      });
    } catch (error) {
      // If email sending fails, rollback code
      user.verificationCode = undefined;
      user.verificationCodeExpires = undefined;
      await user.save({ validateBeforeSave: false });

      return next(new ErrorResponse('Email could not be sent', 500));
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current logged in user
 * @route   GET /api/auth/me
 * @access  Private
 */
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        isVerified: user.isVerified,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Change user password
 * @route   PUT /api/auth/change-password
 * @access  Private
 */
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Validate passwords
    if (!currentPassword || !newPassword) {
      return next(new ErrorResponse('Please provide current and new password', 400));
    }

    // Password length validation
    if (newPassword.length < 8) {
      return next(new ErrorResponse('New password must be at least 8 characters long', 400));
    }

    // Get user with password
    const user = await User.findById(req.user.id).select('+password');

    // Check if current password matches
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      console.log('Password change failed: Current password is incorrect for user', user.email);
      return next(new ErrorResponse('Current password is incorrect. Please verify and try again.', 401));
    }

    // Update password
    user.password = newPassword;
    await user.save();

    // Log successful password change
    console.log('Password changed successfully for user:', user.email);
    
    // Respond with success
    res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('Password change error:', error);
    next(error);
  }
};

/**
 * @desc    Delete user account
 * @route   DELETE /api/auth/delete-account
 * @access  Private
 */
exports.deleteAccount = async (req, res, next) => {
  try {
    const { password } = req.body;

    // Validate password
    if (!password) {
      return next(new ErrorResponse('Please provide your password to confirm account deletion', 400));
    }

    // Get user with password
    const user = await User.findById(req.user.id).select('+password');

    // Check if password matches
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log('Account deletion failed: Password is incorrect for user', user.email);
      return next(new ErrorResponse('Password is incorrect. Account deletion canceled.', 401));
    }

    // Delete user
    await User.findByIdAndDelete(req.user.id);

    // Log successful account deletion
    console.log('Account successfully deleted for user:', user.email);
    
    // Respond with success
    res.status(200).json({
      success: true,
      message: 'Your account has been permanently deleted'
    });
  } catch (error) {
    console.error('Account deletion error:', error);
    next(error);
  }
};

/**
 * @desc    Forgot password - generate reset token
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return next(new ErrorResponse('Please provide your email address', 400));
    }

    // Find the user
    const user = await User.findOne({ email });

    // If user doesn't exist, still return success for security
    if (!user) {
      console.log(`Password reset requested for non-existent email: ${email}`);
      return res.status(200).json({
        success: true,
        message: 'If your email is registered, you will receive a password reset link'
      });
    }

    // Generate password reset token
    const resetToken = user.generateResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    // Send password reset email
    try {
      await sendPasswordResetEmail(
        user.email,
        `${user.firstName} ${user.lastName}`,
        resetToken
      );

      res.status(200).json({
        success: true,
        message: 'If your email is registered, you will receive a password reset link'
      });
    } catch (error) {
      // If email sending fails, rollback token
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save({ validateBeforeSave: false });

      console.error('Error sending reset email:', error);
      return next(new ErrorResponse('Email could not be sent', 500));
    }
  } catch (error) {
    console.error('Forgot password error:', error);
    next(error);
  }
};

/**
 * @desc    Reset password
 * @route   PUT /api/auth/reset-password/:resetToken
 * @access  Public
 */
exports.resetPassword = async (req, res, next) => {
  try {
    const { password } = req.body;
    const { resetToken } = req.params;

    if (!password) {
      return next(new ErrorResponse('Please provide a new password', 400));
    }

    if (password.length < 8) {
      return next(new ErrorResponse('Password must be at least 8 characters long', 400));
    }

    // Hash token
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Find user with matching token and token not expired
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return next(new ErrorResponse('Invalid or expired reset token', 400));
    }

    // Set new password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    // Log successful password reset
    console.log(`Password reset successful for user: ${user.email}`);

    res.status(200).json({
      success: true,
      message: 'Password reset successful. You can now login with your new password.'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    next(error);
  }
}; 