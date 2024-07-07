


const mongoose = require('mongoose');

const PassengerAcceptedRideSchema = new mongoose.Schema({
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
    passenger: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'passengerDetails',
        required: true,
    },
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
    passengerGender: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'started', 'completed'],
        default: 'pending'
    }

}, { collection: 'passengerAcceptedRideDetails' });

module.exports = mongoose.model("passengerAcceptedRideDetails", PassengerAcceptedRideSchema);
