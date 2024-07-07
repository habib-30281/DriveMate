const AcceptedRideChat = require('../models/AcceptedRideChat');
const RideDetails = require('../models/RideSchema');
const PassengerDetails = require('../models/PassengerSchema');


exports.sendMessage = async (req, res) => {
  const { rideId, senderId, senderType, message } = req.body;
  try {
    const ride = await RideDetails.findById(rideId);
    if (!ride) {
      console.log('Ride not found');
      return res.status(404).send('Ride not found');
    }
    if (!ride.chatEnabled) {
      console.log('Chat is disabled for this ride');
      return res.status(403).send('Chat is disabled for this ride');
    }

    const chat = new AcceptedRideChat({ rideId, senderId, senderType, message });
    await chat.save();

    res.status(200).send('Message sent');
  } catch (err) {
    console.error('Error sending message:', err);
    res.status(500).send(err.message);
  }
};


exports.getMessages = async (req, res) => {
  const { rideId } = req.params;
  try {
    const messages = await AcceptedRideChat.find({ rideId }).sort({ createdAt: 1 });
    res.status(200).json(messages);
  } catch (err) {
    res.status(500).send(err.message);
  }
};



exports.getPassengerListForDriver = async (req, res) => {
  const driverId = req.params.driverId;

  try {
    console.log(`Fetching rides for driver: ${driverId}`);
    const rides = await RideDetails.find({ driver: driverId }).select('_id');
    if (rides.length === 0) {
      console.log('No rides found for this driver');
      return res.status(404).send('No rides found for this driver');
    }
    const rideIds = rides.map(ride => ride._id);
    console.log(`Rides found: ${rideIds}`);

    const messages = await AcceptedRideChat.find({ rideId: { $in: rideIds } }).select('senderId rideId');
    console.log(`Messages found: ${messages}`);

    const senderIds = messages.map(message => message.senderId.toString());
    const rideIdMap = messages.reduce((acc, message) => {
      acc[message.senderId.toString()] = message.rideId;
      return acc;
    }, {});

    const passengers = await PassengerDetails.find({ _id: { $in: senderIds } }).select('name email');
    const passengersWithRideId = passengers.map(passenger => ({
      _id: passenger._id,
      name: passenger.name,
      email: passenger.email,
      rideId: rideIdMap[passenger._id.toString()]
    }));

    console.log(`Passengers with rideId: ${JSON.stringify(passengersWithRideId)}`);

    res.status(200).json(passengersWithRideId);
  } catch (err) {
    console.error('Error in getPassengerListForDriver:', err);
    res.status(500).send(err.message);
  }
};

