const express = require('express');
const router = express.Router();

// Import the bouncer logic you just wrote
const { register, login } = require('../controllers/authController');

// Map the URLs to the logic
router.post('/register', register);
router.post('/login', login);

module.exports = router;