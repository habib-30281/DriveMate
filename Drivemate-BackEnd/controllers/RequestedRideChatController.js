const RequestedRideChat = require('../models/RequestedRideChat');
const RequestedRideDetails = require('../models/RequestedRide');
const DriverDetails = require('../models/DriverSchema');


exports.sendMessage = async (req, res) => {
  const { rideId, senderId, senderType, message } = req.body;
  try {
    const ride = await RequestedRideDetails.findById(rideId);
    if (!ride) return res.status(404).send('Requested ride not found');
    if (!ride.chatEnabled) return res.status(403).send('Chat is disabled for this requested ride');

    const chat = new RequestedRideChat({ rideId, senderId, senderType, message });
    await chat.save();

    res.status(200).send('Message sent');
  } catch (err) {
    console.error('Error in sendMessage:', err);
    res.status(500).send(err.message);
  }
};


exports.getMessages = async (req, res) => {
  const { rideId } = req.params;
  try {
    const messages = await RequestedRideChat.find({ rideId }).sort({ createdAt: 1 });
    res.status(200).json(messages);
  } catch (err) {
    res.status(500).send(err.message);
  }
}


// const RequestedRideChat = require('../models/RequestedRideChat');
// const RequestedRideDetails = require('../models/RequestedRide');
// const DriverDetails = require('../models/DriverSchema');

exports.getDriverListForPassenger = async (req, res) => {
  const passengerId = req.params.passengerId;

  try {
    console.log(`Fetching requested rides for passenger: ${passengerId}`);
    const rides = await RequestedRideDetails.find({ passenger: passengerId }).select('_id');
    if (rides.length === 0) {
      console.log('No requested rides found for this passenger');
      return res.status(404).send('No requested rides found for this passenger');
    }
    const rideIds = rides.map(ride => ride._id);
    console.log(`Rides found: ${rideIds}`);

    const messages = await RequestedRideChat.find({ rideId: { $in: rideIds } }).select('senderId rideId');
    console.log(`Messages found: ${messages}`);

    const senderIds = messages.map(message => message.senderId.toString());
    const rideIdMap = messages.reduce((acc, message) => {
      acc[message.senderId.toString()] = message.rideId;
      return acc;
    }, {});

    const drivers = await DriverDetails.find({ _id: { $in: senderIds } }).select('name email');
    const driversWithRideId = drivers.map(driver => ({
      _id: driver._id,
      name: driver.name,
      email: driver.email,
      rideId: rideIdMap[driver._id.toString()]
    }));

    console.log(`Drivers with rideId: ${JSON.stringify(driversWithRideId)}`);

    res.status(200).json(driversWithRideId);
  } catch (err) {
    console.error('Error in getDriverListForPassenger:', err);
    res.status(500).send(err.message);
  }
};