const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Import routes (will create these files next)
const { router: authRouter } = require('./routes/auth');
const teamRoutes = require('./routes/teams');
const playerRoutes = require('./routes/players');
const matchRoutes = require('./routes/matches');

// Initialize Express app
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Database connection (using a mock connection for MVP demo)
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB Atlas');
}).catch(err => {
  console.error('MongoDB connection error:', err);
  // For MVP demo, we'll continue even if DB connection fails
});

// Routes
app.use('/api/auth', authRouter);
app.use('/api/teams', teamRoutes);
app.use('/api/players', playerRoutes);
app.use('/api/matches', matchRoutes);

// Socket.IO for real-time data
io.on('connection', (socket) => {
  console.log('New client connected');
  
  // Join a match room
  socket.on('join-match', (matchId) => {
    socket.join(`match-${matchId}`);
    console.log(`Client joined match-${matchId}`);
  });
  
  // Handle player data updates
  socket.on('player-data', (data) => {
    // Process and broadcast player data to match room
    io.to(`match-${data.matchId}`).emit('player-update', data);
  });
  
  // Handle tactical insights
  socket.on('tactical-insight', (data) => {
    // Process and broadcast tactical insights to match room
    io.to(`match-${data.matchId}`).emit('insight', data);
  });
  
  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = { app, server, io };
