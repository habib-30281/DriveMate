const mongoose = require("mongoose");

const DriverSchema = new mongoose.Schema({
    name: String,
    email: {type: String, unique: true},
    mobile: {type: String, unique: true},
    gender: String,
    age: Number,
    password: String,
    imageFront: String,
    imageBack: String,
    drivingLicense: String,
    carLicense: String,
    selectCarBrand: String,
}, {collection: "DriverDetails"});

module.exports = mongoose.model("DriverDetails", DriverSchema);