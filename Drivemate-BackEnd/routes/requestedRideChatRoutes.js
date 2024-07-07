const express = require('express');
const router = express.Router();
const RequestedRideChatController = require('../controllers/RequestedRideChatController');
const ChatEnableForRequestedRide = require('../controllers/chatcontroller');

router.post('/requestedRide-sendMessage', RequestedRideChatController.sendMessage);
// router.get('/getMessages/:rideId', RequestedRideChatController.getMessages);
router.get('/requestedRideChat/:rideId', RequestedRideChatController.getMessages);
router.post('/enableRequestedRideChat', ChatEnableForRequestedRide.enableChatForRequestedRide);
router.get('/driverList/:passengerId', RequestedRideChatController.getDriverListForPassenger);
module.exports = router;
