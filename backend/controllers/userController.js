// controllers/userController.js

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs'); // <-- Make sure bcrypt is imported
const User = require('../models/User.js');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');

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
    
    if (user.isTwoFactorEnabled) {
      // 2FA on hai, permanent token mat do
      // Ek temporary token do jo sirf 5 min chalega
      const tempToken = jwt.sign(
        { id: user._id, is2FAPending: true },
        process.env.JWT_SECRET,
        { expiresIn: '5m' }
      );
      res.json({
        message: 'Please verify 2FA',
        requires2FA: true,
        tempToken: tempToken,
      });
    } else {
      // 2FA on nahi hai, normal login karo
      res.json({
        _id: user.id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
        notificationPreferences: user.notificationPreferences,
      });
    }
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
      isTwoFactorEnabled: updateUserProfile.isTwoFactorEnabled,
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

// --- YEH SAARA NAYA CODE HAI ---

// @desc    Generate a new 2FA secret for the user
// @route   POST /api/users/2fa/generate
// @access  Private
const generate2FASecret = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const secret = speakeasy.generateSecret({
      name: `PFM Dashboard (${user.email})`,
    });

    user.twoFactorSecret = {
      base32: secret.base32,
      otpauth_url: secret.otpauth_url,
    };
    await user.save();

    qrcode.toDataURL(secret.otpauth_url, (err, data_url) => {
      if (err) {
        throw new Error('Could not generate QR code');
      }
      res.json({
        qrCodeUrl: data_url,
      });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error generating 2FA secret' });
  }
};

// @desc    Verify 2FA token and enable 2FA
// @route   POST /api/users/2fa/verify
// @access  Private
const verify2FA = async (req, res) => {
  const { token } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isVerified = speakeasy.totp.verify({
      secret: user.twoFactorSecret.base32,
      encoding: 'base32',
      token: token,
    });

    if (isVerified) {
      user.isTwoFactorEnabled = true; // Ab 2FA permanent ON
      await user.save();

      const updatedUser = await User.findById(req.user.id);
      res.status(200).json({
         message: '2FA enabled successfully!' ,
         user: {
          _id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          token: req.headers.authorization.split(' ')[1],
          notificationPreferences: updatedUser.notificationPreferences,
          isTwoFactorEnabled: updatedUser.isTwoFactorEnabled,
        }
      });
    } else {
      res.status(400).json({ message: 'Invalid 2FA token. Please try again.' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error verifying 2FA' });
  }
};

// @desc    Disable 2FA
// @route   POST /api/users/2fa/disable
// @access  Private
const disable2FA = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.isTwoFactorEnabled = false;
    user.twoFactorSecret = undefined; // Secret ko delete kardo
    await user.save();

    const updatedUser = await User.findById(req.user.id);
    res.status(200).json({ 
      message: '2FA disabled successfully.',
      user: {
         _id: updatedUser._id,
         name: updatedUser.name,
         email: updatedUser.email,
         token: req.headers.authorization.split(' ')[1],
         notificationPreferences: updatedUser.notificationPreferences,
         isTwoFactorEnabled: updatedUser.isTwoFactorEnabled,
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error disabling 2FA' });
  }
};

// @desc    Verify 2FA code after login
// @route   POST /api/users/login/verify-2fa
// @access  Public (but needs tempToken)
const verify2FALogin = async (req, res) => {
  const { tempToken, token } = req.body; // tempToken & 6-digit token

  try {
    const decodedTemp = jwt.verify(tempToken, process.env.JWT_SECRET);
    if (!decodedTemp.is2FAPending) {
      return res.status(401).json({ message: 'Invalid or expired token.' });
    }

    const user = await User.findById(decodedTemp.id);
    if (!user || !user.isTwoFactorEnabled) {
      return res.status(401).json({ message: 'User not found or 2FA not enabled.' });
    }

    const isVerified = speakeasy.totp.verify({
      secret: user.twoFactorSecret.base32,
      encoding: 'base32',
      token: token,
    });

    if (isVerified) {
      res.json({
        _id: user.id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
        notificationPreferences: user.notificationPreferences,
        isTwoFactorEnabled: user.isTwoFactorEnabled,
      });
    } else {
      res.status(400).json({ message: 'Invalid 2FA token.' });
    }
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token.' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  updateUserProfile,
  changePassword, // <-- New function added
  generate2FASecret,
  verify2FA,
  disable2FA,
  verify2FALogin,
};
