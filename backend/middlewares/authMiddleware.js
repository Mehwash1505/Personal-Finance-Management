const jwt = require('jsonwebtoken');
const User = require('../models/User.js');
 
const protect = async (req, res, next) => {
  let token;

  // First, try to get the token from the standard Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  // --- THIS IS THE NEW PART ---
  // If no token in the header, check if it was passed as a query parameter
  else if (req.query.token) {
    token = req.query.token;
  }
  // --- END OF NEW PART ---

  // If we still don't have a token after checking both places...
  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  // If we have a token (from either place), try to verify it
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    next(); // All good, proceed to the actual route handler
  } catch (error) {
    console.error('Token verification failed:', error);
    res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

module.exports = { protect };
