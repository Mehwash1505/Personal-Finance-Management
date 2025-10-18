const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  testUserEndpoint,
  updateUserProfile,
} = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/test', testUserEndpoint); // Kept for testing
router.route('/profile').put(protect, updateUserProfile);

module.exports = router;