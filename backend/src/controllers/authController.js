const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { authConfig } = require('../config/auth');
const { successResponse, errorResponse, transformUser } = require('../utils/response');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { email, password, firstName, lastName, role, studentId, faculty, year } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return errorResponse(res, 'User with this email already exists', 400);
    }

    // Hash password
    const salt = await bcrypt.genSalt(authConfig.password.saltRounds);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const userData = {
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role,
      profile: {
        studentId,
        faculty,
        year
      }
    };

    const user = new User(userData);
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      authConfig.jwt.secret,
      { expiresIn: authConfig.jwt.accessExpiry }
    );

    // Generate refresh token
    const refreshToken = jwt.sign(
      { id: user._id },
      authConfig.jwt.refreshSecret,
      { expiresIn: authConfig.jwt.refreshExpiry }
    );

    // Save refresh token to user
    user.refreshTokens.push(refreshToken);
    await user.save();

    // Transform user data (remove sensitive information)
    const userResponse = transformUser(user);

    return successResponse(res, {
      user: userResponse,
      token,
      refreshToken
    }, 'User registered successfully', 201);

  } catch (error) {
    console.error('Registration error:', error);
    return errorResponse(res, 'Registration failed', 500);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return errorResponse(res, 'Invalid credentials', 401);
    }

    // Check if user is active
    if (!user.isActive) {
      return errorResponse(res, 'Account is deactivated', 401);
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return errorResponse(res, 'Invalid credentials', 401);
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      authConfig.jwt.secret,
      { expiresIn: authConfig.jwt.accessExpiry }
    );

    // Generate refresh token
    const refreshToken = jwt.sign(
      { id: user._id },
      authConfig.jwt.refreshSecret,
      { expiresIn: authConfig.jwt.refreshExpiry }
    );

    // Save refresh token to user
    user.refreshTokens.push(refreshToken);
    await user.save();

    // Transform user data
    const userResponse = transformUser(user);

    return successResponse(res, {
      user: userResponse,
      token,
      refreshToken
    }, 'Login successful');

  } catch (error) {
    console.error('Login error:', error);
    return errorResponse(res, 'Login failed', 500);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getProfile = async (req, res) => {
  try {
    // Get user with populated club memberships
    const user = await User.findById(req.user._id)
      .populate({
        path: 'clubMemberships',
        populate: {
          path: 'club',
          select: 'name description profilePicture category memberCount'
        }
      });

    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    // Transform user data
    const userResponse = transformUser(user);

    return successResponse(res, userResponse, 'Profile retrieved successfully');

  } catch (error) {
    console.error('Get profile error:', error);
    return errorResponse(res, 'Failed to get profile', 500);
  }
};

// @desc    Update current user profile
// @route   PUT /api/auth/me
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, profile, academicInfo } = req.body;

    // Build update object
    const updateData = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (profile) updateData.profile = { ...req.user.profile, ...profile };
    if (academicInfo) updateData.academicInfo = { ...req.user.academicInfo, ...academicInfo };

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return errorResponse(res, 'User not found', 404);
    }

    // Transform user data
    const userResponse = transformUser(updatedUser);

    return successResponse(res, userResponse, 'Profile updated successfully');

  } catch (error) {
    console.error('Update profile error:', error);
    return errorResponse(res, 'Profile update failed', 500);
  }
};

// @desc    Change user password
// @route   POST /api/auth/change-password
// @access  Private
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Get user with password
    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return errorResponse(res, 'Current password is incorrect', 400);
    }

    // Hash new password
    const salt = await bcrypt.genSalt(authConfig.password.saltRounds);
    const hashedNewPassword = await bcrypt.hash(newPassword, salt);

    // Update password and invalidate all refresh tokens
    user.password = hashedNewPassword;
    user.refreshTokens = [];
    user.passwordChangedAt = new Date();
    await user.save();

    return successResponse(res, null, 'Password changed successfully');

  } catch (error) {
    console.error('Change password error:', error);
    return errorResponse(res, 'Password change failed', 500);
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (token) {
      // Add token to blacklist (implement if needed)
      // For now, just remove the refresh token from user
      await User.findByIdAndUpdate(req.user._id, {
        $pull: { refreshTokens: token }
      });
    }

    return successResponse(res, null, 'Logged out successfully');

  } catch (error) {
    console.error('Logout error:', error);
    return errorResponse(res, 'Logout failed', 500);
  }
};

// @desc    Refresh access token
// @route   POST /api/auth/refresh
// @access  Public (with refresh token)
const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return errorResponse(res, 'Refresh token is required', 400);
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, authConfig.jwt.refreshSecret);
    
    // Find user and check if refresh token exists
    const user = await User.findById(decoded.id);
    if (!user || !user.refreshTokens.includes(refreshToken)) {
      return errorResponse(res, 'Invalid refresh token', 401);
    }

    // Generate new access token
    const newToken = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      authConfig.jwt.secret,
      { expiresIn: authConfig.jwt.accessExpiry }
    );

    return successResponse(res, {
      token: newToken
    }, 'Token refreshed successfully');

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return errorResponse(res, 'Invalid refresh token', 401);
    }
    if (error.name === 'TokenExpiredError') {
      return errorResponse(res, 'Refresh token expired', 401);
    }
    
    console.error('Token refresh error:', error);
    return errorResponse(res, 'Token refresh failed', 500);
  }
};

// @desc    Send password reset email
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if user exists or not
      return successResponse(res, null, 'If an account exists, a password reset email has been sent');
    }

    // Generate reset token
    const resetToken = jwt.sign(
      { id: user._id, type: 'password_reset' },
      authConfig.jwt.secret,
      { expiresIn: '1h' }
    );

    // Save reset token to user
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    // TODO: Send reset email
    // For now, just return success
    console.log('Password reset token:', resetToken);

    return successResponse(res, null, 'Password reset email sent');

  } catch (error) {
    console.error('Forgot password error:', error);
    return errorResponse(res, 'Failed to send reset email', 500);
  }
};

// @desc    Reset password with token
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    // Verify reset token
    const decoded = jwt.verify(token, authConfig.jwt.secret);
    
    if (decoded.type !== 'password_reset') {
      return errorResponse(res, 'Invalid reset token', 400);
    }

    // Find user with reset token
    const user = await User.findOne({
      _id: decoded.id,
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      return errorResponse(res, 'Invalid or expired reset token', 400);
    }

    // Hash new password
    const salt = await bcrypt.genSalt(authConfig.password.saltRounds);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password and clear reset token
    user.password = hashedPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.passwordChangedAt = new Date();
    user.refreshTokens = []; // Invalidate all sessions
    await user.save();

    return successResponse(res, null, 'Password reset successful');

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return errorResponse(res, 'Invalid reset token', 400);
    }
    if (error.name === 'TokenExpiredError') {
      return errorResponse(res, 'Reset token expired', 400);
    }
    
    console.error('Reset password error:', error);
    return errorResponse(res, 'Password reset failed', 500);
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  logout,
  refreshToken,
  forgotPassword,
  resetPassword
};
