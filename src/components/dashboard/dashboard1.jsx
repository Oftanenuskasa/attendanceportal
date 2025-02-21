"use client"
import React, { useState } from 'react';
import { Calendar, Clock, UserCheck, BarChart3, Users, CheckCircle, Building2, BriefcaseIcon } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AttendanceSystem() {
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('');
  const [status, setStatus] = useState('');
  const [attendance, setAttendance] = useState([]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const date = new Date();
    const newAttendance = {
      name,
      department,
      status,
      time: date.toLocaleTimeString(),
      date: date.toLocaleDateString()
    };
    setAttendance([...attendance, newAttendance]);
    setName('');
    setDepartment('');
    setStatus('');
  };

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

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-purple-500 to-indigo-600 p-6 rounded-xl shadow-xl text-white"
          >
            <div className="flex items-center">
              <Users className="text-white mr-3" />
              <h3 className="text-lg font-semibold">Total Employee</h3>
            </div>
            <p className="text-4xl font-bold mt-3">{attendance.length}</p>
          </motion.div>
          
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-green-500 to-emerald-600 p-6 rounded-xl shadow-xl text-white"
          >
            <div className="flex items-center">
              <CheckCircle className="text-white mr-3" />
              <h3 className="text-lg font-semibold">Present Today</h3>
            </div>
            <p className="text-4xl font-bold mt-3">
              {attendance.filter(a => 
                a.date === new Date().toLocaleDateString() && 
                a.status === 'Present'
              ).length}
            </p>
          </motion.div>

          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-blue-500 to-cyan-600 p-6 rounded-xl shadow-xl text-white"
          >
            <div className="flex items-center">
              <Building2 className="text-white mr-3" />
              <h3 className="text-lg font-semibold">Working Remote</h3>
            </div>
            <p className="text-4xl font-bold mt-3">
              {attendance.filter(a => 
                a.date === new Date().toLocaleDateString() && 
                a.status === 'Work From Home'
              ).length}
            </p>
          </motion.div>
        </div>

        {/* Recent Attendance */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-xl p-8"
        >
        </motion.div>
      </main>
    </div>
  );
}