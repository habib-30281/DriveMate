const express = require('express');
const { getChats } = require('../controllers/chatcontroller');
const router = express.Router();

router.get('/chats/:userId/:userType', getChats);

module.exports = router;
