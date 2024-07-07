
const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const socketIo = require('socket.io');
const app = express();
require('dotenv').config();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
const mongoURL = process.env.MONGO_URL;
mongoose.connect(mongoURL)
  .then(() => console.log("Database connected"))
  .catch(err => {
    console.log("Database connection error:", err);
    process.exit(1); // Exit the application if the database connection fails
  });

// Models
require('./models/PassengerSchema');
require('./models/DriverSchema');
require('./models/RideSchema');
require('./models/PassengerAcceptedRideSchema');
require('./models/RequestedRide');
require('./models/DriverAcceptedRequestedRide');
const AcceptedRideChat = require('./models/AcceptedRideChat'); // Import AcceptedRideChat model
const RequestedRideChat = require('./models/RequestedRideChat');

// Routes
const passengerRoutes = require('./routes/passengerRoutes');
const driverRoutes = require('./routes/driverRoutes');
const authRoutes = require('./routes/authRoutes');
const acceptedRideChatRoutes = require('./routes/acceptedRideChatRoutes'); // Add accepted ride chat routes
const requestedRideChatRoutes = require('./routes/requestedRideChatRoutes'); // Add requested ride chat routes

// Use routes without prefix
app.use('/', passengerRoutes);
app.use('/', driverRoutes);
app.use('/', authRoutes);
app.use('/', acceptedRideChatRoutes); // Use accepted ride chat routes
app.use('/', requestedRideChatRoutes); // Use requested ride chat routes

// Server setup
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Mapping of socket IDs to user roles and associated ride IDs
const userSessions = {};

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Handle join event
  socket.on('join', ({ rideId, userId }) => {
    socket.join(rideId);
    userSessions[socket.id] = { userId, rideId };
    console.log(`User ${userId} joined ride: ${rideId} `);
  });

  // Handle sendMessage event
  socket.on('sendMessage', async ({ rideId, rideType, senderId, senderType, message }) => {
    console.log('sendMessage event received:', { rideId, rideType, senderId, senderType, message });
    let ChatModel;
    if (rideType === 'accepted') {
      ChatModel = AcceptedRideChat;
    } else if (rideType === 'requested') {
      ChatModel = RequestedRideChat;
    } else {
      console.error('Invalid ride type');
      return;
    }

    if (!ChatModel) {
      console.error('ChatModel is not defined');
      return;
    }

    try {
      const chat = new ChatModel({ rideId, senderId, senderType, message });
      await chat.save();

      console.log('Message saved to database:', chat);

      io.to(rideId).emit('message', chat); // Emit message to the specific room
      console.log('Message emitted to room:', rideId);
    } catch (error) {
      console.error('Error saving message to database:', error);
    }
  });

  // Handle driver location updates
  socket.on('updateDriverLocation', (location) => {
    console.log('Driver location received from driver:', location);
    io.to(location.rideId).emit('driverLocation', location);
  });

  // Handle disconnect event
  socket.on('disconnect', () => {
    const session = userSessions[socket.id];
    if (session) {
      io.to(session.rideId).emit('driverDisconnected', { driverId: session.userId });
      console.log(`Driver ${session.userId} disconnected from ride: ${session.rideId}`);
      delete userSessions[socket.id]; // Clean up the session
    }
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

