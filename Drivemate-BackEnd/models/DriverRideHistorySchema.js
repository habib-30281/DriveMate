const mongoose = require('mongoose');

const DriverRideHistorySchema = new mongoose.Schema({
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
    passengerName: { type: String, required: true },
    
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


}, { collection: 'DriverRideHistory' });
module.exports = mongoose.model("DriverRideHistory", DriverRideHistorySchema);