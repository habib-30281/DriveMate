
// const mongoose = require('mongoose');

const mongoose = require('mongoose');

const PassengerRideHistory = new mongoose.Schema({
        passenger: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'passengerDetails',
        required: true,
    },
    driver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DriverDetails',
        required: true
    },
    ride: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'RideDetails',
        required: true,
    },
    driverName: { type: String, required: true },
    
    pickupLocation: {
        type: [Object], // Store the full object in an array
        required: true
    },
    destinationLocation: {
        type: [Object], // Store the full object in an array
        required: true
    },
    datetime: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'started', 'completed'],
        default: 'pending'
    }

}, {collection: 'passengerRideHistory'});
module.exports = mongoose.model('passengerRideHistory', PassengerRideHistory);

