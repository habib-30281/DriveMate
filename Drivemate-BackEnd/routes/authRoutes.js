const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');


router.post('/login-passenger', authController.loginPassenger);
router.post('/login-driver', authController.loginDriver);

module.exports = router;
