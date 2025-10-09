const express = require('express');
const router = express.Router();
const { testUserEndpoint } = require('../controllers/userController');

// This will be reachable at http://localhost:5001/api/users/test
router.get('/test', testUserEndpoint);

module.exports = router;