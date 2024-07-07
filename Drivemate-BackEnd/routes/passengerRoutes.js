const express = require('express');
const router = express.Router();
const passengerController = require('../controllers/passengerController');
const verifyToken = require('../middleware/verifyToken');

router.post('/passenger/register', passengerController.registerPassenger);
router.get('/passengerData', verifyToken, passengerController.getPassengerData);
router.get('/display-all-rides', passengerController.displayAllRides);
router.post('/acceptRide', verifyToken, passengerController.acceptRide);
router.get('/accepted-rides-for-passenger', verifyToken, passengerController.displayAcceptedRides);
router.post('/requestRide', verifyToken, passengerController.requestRide);
router.get('/display-requested-rides', verifyToken, passengerController.displayRequestedRides);
router.post('/cancelAcceptedRide-for-passenger', verifyToken, passengerController.cancelAcceptedRideForPassenger);
router.get('/display-accepted-rides-for-passenger-by-driver', verifyToken, passengerController.displayAcceptedRidesForPassengerByDriver);
router.post('/cancelRequestedRide', verifyToken, passengerController.cancelRequestedRide);
router.get('/passenger/completed-rides', verifyToken, passengerController.passengerCompletedRides);


const Ride = require('../models/RequestedRide');
const DriverAcceptedRequestedRide = require('../models/DriverAcceptedRequestedRide');

// const Driver = require('../models/DriverSchema');

router.post('/startAcceptedRideRequest', async (req, res) => {
    const { rideRequestId } = req.body;

    try {
        // Update the status of the ride request
        const rideRequest = await DriverAcceptedRequestedRide.findByIdAndUpdate(
            rideRequestId,
            { status: 'started' },
            { new: true }
        );

        if (!rideRequest) {
            return res.status(404).json({ status: 'Failure', message: 'Ride request not found' });
        }

        // Update the status of the corresponding ride
        const ride = await Ride.findByIdAndUpdate(
            rideRequest.ride,
            { status: 'started' },
            { new: true }
        );

        if (!ride) {
            return res.status(404).json({ status: 'Failure', message: 'Ride not found' });
        }

        res.json({ status: 'Success', data: rideRequest });
    } catch (error) {
        console.error('Error starting accepted ride request:', error);
        res.status(500).json({ status: 'Failure', message: 'Internal server error' });
    }
});





module.exports = router;

