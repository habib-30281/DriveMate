const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

require('../models/DriverSchema');
const DriverDetails = mongoose.model('DriverDetails');

require('../models/RideSchema');
const RideDetails = mongoose.model('RideDetails');

require('../models/PassengerAcceptedRideSchema');
const PassengerAcceptedRideDetails = mongoose.model('passengerAcceptedRideDetails');

require('../models/RequestedRide');
const RequestedRide = mongoose.model('RequestedRide');

require('../models/DriverAcceptedRequestedRide');
const DriverAcceptedRideDetails = mongoose.model('DriverAcceptedRideDetails');

require('../models/DriverRideHistorySchema');
const DriverRideHistory = mongoose.model('DriverRideHistory');


const JWT_SECRET = process.env.JWT_SECRET;





exports.registerDriver = async (req, res) => {
    const { name, email, mobile, gender, age, password, selectCarBrand } = req.body;
    const files = req.files;

    const photoFrontPath = files.imageFront ? files.imageFront[0].path : undefined;
    const photoBackPath = files.imageBack ? files.imageBack[0].path : undefined;
    const drivingLicensePath = files.drivingLicense ? files.drivingLicense[0].path : undefined;
    const carLicensePath = files.carLicense ? files.carLicense[0].path : undefined;

    try {
        const oldUser = await DriverDetails.findOne({ email });
        if (oldUser) {
            return res.status(409).send({ message: "User Already Exist!!" });
        }

        const encryptedPassword = await bcrypt.hash(password, 10);

        const newUser = await DriverDetails.create({
            name,
            email,
            mobile,
            gender,
            age,
            password: encryptedPassword,
            imageFront: photoFrontPath,
            imageBack: photoBackPath,
            drivingLicense: drivingLicensePath,
            carLicense: carLicensePath,
            selectCarBrand
        });

        res.status(201).send({ status: "ok", data: "User Created", userId: newUser._id });
    } catch (error) {
        console.error("Registration Error:", error);
        if (error.name === 'MongoError' && error.code === 11000) {
            res.status(409).send({ status: "Error", data: "Duplicate entry detected." });
        } else {
            res.status(500).send({ status: "Error", data: "An internal server error occurred." });
        }
    }
};




exports.getDriverData = async (req, res) => {
    const { token } = req.body;

    if (!token) {
        return res.status(400).send({ status: "Error", message: "Token must be provided" });
    }

    try {
        const decodedUser = jwt.verify(token, JWT_SECRET);
        console.log("Decoded JWT:", decodedUser); // Check the output in your server logs

        DriverDetails.findOne({ email: decodedUser.email })
            .then((data) => {
                if (!data) {
                    return res.status(404).send({ status: "Error", message: "Driver not found." });
                }
                res.send({ status: "ok", data: data });
            })
            .catch(error => {
                console.error("Database query failed:", error);
                res.status(500).send({ status: "Error", message: "Database query failed" });
            });

    } catch (error) {
        console.error("Error verifying token:", error);
        res.status(401).send({ status: "Error", message: "Invalid Token" });
    }
};


exports.createRide = async (req, res) => {
    const { destination, pickupLocation, datetime, gender, passengers, pricePerSeat } = req.body;
    const driverId = req.user.id;

    try {
        await RideDetails.create({
            driver: driverId,
            destination,
            pickupLocation,
            datetime,
            gender,
            passengers,
            pricePerSeat,
        });

        res.status(201).send({ status: "Success", data: "Ride created successfully" });
    } catch (error) {
        console.error('Error creating ride:', error);
        res.status(500).send({ status: "Error", data: "An Error Occurred During Creating Ride" });
    }
};



exports.displayRides = async (req, res) => {
    const driverId = req.user.id;

    try {
        const rides = await RideDetails.find({ driver: driverId }).populate('driver');
        if (!rides || rides.length === 0) {
            return res.status(200).send({ status: "Success", message: "No rides found", data: [] });
        }
        res.status(200).send({ status: "Success", data: rides });
    } catch (error) {
        console.error('Error retrieving ride data:', error);
        res.status(500).send({ status: "Error", message: "An error occurred while retrieving ride data" });
    }
};




exports.cancelRide = async (req, res) => {
    const driverId = req.user.id;
    const { rideId } = req.body;

    try {
        const ride = await RideDetails.findOne({ _id: rideId, driver: driverId });
        if (!ride) {
            return res.status(404).send({ status: "Error", data: "Ride not found or you are not the driver of this ride" });
        }

        await ride.deleteOne();

        const deleteResult = await PassengerAcceptedRideDetails.deleteMany({ ride: rideId });
        res.status(200).send({ status: "Success", data: "Ride and related entries deleted successfully" });
    } catch (error) {
        console.error('Error deleting ride:', error);
        res.status(500).send({ status: "Error", data: "An error occurred while deleting the ride" });
    }
};



// exports.acceptedRides = async (req, res) => {
//     const driverId = req.user.id;

//     try {
//         const acceptedRides = await PassengerAcceptedRideDetails.find({ driver: driverId })
//             .populate('ride')
//             .populate('passenger', 'name email');

