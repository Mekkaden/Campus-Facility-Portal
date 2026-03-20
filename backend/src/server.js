const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const RETRY_INTERVAL_MS = 5000;

// Security and Logging Middleware
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(express.json());
app.use(morgan('dev'));

function connectDatabase() {
    const mongoURI = process.env.MONGO_URI;
    
    if (!mongoURI) {
        console.error('WARN: MONGO_URI is not defined. Server will run without database.');
        return;
    }

    mongoose.connect(mongoURI)
        .then(function() {
            console.log('Successfully connected to MongoDB.');
        })
        .catch(function(error) {
            console.error('MongoDB connection error:', error.message);
            console.log('Retrying connection in ' + (RETRY_INTERVAL_MS / 1000) + ' seconds...');
            setTimeout(connectDatabase, RETRY_INTERVAL_MS);
        });
}

// Listen for disconnection events and attempt reconnect
mongoose.connection.on('disconnected', function() {
    console.warn('MongoDB disconnected. Attempting reconnect...');
});

// Routes
const authRoutes = require('./routes/authRoutes');
const complaintRoutes = require('./routes/complaintRoutes');

// Health Check Route — reports database connection status
app.get('/api/health', function(req, res) {
    var dbState = mongoose.connection.readyState;
    // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
    var dbStatus = dbState === 1 ? 'connected' : 'disconnected';
    
    return res.status(200).json({ 
        status: 'secure_and_running', 
        database: dbStatus,
        message: 'Campus Facility Analytics Portal API is online.' 
    });
});

app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);

function startServer() {
    connectDatabase();
    
    app.listen(PORT, function() {
        console.log('Secure server is actively listening on port ' + PORT);
    });
}

// Initialize the application
startServer();
