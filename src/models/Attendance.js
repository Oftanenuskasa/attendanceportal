import mongoose from "mongoose";

const AttendanceSchema = new mongoose.Schema({
  name: String,
  status: String,
  date: { type: Date, default: Date.now },
});

export default mongoose.models.Attendance || mongoose.model("Attendance", AttendanceSchema);
