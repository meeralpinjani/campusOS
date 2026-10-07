const User = require('../models/User');
const { generateTokens, verifyRefreshToken } = require('../utils/jwt');

/**
 * INTERIM ROLE ASSIGNMENT BY EMAIL DOMAIN
 * ------------------------------------------------------------------
 * Temporary heuristic to be replaced once CampusOS SSO provides authoritative
 * role data (per Section 6 of the architecture doc).
 * 
 * Policy:
 * - Emails ending in `@kitcoek.edu` -> default role: `faculty`.
 * - All other domains (e.g. `@kit.edu`, etc.) -> default role: `student`.
 * 
 * Note: A small number of @kitcoek.edu addresses belong to students, so keep
 * this logic isolated in this single function for easy removal/swap later.
 * ------------------------------------------------------------------
 */
const getInterimRoleFromEmail = (email, requestedRole = null) => {
  if (requestedRole && ['admin', 'moderator'].includes(requestedRole)) {
    return requestedRole;
  }
  if (!email || typeof email !== 'string') return 'student';
  const cleanEmail = email.trim().toLowerCase();
  if (cleanEmail.endsWith('@kitcoek.edu')) {
    return 'faculty';
  }
  return 'student';
};

/**
 * @desc    Register new user
 * @route   POST /api/auth/signup
 * @access  Public
 */
const signup = async (req, res) => {
  try {
    const { username, email, password, branch, year, bio, role } = req.body;

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Please provide username, email, and password' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { username: username.trim() }],
    });

    if (existingUser) {
      if (existingUser.email === email.toLowerCase()) {
        return res.status(400).json({ message: 'User with this email already exists' });
      }
      return res.status(400).json({ message: 'Username is already taken' });
    }

    const assignedRole = getInterimRoleFromEmail(email, role);

    // Create user (password will be automatically hashed by User schema pre-save hook)
    const user = await User.create({
      username: username.trim(),
      email: email.toLowerCase().trim(),
      passwordHash: password,
      branch: branch || 'Computer Science & Engineering',
      year: year || '1st Year',
      bio: bio || '',
      role: assignedRole,
    });

    // Generate JWT access & refresh tokens
    const { accessToken, refreshToken } = generateTokens(user);

    // Omit passwordHash from output
    const userResponse = {
      _id: user._id,
      username: user.username,
      email: user.email,
      avatarUrl: user.avatarUrl,
      branch: user.branch,
      year: user.year,
      bio: user.bio,
      reputationScore: user.reputationScore,
      role: user.role,
      createdAt: user.createdAt,
    };

    return res.status(201).json({
      message: 'Account created successfully',
      user: userResponse,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error('[Signup Error]:', error);
    return res.status(500).json({ message: error.message || 'Server error during signup' });
  }
};

/**
 * @desc    Authenticate user & get tokens
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res) => {
  try {
    const { emailOrUsername, password } = req.body;

    if (!emailOrUsername || !password) {
      return res.status(400).json({ message: 'Please provide email/username and password' });
    }

    // Find user by email or username (explicitly select passwordHash)
    const user = await User.findOne({
      $or: [
        { email: emailOrUsername.toLowerCase().trim() },
        { username: emailOrUsername.trim() },
      ],
    }).select('+passwordHash');

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Compare password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user);

    const userResponse = {
      _id: user._id,
      username: user.username,
      email: user.email,
      avatarUrl: user.avatarUrl,
      branch: user.branch,
      year: user.year,
      bio: user.bio,
      reputationScore: user.reputationScore,
      role: user.role,
      createdAt: user.createdAt,
    };

    return res.status(200).json({
      message: 'Login successful',
      user: userResponse,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error('[Login Error]:', error);
    return res.status(500).json({ message: error.message || 'Server error during login' });
  }
};

/**
 * @desc    Refresh access token using refresh token
 * @route   POST /api/auth/refresh
 * @access  Public
 */
const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token is required' });
    }

    // Verify token
    const decoded = verifyRefreshToken(refreshToken);

    // Check if user still exists
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'Invalid refresh token, user not found' });
    }

    // Issue new access token & refresh token
    const tokens = generateTokens(user);

    return res.status(200).json({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });
  } catch (error) {
    console.error('[Refresh Token Error]:', error.message);
    return res.status(401).json({ message: 'Invalid or expired refresh token' });
  }
};

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/me
 * @access  Private (Protected)
 */
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('savedPosts');
    return res.status(200).json({
      user,
    });
  } catch (error) {
    console.error('[Get Me Error]:', error);
    return res.status(500).json({ message: 'Server error fetching user profile' });
  }
};

/**
 * @desc    Toggle saving/bookmarking a post
 * @route   POST /api/auth/bookmark/:postId
 * @access  Private
 */
const toggleBookmarkPost = async (req, res) => {
  try {
    const userId = req.user._id;
    const { postId } = req.params;

    const user = await User.findById(userId);
    const isSaved = user.savedPosts?.some((id) => id.toString() === postId);

    if (isSaved) {
      user.savedPosts = user.savedPosts.filter((id) => id.toString() !== postId);
    } else {
      user.savedPosts.push(postId);
    }

    await user.save();
    return res.status(200).json({
      isSaved: !isSaved,
      savedPosts: user.savedPosts,
    });
  } catch (error) {
    console.error('Bookmark Error:', error);
    return res.status(500).json({ message: 'Server error toggling bookmark' });
  }
};

/**
 * @desc    Get saved bookmarked posts
 * @route   GET /api/auth/saved-posts
 * @access  Private
 */
const getSavedPosts = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'savedPosts',
      populate: [{ path: 'authorId', select: 'username avatarUrl role branch year' }, { path: 'channelId', select: 'name slug' }],
    });

    return res.status(200).json({ savedPosts: user.savedPosts || [] });
  } catch (error) {
    console.error('Get Saved Posts Error:', error);
    return res.status(500).json({ message: 'Server error fetching saved posts' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { avatarUrl, bio, branch, year } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;
    if (bio !== undefined) user.bio = bio;
    if (branch !== undefined) user.branch = branch;
    if (year !== undefined) user.year = year;

    await user.save();

    return res.status(200).json({
      message: 'Profile updated successfully',
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        avatarUrl: user.avatarUrl,
        branch: user.branch,
        year: user.year,
        bio: user.bio,
        reputationScore: user.reputationScore,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Update Profile Error:', error);
    return res.status(500).json({ message: 'Server error updating profile' });
  }
};

module.exports = {
  signup,
  login,
  refresh,
  getMe,
  toggleBookmarkPost,
  getSavedPosts,
  updateProfile,
};
