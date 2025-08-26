const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const {
  authConfig,
  generateToken,
  generateRefreshToken,
} = require("../config/auth");
const {
  successResponse,
  errorResponse,
  transformUser,
} = require("../utils/response");

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const {
      email,
      password,
      name,
      firstName,
      lastName,
      role,
      studentId,
      faculty,
      year,
      yearOfStudy,
    } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return errorResponse(res, "User with this email already exists", 400);
    }

    const resolvedName =
      (name && String(name).trim()) ||
      [firstName, lastName].filter(Boolean).join(" ").trim();
    if (!resolvedName) {
      return errorResponse(res, "Name is required", 400);
    }

    // const salt = await bcrypt.genSalt(authConfig.password.saltRounds);
    // const hashedPassword = await bcrypt.hash(password, salt);

    const userData = {
      email,
      password: password,
      name: resolvedName,
      role,
      studentId,
      faculty,
      yearOfStudy: yearOfStudy ?? year,
    };

    const user = new User(userData);
    await user.save();

    const token = generateToken({
      id: user._id,
      email: user.email,
      role: user.role,
    });
    const refreshToken = generateRefreshToken({ id: user._id });

    if (!user.refreshTokens) user.refreshTokens = [];
    user.refreshTokens.push(refreshToken);
    await user.save();

    const userResponse = transformUser(user);

    return successResponse(
      res,
      {
        user: userResponse,
        token,
        refreshToken,
      },
      "User registered successfully",
      201
    );
  } catch (error) {
    console.error("Registration error:", error);
    return errorResponse(res, "Registration failed", 500);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email and explicitly select password
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      console.log("User not found for email:", email);
      return errorResponse(res, "Invalid credentials", 401);
    }

    // Check if user is active
    if (!user.isActive) {
      console.log("User account is deactivated:", email);
      return errorResponse(res, "Account is deactivated", 401);
    }

    // Verify password using the User model's comparePassword method
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      console.log("Invalid password for user:", email);
      return errorResponse(res, "Invalid credentials", 401);
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate tokens
    const token = generateToken({
      id: user._id,
      email: user.email,
      role: user.role,
    });
    const refreshToken = generateRefreshToken({ id: user._id });

    // Add refresh token to user
    if (!user.refreshTokens) user.refreshTokens = [];
    user.refreshTokens.push(refreshToken);
    await user.save();

    // Transform user data (remove password)
    const userResponse = transformUser(user);

    return successResponse(
      res,
      {
        user: userResponse,
        token,
        refreshToken,
      },
      "Login successful"
    );
  } catch (error) {
    console.error("Login error:", error);
    return errorResponse(res, "Login failed", 500);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return errorResponse(res, "User not found", 404);
    }

    const userResponse = transformUser(user);

    return successResponse(res, userResponse, "Profile retrieved successfully");
  } catch (error) {
    console.error("Get profile error:", error);
    return errorResponse(res, "Failed to get profile", 500);
  }
};

// @desc    Update current user profile
// @route   PUT /api/auth/me
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const {
      name,
      phone,
      location,
      bio,
      avatarUrl,
      studentId,
      faculty,
      yearOfStudy,
      year,
    } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (location) updateData.location = location;
    if (bio) updateData.bio = bio;
    if (avatarUrl) updateData.avatarUrl = avatarUrl;
    if (studentId) updateData.studentId = studentId;
    if (faculty) updateData.faculty = faculty;
    if (yearOfStudy ?? year) updateData.yearOfStudy = yearOfStudy ?? year;

    const updatedUser = await User.findByIdAndUpdate(req.user._id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedUser) {
      return errorResponse(res, "User not found", 404);
    }

    const userResponse = transformUser(updatedUser);

    return successResponse(res, userResponse, "Profile updated successfully");
  } catch (error) {
    console.error("Update profile error:", error);
    return errorResponse(res, "Profile update failed", 500);
  }
};

// @desc    Change user password
// @route   POST /api/auth/change-password
// @access  Private
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select("+password");
    if (!user) {
      return errorResponse(res, "User not found", 404);
    }

    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );
    if (!isCurrentPasswordValid) {
      return errorResponse(res, "Current password is incorrect", 400);
    }

    const salt = await bcrypt.genSalt(authConfig.password.saltRounds);
    const hashedNewPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedNewPassword;
    user.refreshTokens = [];
    user.passwordChangedAt = new Date();
    await user.save();

    return successResponse(res, null, "Password changed successfully");
  } catch (error) {
    console.error("Change password error:", error);
    return errorResponse(res, "Password change failed", 500);
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (token) {
      await User.findByIdAndUpdate(req.user._id, {
        $pull: { refreshTokens: token },
      });
    }

    return successResponse(res, null, "Logged out successfully");
  } catch (error) {
    console.error("Logout error:", error);
    return errorResponse(res, "Logout failed", 500);
  }
};

// @desc    Refresh access token
// @route   POST /api/auth/refresh
// @access  Public (with refresh token)
const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return errorResponse(res, "Refresh token is required", 400);
    }

    const decoded = jwt.verify(refreshToken, authConfig.jwt.refreshSecret);

    const user = await User.findById(decoded.id);
    if (!user || !user.refreshTokens?.includes(refreshToken)) {
      return errorResponse(res, "Invalid refresh token", 401);
    }

    const newToken = generateToken({
      id: user._id,
      email: user.email,
      role: user.role,
    });

    return successResponse(
      res,
      { token: newToken },
      "Token refreshed successfully"
    );
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return errorResponse(res, "Invalid refresh token", 401);
    }
    if (error.name === "TokenExpiredError") {
      return errorResponse(res, "Refresh token expired", 401);
    }

    console.error("Token refresh error:", error);
    return errorResponse(res, "Token refresh failed", 500);
  }
};

// @desc    Send password reset email
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return successResponse(
        res,
        null,
        "If an account exists, a password reset email has been sent"
      );
    }

    const resetToken = jwt.sign(
      { id: user._id, type: "password_reset" },
      authConfig.jwt.secret,
      { expiresIn: "1h" }
    );

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000);
    await user.save();

    console.log("Password reset token:", resetToken);

    return successResponse(res, null, "Password reset email sent");
  } catch (error) {
    console.error("Forgot password error:", error);
    return errorResponse(res, "Failed to send reset email", 500);
  }
};

// @desc    Reset password with token
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    const decoded = jwt.verify(token, authConfig.jwt.secret);

    if (decoded.type !== "password_reset") {
      return errorResponse(res, "Invalid reset token", 400);
    }

    const user = await User.findOne({
      _id: decoded.id,
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return errorResponse(res, "Invalid or expired reset token", 400);
    }

    const salt = await bcrypt.genSalt(authConfig.password.saltRounds);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    user.passwordChangedAt = new Date();
    user.refreshTokens = [];
    await user.save();

    return successResponse(res, null, "Password reset successful");
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return errorResponse(res, "Invalid reset token", 400);
    }
    if (error.name === "TokenExpiredError") {
      return errorResponse(res, "Reset token expired", 400);
    }

    console.error("Reset password error:", error);
    return errorResponse(res, "Password reset failed", 500);
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
  resetPassword,
};
