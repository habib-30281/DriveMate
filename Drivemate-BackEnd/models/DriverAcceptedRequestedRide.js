const mongoose = require('mongoose');

const DriverAcceptedRequestedRide = new mongoose.Schema({
    passenger: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'passengerDetails',
        required: true,
    },
    ride: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'RequestedRide',
        required: true,
    },
    driver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DriverDetails',
        required: true
    },
    pickupLocation: {
        type: [Object],
        required: true
    },
    destinationLocation: {
        type: [Object],
        required: true
    },
    datetime: {
        type: Date,
        required: true
    },
    passengerGender: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'started', 'completed'],
        default: 'pending'
    }
}, { collection: 'DriverAcceptedRideDetails'});

module.exports = mongoose.model("DriverAcceptedRideDetails", DriverAcceptedRequestedRide);