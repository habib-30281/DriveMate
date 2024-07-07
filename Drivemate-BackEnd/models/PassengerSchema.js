const mongoose = require('mongoose');

const PassengerSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    mobile: String,
    gender: String,
    age: Number,
    password: String
}, { collection: 'passengerDetails' });

module.exports = mongoose.model('passengerDetails', PassengerSchema);