//         if (!acceptedRides.length) {
//             return res.status(200).send({ status: "Success", data: [] });
//         }

//         res.status(200).send({ status: "Success", data: acceptedRides });
//     } catch (error) {
//         console.error('Error retrieving accepted rides:', error);
//         res.status(500).send({ status: "Error", message: "An error occurred while retrieving data", error: error.toString() });
//     }
// };


exports.acceptedRides = async (req, res) => {
    const driverId = req.user.id;

    try {
        const acceptedRides = await PassengerAcceptedRideDetails.find({ driver: driverId })
            .populate('ride')
            .populate('passenger', 'name email');

        acceptedRides.forEach(ride => {
            console.log('Passenger:', ride.passenger);
        });

        if (!acceptedRides.length) {
            return res.status(200).send({ status: "Success", data: [] });
        }

        res.status(200).send({ status: "Success", data: acceptedRides });
    } catch (error) {
        console.error('Error retrieving accepted rides:', error);
        res.status(500).send({ status: "Error", message: "An error occurred while retrieving data", error: error.toString() });
    }
};



exports.displayAllRequestedRidesToDriver = async (req, res) => {
    try {
        const requestedRides = await RequestedRide.find({})
            .populate('passenger', 'name email mobile')
            .exec();

        if (requestedRides.length === 0) {
            return res.status(200).send({ status: "Success", message: "No requested rides found", data: [] });
        }
        res.status(200).send({ status: "Success", data: requestedRides });
    } catch (error) {
        console.error('Error retrieving ride request data:', error);
        res.status(500).send({ status: "Error", message: "An error occurred while retrieving ride request data" });
    }
};



exports.acceptRequestedRide = async (req, res) => {
    const { requestedRideId, pickupLocation, destinationLocation, datetime, passengerGender } = req.body;
    const driverId = req.user.id;

    try {
        const requestRide = await RequestedRide.findById(requestedRideId);
        if (!requestRide) {
            return res.status(404).send({ status: "Error", message: "Requested ride not found" });
        }

        const alreadyAccepted = await DriverAcceptedRideDetails.findOne({ ride: requestedRideId });
        if (alreadyAccepted) {
            return res.status(400).send({ status: "Error", message: "This ride has already been accepted by another driver." });
        }

        const newAcceptedRide = new DriverAcceptedRideDetails({
            passenger: requestRide.passenger,
            ride: requestedRideId,
            driver: driverId,
            pickupLocation: pickupLocation || requestRide.pickupLocation,
            destinationLocation: destinationLocation || requestRide.destinationLocation,
            datetime: datetime || requestRide.datetime,
            passengerGender: passengerGender || requestRide.gender
        });

        await newAcceptedRide.save();
        res.status(201).send({ status: "Success", data: "Ride request accepted successfully" });
    } catch (error) {
        console.error('Error accepting requested ride:', error);
        res.status(500).send({ status: "Error", message: "Error processing your request" });
    }
};


exports.displayAcceptedRideRequestsForDriver = async (req, res) => {
    const driverId = req.user.id;

    try {
        const acceptedRideRequests = await DriverAcceptedRideDetails.find({ driver: driverId })
            .populate('ride')
            .populate('passenger', 'name email mobile');

        if (!acceptedRideRequests.length) {
            return res.status(200).send({ status: "Success", data: [] });
        }

        res.status(200).send({ status: "Success", data: acceptedRideRequests });
    } catch (error) {
        console.error('Error retrieving accepted ride requests:', error);
        res.status(500).send({ status: "Error", message: "An error occurred while retrieving data", error: error.toString() });
    }
};





exports.cancelAcceptedRideForDriver = async (req, res) => {
    const driverId = req.user.id;
    const { acceptedRideId } = req.body;

    try {
        const acceptedRide = await DriverAcceptedRideDetails.findById(acceptedRideId).populate('ride');
        if (!acceptedRide) {
            return res.status(404).send({ status: "Error", message: "Accepted ride not found" });
        }

        if (acceptedRide.driver.toString() !== driverId) {
            return res.status(403).send({ status: "Error", message: "You do not have permission to cancel this ride" });
        }

        await acceptedRide.deleteOne();
        res.status(200).send({ status: "Success", message: "Accepted ride cancelled and seat count updated" });
    } catch (error) {
        console.error('Error cancelling accepted ride:', error);
        res.status(500).send({ status: "Error", message: "An error occurred while cancelling the accepted ride" });
    }
};



// Function to display completed rides for a driver
exports.displayCompletedRides = async (req, res) => {
    const driverId = req.user.id;

    try {
        const rides = await DriverRideHistory.find({ driver: driverId, status: 'completed' })
            .populate('driver')
            .populate('ride')
            .populate('passenger');

        if (!rides || rides.length === 0) {
            return res.status(200).send({ status: "Success", message: "No completed rides found", data: [] });
        }

        res.status(200).send({ status: "Success", data: rides });
    } catch (error) {
        console.error('Error retrieving completed ride data:', error);
        res.status(500).send({ status: "Error", message: "An error occurred while retrieving completed ride data" });
    }
};