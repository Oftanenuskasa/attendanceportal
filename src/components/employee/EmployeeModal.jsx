"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Shield,
  Camera,
  X,
} from "lucide-react";

const EmployeeModal = ({ employee, onClose }) => {
  if (!employee) return null;

  const BASE_URL = "https://attendanceportal-3.onrender.com"; // Adjust if your backend URL differs

  const formatDate = (dateString) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatAddress = (address) => {
    if (!address || !address.length) return "Not available";
    const addr = address[0];
    return `${addr.zone || "N/A"}, ${addr.city || "N/A"}, ${addr.region || "N/A"}, ${addr.country || "N/A"}`;
  };

  // Close modal when clicking outside
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  // Animation variants
  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={modalVariants}
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50"
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-3xl max-h-[90vh] overflow-y-auto m-4 text-gray-800">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold flex items-center">
            <User className="w-8 h-8 mr-3 text-indigo-600" /> Employee Details
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Profile Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Photo Section */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="col-span-1 flex flex-col items-center"
          >
            {employee.photo ? (
              <img
                src={`${BASE_URL}/${employee.photo.replace(/\\/g, '/')}`}
                alt="Employee Photo"
                className="w-32 h-32 rounded-full object-cover border-4 border-indigo-200 shadow-md"
                onError={(e) => (e.target.src = "/default-photo.jpg")}
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center border-4 border-indigo-200 shadow-md">
                <Camera className="w-12 h-12 text-gray-400" />
              </div>
            )}
            <p className="mt-4 text-lg font-semibold">{employee.username || "N/A"}</p>
            <p className="text-sm text-gray-500">ID: {employee.employeeId || "N/A"}</p>
          </motion.div>

          {/* Details Section */}
          <div className="col-span-2 space-y-4">
            <h3 className="text-xl font-semibold text-indigo-600 mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ProfileField
                icon={<User />}
                label="Full Name"
                value={`${employee.firstName || "N/A"} ${employee.middleName || ""} ${employee.lastName || "N/A"}`}
              />
              <ProfileField icon={<Mail />} label="Email" value={employee.email || "Not set"} />
              <ProfileField icon={<Phone />} label="Phone" value={employee.phoneNumber || "Not set"} />
              <ProfileField icon={<Calendar />} label="Date of Birth" value={formatDate(employee.dob)} />
              <ProfileField icon={<Calendar />} label="Date of Joining" value={formatDate(employee.dateOfJoining)} />
              <ProfileField icon={<User />} label="Gender" value={employee.gender || "Not set"} />
              <ProfileField
                icon={<Shield />}
                label="Status"
                value={employee.status || "Not set"}
                statusColor={employee.status === "ACTIVE" ? "green" : "red"}
              />
            </div>
            <ProfileField icon={<MapPin />} label="Address" value={formatAddress(employee.address)} />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Reusable Profile Field Component
const ProfileField = ({ icon, label, value, statusColor }) => (
  <motion.div
    whileHover={{ x: 5 }}
    className="flex items-start space-x-3 p-3 rounded-lg hover:bg-indigo-50 transition-colors duration-200"
  >
    <div className="text-indigo-600 mt-1">{icon}</div>
    <div>
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className={`text-base font-semibold ${statusColor ? `text-${statusColor}-600` : "text-gray-800"}`}>
        {value}
      </p>
    </div>
  </motion.div>
);

export default EmployeeModal;