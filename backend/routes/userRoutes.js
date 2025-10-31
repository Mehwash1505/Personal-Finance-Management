const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  updateUserProfile,
  changePassword, // <-- 1. Import karo
} = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.route('/profile').put(protect, updateUserProfile);

// --- 2. YEH NAYA ROUTE HAI ---
router.put('/profile/change-password', protect, changePassword);

module.exports = router;