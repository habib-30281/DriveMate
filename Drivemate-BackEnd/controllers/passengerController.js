const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('../models/PassengerSchema')
const PassengerDetails = mongoose.model('passengerDetails');

require('../models/RideSchema')
const RideDetails = mongoose.model('RideDetails');

require('../models/PassengerAcceptedRideSchema')
const PassengerAcceptedRideDetails = mongoose.model('passengerAcceptedRideDetails');

require('../models/RequestedRide')
const RequestedRide = mongoose.model('RequestedRide');

require('../models/DriverAcceptedRequestedRide')
const DriverAcceptedRideDetails = mongoose.model('DriverAcceptedRideDetails');

require('../models/PassengerRideHistory');
const PassengerRideHistory = mongoose.model("passengerRideHistory");


const JWT_SECRET = process.env.JWT_SECRET;



exports.registerPassenger = async (req, res) => {
    const { name, email, mobile, gender, age, password } = req.body;
    const oldUser = await PassengerDetails.findOne({ email });

    if (oldUser) {
        return res.status(409).send({ status: "Error", data: "User Already Exist!!" });
    }

    const encryptedPassword = await bcrypt.hash(password, 10);
    try {
        await PassengerDetails.create({
            name,
            email,
            mobile,
            gender,
            age,
            password: encryptedPassword
        });
        res.status(201).send({ status: "ok", data: "User Created" });
    } catch (error) {
        console.error(error);
        res.status(500).send({ status: "Error", data: "An error occurred during registration" });
    }
};



exports.getPassengerData = async (req, res) => {
    const passengerId = req.user.id;
    try {
        const passenger = await PassengerDetails.findById(passengerId);
        if (!passenger) {
            return res.status(404).send({ status: "Error", message: "Passenger not found" });
        }
        res.send({ status: "ok", data: passenger });
    } catch (error) {
        console.error('Error retrieving passenger data:', error);
        res.status(500).send({ status: "Error", message: "An error occurred while retrieving passenger data" });
    }
};




exports.displayAllRides = async (req, res) => {
    try {
        const rides = await RideDetails.find({})
            .populate('driver', 'name email mobile')
            .exec();

        if (rides.length === 0) {
            return res.status(200).send({ status: "Error", message: "No rides found" });
        }
        res.status(200).send({ status: "Success", data: rides });
    } catch (error) {
        console.error('Error retrieving ride data:', error);
        res.status(500).send({ status: "Error", message: "An error occurred while retrieving ride data" });
    }
};



exports.acceptRide = async (req, res) => {
    const { rideId, pickupLocation, destinationLocation, datetime, passengerGender } = req.body;
    const passengerId = req.user.id;

    try {
        const ride = await RideDetails.findById(rideId);
        if (!ride) {
            return res.status(404).send({ status: "Error", message: "Ride not found" });
        }

        if (ride.passengers <= 0) {
            return res.status(400).send({ status: "Error", message: "No seats available" });
        }

        ride.passengers -= 1;
        await ride.save();

        const newAcceptedRide = new PassengerAcceptedRideDetails({
            driver: ride.driver,
            ride: rideId,
            passenger: passengerId,
            pickupLocation,
            destinationLocation,
            datetime,
            passengerGender
        });

        await newAcceptedRide.save();
        res.status(201).send({ status: "Success", data: newAcceptedRide });
    } catch (error) {
        console.error('Error accepting ride:', error);
        res.status(500).send({ status: "Error", message: "Error processing your request" });
    }
};



exports.displayAcceptedRides = async (req, res) => {
    const passengerId = req.user.id;

    try {
        const acceptedRides = await PassengerAcceptedRideDetails.find({ passenger: passengerId })
            .populate('ride')
            .populate('driver', 'name email mobile');

        if (!acceptedRides.length) {
            return res.status(200).send({ status: "Success", data: [] });
        }

        res.status(200).send({ status: "Success", data: acceptedRides });
    } catch (error) {
        console.error('Error retrieving accepted rides:', error);
        res.status(500).send({ status: "Error", message: "An error occurred while retrieving data", error: error.toString() });
    }
};



