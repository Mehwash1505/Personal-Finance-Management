const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  updateUserProfile,
  changePassword, // Import
  generate2FASecret,
  verify2FA,
  disable2FA,
  verify2FALogin,
} = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.route('/profile').put(protect, updateUserProfile);

// --- 2. YEH NAYA ROUTE HAI ---
router.put('/profile/change-password', protect, changePassword);

router.post('/2fa/generate', protect, generate2FASecret);
router.post('/2fa/verify', protect, verify2FA);
router.post('/2fa/disable', protect, disable2FA);
router.post('/login/verify-2fa', verify2FALogin);

module.exports = router;