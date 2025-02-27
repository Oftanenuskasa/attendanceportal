const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const employeeRoutes = require('./routes/employeeRoutes');

dotenv.config();

const app = express();

// Middleware
const allowedOrigins = ['https://quality-attendance.vercel.app']; // Add your Vercel frontend domain
const corsOptions = {
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'], // Allow specific HTTP methods if needed
  allowedHeaders: ['Content-Type', 'Authorization'], // Allow headers that your frontend sends
};

app.use(cors(corsOptions));  // Use the configured CORS options
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/employees', employeeRoutes);

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI) 
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