exports.requestRide = async (req, res) => {
    const { destination, pickupLocation, datetime, gender, noOfSeats } = req.body;
    const passengerId = req.user.id;

    try {
        const newRequestedRide = await RequestedRide.create({
            passenger: passengerId,
            destination,
            pickupLocation,
            datetime,
            gender,
            noOfSeats
        });

        res.status(201).send({ status: "Success", data: "Ride request created successfully" });
    } catch (error) {
        console.error('Error creating ride request:', error);
        res.status(500).send({ status: "Error", message: "An error occurred while creating the ride request" });
    }
};



exports.displayRequestedRides = async (req, res) => {
    const passengerId = req.user.id;

    try {
        const requestedRides = await RequestedRide.find({ passenger: passengerId });
        if (!requestedRides || requestedRides.length === 0) {
            return res.status(200).send({ status: "Success", data: [] });
        }
        res.status(200).send({ status: "Success", data: requestedRides });
    } catch (error) {
        console.error('Error retrieving requested ride data:', error);
        res.status(500).send({ status: "Error", message: "An error occurred while retrieving requested ride data" });
    }
};


exports.cancelAcceptedRideForPassenger = async (req, res) => {
    const passengerId = req.user.id;
    const { acceptedRideId } = req.body;

    try {
        const acceptedRide = await PassengerAcceptedRideDetails.findById(acceptedRideId)
            .populate('ride');

        if (!acceptedRide || acceptedRide.passenger.toString() !== passengerId) {
            return res.status(404).send({ status: "Error", message: "Accepted ride not found or does not belong to the passenger" });
        }

        const ride = await RideDetails.findById(acceptedRide.ride._id);
        if (ride) {
            ride.passengers += 1;
            await ride.save();
        }

        await acceptedRide.deleteOne();
        res.status(200).send({ status: "Success", message: "Accepted ride cancelled and seat count updated" });
    } catch (error) {
        console.error('Error cancelling accepted ride:', error);
        res.status(500).send({ status: "Error", message: "An error occurred while cancelling the accepted ride" });
    }
};



exports.displayAcceptedRidesForPassengerByDriver = async (req, res) => {
    const passengerId = req.user.id;

    try {
        const acceptedRides = await DriverAcceptedRideDetails.find({ passenger: passengerId })
            .populate('ride')
            .populate('driver', 'name email mobile');

        if (!acceptedRides.length) {
            return res.status(200).send({ status: "Success", data: [] });
        }

        res.status(200).send({ status: "Success", data: acceptedRides });
    } catch (error) {
        console.error('Error retrieving accepted rides for passenger:', error);
        res.status(500).send({ status: "Error", message: "An error occurred while retrieving data", error: error.toString() });
    }
};



exports.cancelRequestedRide = async (req, res) => {
    const passengerId = req.user.id;
    const { rideRequestId } = req.body;

    try {
        const rideRequest = await RequestedRide.findOne({
            _id: rideRequestId,
            passenger: passengerId
        });

        if (!rideRequest) {
            return res.status(404).send({ status: "Error", data: "Ride request not found or not belonging to the requesting passenger" });
        }

        await rideRequest.deleteOne();

        const deleteResult = await DriverAcceptedRideDetails.deleteOne({
            ride: rideRequestId
        });

        res.status(200).send({ status: "Success", data: "Requested ride and any accepted entries deleted successfully" });
    } catch (error) {
        console.error('Error deleting requested ride:', error);
        res.status(500).send({ status: "Error", data: "An error occurred while deleting the requested ride" });
    }
};



exports.passengerCompletedRides = async (req, res) => {
    const passengerId = req.user.id;

    try {
        const completedRides = await PassengerRideHistory.find({
            passenger: passengerId,
            status: 'completed'
        }).populate('driver').populate('ride');

        if (!completedRides || completedRides.length === 0) {
            return res.status(200).send({ status: "Success", message: "No completed rides found", data: [] });
        }

        res.status(200).send({ status: "Success", data: completedRides });
    } catch (error) {
        console.error('Error retrieving passenger ride history:', error);
        res.status(500).send({ status: "Error", message: "An error occurred while retrieving passenger ride history" });
    }
};