const mongoose = require("mongoose");

const RideSchema = new mongoose.Schema({
    driver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DriverDetails',
        required: true
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
    passengers: {
        type: Number,
        default: 1
    },
    pricePerSeat: {
        type: Number,
        required: true
    },
    chatEnabled: {
        type: Boolean,
        default: false // Default to false
    },
    status: {
        type: String,
        enum: ['pending', 'started', 'completed'],
        default: 'pending'
    }
}, { collection: "RideDetails" });

// Ensure that the coordinates fields are indexed for geospatial queries
RideSchema.index({ destinationCoordinates: '2dsphere', pickupCoordinates: '2dsphere' });

module.exports = mongoose.model("RideDetails", RideSchema); // Ensure correct export
