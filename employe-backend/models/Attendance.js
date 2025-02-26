const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  employeeId: { type: String, required: true },
  name: { type: String, required: true },
  department: { type: String, required: true },
  status: { type: String, enum: ['Present', 'Late', 'Work From Home', 'On Leave'], required: true },
  date: { type: Date, default: Date.now, required: true },
}, { timestamps: true });

// Ensure only one attendance record per employee per day
attendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);