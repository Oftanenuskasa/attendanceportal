const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema({
  attendanceWindow: {
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
  },
  departments: [{ type: String, required: true }],
});

module.exports = mongoose.model("Settings", settingsSchema);