const express = require('express');
const router = express.Router();
const AcceptedRideChatController = require('../controllers/AcceptedRideChatController');
const ChatController = require('../controllers/chatcontroller'); // Import the new controller
router.post('/sendMessage', AcceptedRideChatController.sendMessage);
// router.get('/getMessages/:rideId', AcceptedRideChatController.getMessages);
router.get('/acceptedRideChat/:rideId', AcceptedRideChatController.getMessages);
router.get('/passengerList/:driverId', AcceptedRideChatController.getPassengerListForDriver); // New route

router.post('/enableChat', ChatController.enableChat);

module.exports = router;

