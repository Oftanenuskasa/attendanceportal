"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { UserCheck } from "lucide-react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function Attendance() {
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");
  const [status, setStatus] = useState(""); // Will be overridden by time check
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Load user data on mount
  useEffect(() => {
    const authData = JSON.parse(localStorage.getItem("auth-store"));
    if (!authData || !authData.user) {
      router.push("/login");
    } else {
      setName(authData.user.name);
    }
  }, [router]);

  // Function to check if current time is within 8:30 AM - 9:00 AM EAT (Ethiopian local time)
  const isWithinAttendanceWindow = () => {
    // Use Ethiopian local time (UTC+3)
    const now = new Date();
    const ethiopianTime = new Date(now.toLocaleString("en-US", { timeZone: "Africa/Addis_Ababa" }));
    const hours = ethiopianTime.getHours();
    const minutes = ethiopianTime.getMinutes();

    // Convert current time to minutes since midnight
    const currentMinutes = hours * 60 + minutes;

    // Attendance window: 8:30 AM - 9:00 AM EAT
    const startWindow = 8 * 60 + 30; // 8:30 AM = 510 minutes
    const endWindow = 9 * 60; // 9:00 AM = 540 minutes

    return currentMinutes >= startWindow && currentMinutes <= endWindow;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const authData = JSON.parse(localStorage.getItem("auth-store"));
    if (!authData || !authData.token) {
      router.push("/login");
      return;
    }

    // Determine status based on time
    const determinedStatus = isWithinAttendanceWindow() ? "Present" : "Absent";

    try {
      const response = await axios.post(
        "http://localhost:5000/api/employees/attendance",
        { name, department, status: determinedStatus },
        {
          headers: {
            Authorization: `Bearer ${authData.token}`,
          },
        }
      );

      console.log("Attendance marked:", response.data);
      alert(`Attendance marked as ${determinedStatus} successfully!`);
      setDepartment("");
      setStatus(""); // Reset status (though it’s overridden)
    } catch (error) {
      console.error(error);
      const message = error.response?.data?.message || "An error occurred";
      alert(message);
      if (error.response?.status === 401) {
        localStorage.removeItem("auth-store");
        router.push("/login");
      }
    } finally {
      setLoading(false);
    }
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
                disabled
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
                <option value="Quality Control">Quality Control and Assurance</option>
                <option value="Production">Methodology and Standard</option>
                <option value="R&D">NID Project</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Status</label>
              <input
                type="text"
                value={isWithinAttendanceWindow() ? "Present" : "Absent"}
                className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-700"
                disabled
              />
              <p className="text-sm text-gray-500">
                {isWithinAttendanceWindow()
                  ? "Within 8:30 AM - 9:00 AM window (EAT)"
                  : "Outside attendance window (EAT)"}
              </p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className={`w-full md:w-auto px-8 py-3 bg-gradient-to-r from-indigo-600 to-blue-500 text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition-all duration-200 ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Submitting..." : "Submit Attendance"}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}