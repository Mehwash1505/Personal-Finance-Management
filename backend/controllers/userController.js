// @desc    Test endpoint
// @route   GET /api/users/test
// @access  Public
const testUserEndpoint = (req, res) => {
  res.json({ message: 'API endpoints working' });
};

module.exports = {
  testUserEndpoint,
};