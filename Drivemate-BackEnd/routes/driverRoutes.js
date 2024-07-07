const express = require('express');
const router = express.Router();
const multer = require('multer');
const driverController = require('../controllers/driverController');
const verifyToken = require('../middleware/verifyToken');

const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.resolve(__dirname, '../uploads'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = file.originalname.split('.').pop();
    cb(null, `${file.fieldname}-${uniqueSuffix}.${ext}`);
  }
});

const upload = multer({ storage });

router.post('/driver/register', upload.fields([
  { name: 'imageFront', maxCount: 1 },
  { name: 'imageBack', maxCount: 1 },
  { name: 'drivingLicense', maxCount: 1 },
  { name: 'carLicense', maxCount: 1 }
]), driverController.registerDriver);

router.post('/driverData', driverController.getDriverData);
router.post('/createRide', verifyToken, driverController.createRide);
router.get('/display-rides', verifyToken, driverController.displayRides);
router.post('/cancelRide', verifyToken, driverController.cancelRide);
router.get('/accepted-rides', verifyToken, driverController.acceptedRides);
router.get('/display-all-requested-rides-Todriver', driverController.displayAllRequestedRidesToDriver);
router.post('/acceptRequestedRide', verifyToken, driverController.acceptRequestedRide);
router.get('/display-accepted-ride-requests-for-driver', verifyToken, driverController.displayAcceptedRideRequestsForDriver);
router.post('/cancelAcceptedRide-for-driver', verifyToken, driverController.cancelAcceptedRideForDriver);
router.get('/completed-rides', verifyToken, driverController.displayCompletedRides)


const Ride = require('../models/RideSchema'); // Assuming RideDetails is your ride schema

const PassengerAcceptedRide = require('../models/PassengerAcceptedRideSchema');
const DriverRideHistory = require('../models/DriverRideHistorySchema');
const PassengerRideHistory = require('../models/PassengerRideHistory');



//api to start accepted ride ..
router.post('/startRide', async (req, res) => {
  const { rideId } = req.body;

  try {
    const ride = await Ride.findByIdAndUpdate(
      rideId,
      { status: 'started' },
      { new: true }
    );

    if (!ride) {
      return res.status(404).json({ status: 'Failure', message: 'Ride not found' });
    }

    await PassengerAcceptedRide.updateMany(
      { ride: rideId },
      { status: 'started' }
    );

    res.json({ status: 'Success', data: ride });
  } catch (error) {
    console.error('Error starting ride:', error);
    res.status(500).json({ status: 'Failure', message: 'Internal server error' });
  }
});




// End ride endpoint
// router.post('/endRide', async (req, res) => {
//   const { rideId } = req.body;

//   try {
//     // Update the ride status to 'completed'
//     const ride = await Ride.findByIdAndUpdate(
//       rideId,
//       { status: 'completed' },
//       { new: true }
//     );

//     if (!ride) {
//       return res.status(404).json({ status: 'Failure', message: 'Ride not found' });
//     }

//     // Update the status of all passenger accepted rides related to this ride
//     await PassengerAcceptedRide.updateMany(
//       { ride: rideId },
//       { status: 'completed' }
//     );

//     res.json({ status: 'Success', data: ride });
//   } catch (error) {
//     console.error('Error ending ride:', error);
//     res.status(500).json({ status: 'Failure', message: 'Internal server error' });
//   }
// });

router.post('/endRide', async (req, res) => {
  const { rideId } = req.body;

  try {
    // Find the ride by ID
    const ride = await Ride.findById(rideId).populate('driver');

    if (!ride) {
      return res.status(404).json({ status: 'Failure', message: 'Ride not found' });
    }

    // Find the passenger details from PassengerAcceptedRide schema
    const passengerAcceptedRide = await PassengerAcceptedRide.findOne({ ride: rideId }).populate('passenger');

    if (!passengerAcceptedRide) {
      return res.status(404).json({ status: 'Failure', message: 'Passenger details not found' });
    }

    // Create a new entry in DriverRideHistory
    const rideHistory = new DriverRideHistory({
      driver: ride.driver._id,
      ride: ride._id,
      passenger: passengerAcceptedRide.passenger._id,
      passengerName: passengerAcceptedRide.passenger.name,
      pickupLocation: ride.pickupLocation,
      destinationLocation: ride.destination,
      datetime: ride.datetime,
      status: 'completed'
    });

    await rideHistory.save();



    
    ride.status = 'completed';
    await ride.save();

    passengerAcceptedRide.status = 'completed';
    await passengerAcceptedRide.save();

    // passengerAcceptedRide.status = 'completed';
    // await passengerAcceptedRide.save();
   

    res.json({ status: 'Success', message: 'Ride ended and history stored successfully' });
  } catch (error) {
    console.error('Error ending ride:', error);
    res.status(500).json({ status: 'Failure', message: 'Internal server error' });
  }
});


router.post('/endPassengerRide', async (req, res) => {
  const { rideId } = req.body;
  console.log('Ride ID:', rideId); // Log the rideId
  console.log('Request body:', req.body); // Log the full body

  try {
      const passengerAcceptedRide = await PassengerAcceptedRide.findOne({ ride: rideId }).populate('passenger').populate({
          path: 'ride',
          populate: { path: 'driver' }
      });

      if (!passengerAcceptedRide) {
          console.log('Passenger accepted ride not found');
          return res.status(404).json({ status: 'Failure', message: 'Passenger accepted ride not found' });
      }

      const ride = passengerAcceptedRide.ride;
      if (!ride) {
          console.log('Ride not found');
          return res.status(404).json({ status: 'Failure', message: 'Ride not found' });
      }

      const driver = ride.driver;
      if (!driver) {
          console.log('Driver not found');
          return res.status(404).json({ status: 'Failure', message: 'Driver not found' });
      }

      const passengerRideHistory = new PassengerRideHistory({
          passenger: passengerAcceptedRide.passenger._id,
          driver: driver._id,
          ride: ride._id,
          driverName: driver.name,
          pickupLocation: ride.pickupLocation,
          destinationLocation: ride.destination,
          datetime: ride.datetime,
          status: 'completed'
      });

      await passengerRideHistory.save();

      // Log the status of the PassengerAcceptedRide after saving history
      const afterSavePassengerAcceptedRide = await PassengerAcceptedRide.findOne({ ride: rideId });
      console.log('Status after saving ride history:', afterSavePassengerAcceptedRide);

      res.json({ status: 'Success', message: 'Ride ended and passenger history stored successfully' });
  } catch (error) {
      console.error('Error ending passenger ride:', error);
      res.status(500).json({ status: 'Failure', message: 'Internal server error' });
  }
});



module.exports = router;




