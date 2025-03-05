"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { useRouter } from "next/navigation";

const SystemSettings = () => {
  const [startTime, setStartTime] = useState("08:30");
  const [endTime, setEndTime] = useState("09:00");
  const [departments, setDepartments] = useState(["Quality Control", "Production", "R&D"]);
  const [newDepartment, setNewDepartment] = useState("");
  const router = useRouter();

  const getAuthToken = () => {
    const authData = JSON.parse(localStorage.getItem("auth-store"));
    return authData?.token || null;
  };

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const token = getAuthToken();
        if (!token) {
          router.push("/login");
          return;
        }

        const response = await axios.get("http://localhost:5000/api/employees/settings", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const { attendanceWindow, departments } = response.data;
        setStartTime(attendanceWindow.startTime);
        setEndTime(attendanceWindow.endTime);
        setDepartments(departments);
      } catch (error) {
        console.error("Error fetching settings:", error);
        if (error.response?.status === 401) {
          localStorage.removeItem("auth-store");
          router.push("/login");
        }
      }
    };
    fetchSettings();
  }, [router]);

  const handleAddDepartment = () => {
    if (newDepartment.trim() && !departments.includes(newDepartment.trim())) {
      setDepartments([...departments, newDepartment.trim()]);
      setNewDepartment("");
    }
  };

  const handleDeleteDepartment = (deptToDelete) => {
    setDepartments(departments.filter((dept) => dept !== deptToDelete));
  };

  const handleSave = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        router.push("/login");
        return;
      }

      await axios.post(
        "http://localhost:5000/api/employees/settings",
        {
          attendanceWindow: { startTime, endTime },
          departments,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert("Settings saved successfully!");
      // Optionally, broadcast an event or trigger a global refresh if needed
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("Failed to save settings");
      if (error.response?.status === 401) {
        localStorage.removeItem("auth-store");
        router.push("/login");
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 bg-white rounded-xl shadow-xl max-w-2xl mx-auto"
    >
      <div className="space-y-6 mt-12">
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Attendance Window (EAT)</h3>
          <div className="flex items-center space-x-4">
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-32 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <span className="text-gray-500">to</span>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-32 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Departments</h3>
          <ul className="space-y-2 max-h-40 overflow-y-auto">
            {departments.map((dept) => (
              <li key={dept} className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-lg">
                <span>{dept}</span>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleDeleteDepartment(dept)}
                  className="text-red-500 hover:text-red-700 font-medium"
                >
                  Delete
                </motion.button>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex space-x-2">
            <input
              type="text"
              value={newDepartment}
              onChange={(e) => setNewDepartment(e.target.value)}
              placeholder="Add Department"
              className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleAddDepartment}
              className="px-4 py-2 bg-green-500 text-white rounded-lg"
            >
              Add
            </motion.button>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSave}
          className="w-full px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-all"
        >
          Save Settings
        </motion.button>
      </div>
    </motion.div>
  );
};

export default SystemSettings;