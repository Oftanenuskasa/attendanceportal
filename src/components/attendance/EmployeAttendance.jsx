"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { UserCheck } from "lucide-react"; // Import UserCheck icon

export default function Attendance() {
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");
  const [status, setStatus] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add your submission logic here (e.g., saving to state or API call)
    console.log({ name, department, status });
    // Reset form fields
    setName("");
    setDepartment("");
    setStatus("");
  };

  return (
    <div>
      {/* Attendance Form */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl shadow-xl p-8 mb-8"
      >
        <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center mt-12">
          <UserCheck className="mr-3 text-indigo-600" /> Mark Your Attendance
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Employee Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Department</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                required
              >
                <option value="">Select Department</option>
                <option value="Quality Control">Quality Control</option>
                <option value="Production">Production</option>
                <option value="R&D">R&D</option>
                <option value="HR">HR</option>
                <option value="IT">IT</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                required
              >
                <option value="">Select Status</option>
                <option value="Present">Present</option>
                <option value="Late">Late</option>
                <option value="Work From Home">Work From Home</option>
                <option value="On Leave">On Leave</option>
              </select>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-indigo-600 to-blue-500 text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition-all duration-200"
          >
            Submit Attendance
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}