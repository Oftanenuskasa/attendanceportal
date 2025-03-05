require('dotenv').config(); // Load environment variables first
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const nodemailer = require('nodemailer');
const employeeRoutes = require('./routes/employeeRoutes'); // Adjust path

const app = express();

// Log environment variables for debugging
console.log("MONGO_URI:", process.env.MONGO_URI);
console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log("EMAIL_PASS:", process.env.EMAIL_PASS ? "[REDACTED]" : "undefined");
console.log("JWT_SECRET:", process.env.JWT_SECRET);
console.log("APP_URL:", process.env.APP_URL);

// CORS Configuration
const corsOptions = {
  origin: 'https://quality-attendance.vercel.app', // Your frontend origin
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true, // Allow credentials for auth
  optionsSuccessStatus: 200, // For legacy browsers
};

// Apply CORS middleware globally
app.use(cors(corsOptions));

// Handle preflight OPTIONS requests
app.options('*', cors(corsOptions), (req, res) => {
  console.log('Preflight OPTIONS request received');
  res.status(200).end();
});

// Middleware
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Log all incoming requests for debugging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - Origin: ${req.headers.origin}`);
  next();
});

// Nodemailer Transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Verify transporter
transporter.verify((error, success) => {
  if (error) {
    console.error("Transporter verification failed:", error);
  } else {
    console.log("Transporter is ready to send emails");
  }
});

// MongoDB Connection with enhanced options
mongoose.connect(process.env.MONGO_URI).then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes - Pass transporter to employeeRoutes
app.use('/api/employees', employeeRoutes(transporter));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  res.status(500).json({ message: 'Server error', error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});