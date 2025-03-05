"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { UserCheck } from "lucide-react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function Attendance() {
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [attendanceWindow, setAttendanceWindow] = useState({ startTime: "08:30", endTime: "09:00" });
  const router = useRouter();

  const getAuthToken = () => {
    const authData = JSON.parse(localStorage.getItem("auth-store"));
    return authData?.token || null;
  };

  // Fetch settings function
  const fetchSettings = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        router.push("/login");
        return;
      }

      const response = await axios.get("https://attendanceportal-3.onrender.com/api/employees/settings", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const { attendanceWindow, departments } = response.data;
      setAttendanceWindow(attendanceWindow || { startTime: "08:30", endTime: "09:00" });
      setDepartments(departments || []);
    } catch (error) {
      console.error("Error fetching settings:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem("auth-store");
        router.push("/login");
      }
    }
  };

  // Fetch user data and settings on mount
  useEffect(() => {
    const authData = JSON.parse(localStorage.getItem("auth-store"));
    if (!authData || !authData.user) {
      router.push("/login");
      return;
    }
    setName(authData.user.name);
    fetchSettings();

    // Add event listener for window focus to refresh settings
    window.addEventListener("focus", fetchSettings);
    return () => window.removeEventListener("focus", fetchSettings);
  }, [router]);

  const isWithinAttendanceWindow = () => {
    const now = new Date();
    const ethiopianTime = new Date(now.toLocaleString("en-US", { timeZone: "Africa/Addis_Ababa" }));
    const [startHours, startMinutes] = attendanceWindow.startTime.split(":").map(Number);
    const [endHours, endMinutes] = attendanceWindow.endTime.split(":").map(Number);

    const currentMinutes = ethiopianTime.getHours() * 60 + ethiopianTime.getMinutes();
    const startWindow = startHours * 60 + startMinutes;
    const endWindow = endHours * 60 + endMinutes;

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

    const determinedStatus = isWithinAttendanceWindow() ? "Present" : "Absent";

    try {
      const response = await axios.post(
        "http://localhost:5000/api/employees/attendance", // Updated to local endpoint
        { name, department, status: determinedStatus },
        {
          headers: { Authorization: `Bearer ${authData.token}` },
        }
      );

      console.log("Attendance marked:", response.data);
      alert(`Attendance marked as ${determinedStatus} successfully!`);
      setDepartment("");
      setStatus("");
      fetchSettings(); // Refresh settings after submission to ensure latest window
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
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl shadow-xl p-8 mb-8 max-w-3xl mx-auto"
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
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
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
                  ? `Within ${attendanceWindow.startTime} - ${attendanceWindow.endTime} (EAT)`
                  : `Outside ${attendanceWindow.startTime} - ${attendanceWindow.endTime} (EAT)`}
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