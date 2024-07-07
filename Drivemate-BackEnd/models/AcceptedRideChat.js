

const mongoose = require('mongoose');

const AcceptedRideChatSchema = new mongoose.Schema({
  rideId: { type: mongoose.Schema.Types.ObjectId, ref: 'RideDetails', required: true },
  senderId: { type: mongoose.Schema.Types.ObjectId, refPath: 'senderType', required: true },
  senderType: { type: String, enum: ['DriverDetails', 'passengerDetails'], required: true },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('AcceptedRideChat', AcceptedRideChatSchema);