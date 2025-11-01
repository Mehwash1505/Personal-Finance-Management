const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs'); // <-- Make sure bcrypt is imported
const User = require('../models/User.js');

// --- Helper Function to Generate JWT ---
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
const registerUser = async (req, res) => {
  // ... (Your existing registerUser code... no changes here)
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Please add all fields' });
  }
  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({ message: 'User already exists' });
  }
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
  });
  if (user) {
    res.status(201).json({
      _id: user.id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } else {
    res.status(400).json({ message: 'Invalid user data' });
  }
};

// @desc    Authenticate a user (Login)
// @route   POST /api/users/login
// @access  Public
const loginUser = async (req, res) => {
  // ... (Your existing loginUser code... no changes here)
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (user && (await bcrypt.compare(password, user.password))) {
    res.json({
      _id: user.id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } else {
    res.status(400).json({ message: 'Invalid credentials' });
  }
};

// @desc    Update user profile (name)
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  // ... (Your existing updateUserProfile code... no changes here)
  const user = await User.findById(req.user.id);
  
  if (user) {
    user.name = req.body.name || user.name;

    if (req.body.preferences) {
      user.notificationPreferences = {
        sendBillAlerts: req.body.preferences.sendBillAlerts,
        sendBudgetAlerts: req.body.preferences.sendBudgetAlerts,
      };
    }

    const updatedUser = await user.save();

    res.status(200).json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      token: req.headers.authorization.split(' ')[1],
      notificationPreferences: updatedUser.notificationPreferences,
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};


// --- YEH NAYA FUNCTION HAI ---
// @desc    Change user password
// @route   PUT /api/users/profile/change-password
// @access  Private
const changePassword = async (req, res) => {
  const { oldPassword, newPassword, confirmPassword } = req.body;

  // 1. Check if new passwords match
  if (newPassword !== confirmPassword) {
    return res.status(400).json({ message: 'New passwords do not match' });
  }

  // 2. Get user from DB
  const user = await User.findById(req.user.id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  // 3. Compare old password
  const isMatch = await bcrypt.compare(oldPassword, user.password);
  if (!isMatch) {
    return res.status(400).json({ message: 'Incorrect old password' });
  }

  // 4. Hash and save new password
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(newPassword, salt);
  await user.save();

  res.status(200).json({ message: 'Password changed successfully' });
};
// --- END OF NEW FUNCTION ---


module.exports = {
  registerUser,
  loginUser,
  updateUserProfile,
  changePassword, // <-- Naya function yahan add karo
};