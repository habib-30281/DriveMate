const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('../models/PassengerSchema');
require('../models/DriverSchema');

const PassengerDetails = mongoose.model('passengerDetails');
const DriverDetails = mongoose.model('DriverDetails');

const JWT_SECRET = process.env.JWT_SECRET;

exports.loginPassenger = async (req, res) => {
  const { email, password } = req.body;
  try {
    const existingUser = await PassengerDetails.findOne({ email });

    if (!existingUser) {
      return res.status(404).send({ status: "Error", data: "User doesn't exist!" });
    }

    const isPasswordValid = await bcrypt.compare(password, existingUser.password);
    if (isPasswordValid) {
      const token = jwt.sign(
        { id: existingUser._id.toString(), email: existingUser.email },
        JWT_SECRET
      );
      return res.status(200).send({ status: "ok", token });
    } else {
      return res.status(401).send({ status: "Error", data: "Invalid password" });
    }
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).send({ status: "Error", data: "An internal server error occurred." });
  }
};

exports.loginDriver = async (req, res) => {
  const { email, password } = req.body;
  try {
    const existingUser = await DriverDetails.findOne({ email });

    if (!existingUser) {
      return res.status(404).send({ status: "Error", data: "User doesn't exist!" });
    }

    const isPasswordValid = await bcrypt.compare(password, existingUser.password);
    if (isPasswordValid) {
      const token = jwt.sign(
        { id: existingUser._id.toString(), email: existingUser.email },
        JWT_SECRET
      );
      console.log("JWT Signed with:", { id: existingUser._id.toString(), email: existingUser.email });
      return res.status(200).send({ status: "ok", token });
    } else {
      return res.status(401).send({ status: "Error", data: "Invalid Password" });
    }
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).send({ status: "Error", data: "An internal server error occurred." });
  }
};
