const AcceptedRideChat = require('../models/AcceptedRideChat');
const RequestedRideChat = require('../models/RequestedRideChat');
const RideDetails = require('../models/RideSchema');
const RequestedRideDetails = require('../models/RequestedRide');


exports.getChats = async (req, res) => {
  const { userId, userType } = req.params;

  try {
    const acceptedChats = await AcceptedRideChat.aggregate([
      { $match: { senderId: userId, senderType: userType } },
      { $sort: { createdAt: -1 } },
      { $group: { _id: "$rideId", latestMessage: { $first: "$$ROOT" } } }
    ]);

    const requestedChats = await RequestedRideChat.aggregate([
      { $match: { senderId: userId, senderType: userType } },
      { $sort: { createdAt: -1 } },
      { $group: { _id: "$rideId", latestMessage: { $first: "$$ROOT" } } }
    ]);

    res.status(200).json({ acceptedChats, requestedChats });
  } catch (err) {
    res.status(500).send(err.message);
  }
};


exports.enableChat = async (req, res) => {
  const { rideId } = req.body;
  try {
    const ride = await RideDetails.findById(rideId);
    if (!ride) {
      return res.status(404).send('Ride not found');
    }

    ride.chatEnabled = true;
    await ride.save();

    res.status(200).send('Chat enabled for this ride');
  } catch (err) {
    res.status(500).send(err.message);
  }
};



exports.enableChatForRequestedRide = async (req, res) => {
  const { rideId } = req.body;
  console.log(`Received rideId: ${rideId}`); // Add logging
  try {
    const ride = await RequestedRideDetails.findById(rideId);
    if (!ride) return res.status(404).send('Requested ride not found');

    console.log(`Enabling chat for requested ride: ${rideId}`); // Add logging
    ride.chatEnabled = true;
    await ride.save();

    console.log(`Chat enabled for requested ride: ${rideId}`); // Add logging
    res.status(200).send('Chat enabled for this requested ride');
  } catch (err) {
    console.error('Error in enableChatForRequestedRide:', err);
    res.status(500).send(err.message);
  }
};