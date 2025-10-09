const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  testUserEndpoint,
} = require('../controllers/userController');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/test', testUserEndpoint); // Kept for testing

module.exports = router;