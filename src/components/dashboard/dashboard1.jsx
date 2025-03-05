"use client";

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, UserCheck, BarChart3, Users, CheckCircle, Building2, BriefcaseIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function AttendanceSystem() {
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [presentToday, setPresentToday] = useState(0);
  const [workingRemote, setWorkingRemote] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  // Get token from localStorage
  const getAuthToken = () => {
    const authData = JSON.parse(localStorage.getItem("auth-store"));
    return authData?.token || null;
  };

  // Fetch data from backend
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      if (!token) {
        router.push('/login');
        return;
      }

      // Fetch all employees
      const employeesResponse = await axios.get("https://attendanceportal-3.onrender.com/api/employees", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTotalEmployees(employeesResponse.data.length);

      // Fetch all attendance records
      const attendanceResponse = await axios.get("https://attendanceportal-3.onrender.com/api/employees/attendance", {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Filter for today's attendance
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);

      const todayAttendance = attendanceResponse.data.filter(record => {
        const recordDate = new Date(record.date);
        return recordDate >= today && recordDate < tomorrow;
      });

      // Calculate Present Today and Working Remote
      const presentCount = todayAttendance.filter(record => record.status === 'Present').length;
      const remoteCount = todayAttendance.filter(record => record.status === 'Work From Home').length;

      setPresentToday(presentCount);
      setWorkingRemote(remoteCount);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to fetch dashboard data');
      if (err.response?.status === 401) {
        localStorage.removeItem("auth-store");
        router.push('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-indigo-50 mt-12">
      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-indigo-600 to-blue-500 text-white shadow-lg"
      >
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold">Attendance Portal</h1>
              <p className="mt-2 text-indigo-100">Smart Attendance Management System</p>
            </div>
            <BriefcaseIcon className="h-12 w-12 text-indigo-100" />
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading dashboard data...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-600">{error}</div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="bg-gradient-to-br from-purple-500 to-indigo-600 p-6 rounded-xl shadow-xl text-white"
              >
                <div className="flex items-center">
                  <Users className="text-white mr-3" />
                  <h3 className="text-lg font-semibold">Total Employees</h3>
                </div>
                <p className="text-4xl font-bold mt-3">{totalEmployees}</p>
              </motion.div>
              
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="bg-gradient-to-br from-green-500 to-emerald-600 p-6 rounded-xl shadow-xl text-white"
              >
                <div className="flex items-center">
                  <CheckCircle className="text-white mr-3" />
                  <h3 className="text-lg font-semibold">Present Today</h3>
                </div>
                <p className="text-4xl font-bold mt-3">{presentToday}</p>
              </motion.div>

              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="bg-gradient-to-br from-blue-500 to-cyan-600 p-6 rounded-xl shadow-xl text-white"
              >
                <div className="flex items-center">
                  <Building2 className="text-white mr-3" />
                  <h3 className="text-lg font-semibold">Working Remote</h3>
                </div>
                <p className="text-4xl font-bold mt-3">{workingRemote}</p>
              </motion.div>
            </div>

            {/* Placeholder for Recent Attendance (optional) */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-xl p-8"
            >
              <h2 className="text-2xl font-semibold mb-4">Recent Attendance</h2>
              <p className="text-gray-500">Add your recent attendance display here if needed.</p>
            </motion.div>
          </>
        )}
      </main>
    </div>
  );
}