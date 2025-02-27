"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";

const SystemSettings = () => {
  const [startTime, setStartTime] = useState("08:30");
  const [endTime, setEndTime] = useState("09:00");
  const [departments, setDepartments] = useState(["Quality Control", "Production", "R&D"]);

  const handleSave = async () => {
    try {
      await axios.post("https://attendanceportal-3.onrender.com/api/employees/settings", {
        attendanceWindow: { startTime, endTime },
        departments,
      });
      alert("Settings saved!");
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("Failed to save settings");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 bg-white rounded-xl shadow-xl"
    >
      <h2 className="text-2xl font-bold mb-6">System Settings</h2>
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold">Attendance Window (EAT)</h3>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="p-2 border rounded mr-4"
          />
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="p-2 border rounded"
          />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Departments</h3>
          <ul>
            {departments.map((dept) => (
              <li key={dept} className="flex justify-between py-2">
                {dept}
                <button className="text-red-500">Delete</button>
              </li>
            ))}
          </ul>
          <input type="text" placeholder="Add Department" className="p-2 border rounded" />
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          onClick={handleSave}
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg"
        >
          Save Settings
        </motion.button>
      </div>
    </motion.div>
  );
};

export default SystemSettings;