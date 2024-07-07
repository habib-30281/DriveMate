const mongoose = require("mongoose");

const RequestedRide = new mongoose.Schema({
    passenger: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'passengerDetails',
        required: true,
    },
    destination: {
        type: [Object],
        required: true
    },
    pickupLocation: {
        type: [Object],
        required: true
    },
    datetime: {
        type: Date,
        required: true
    },
    gender: {
        type: String,
    },
    noOfSeats: {
        type: Number,
        default: 1
    },
    chatEnabled: { type: Boolean, default: false },
    status: {
        type: String,
        enum: ['pending', 'started', 'completed'],
        default: 'pending'
    }

}, {collection: "RequestedRide"});

module.exports = mongoose.model("RequestedRide", RequestedRide);
