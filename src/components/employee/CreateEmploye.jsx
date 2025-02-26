"use client";

import React, { useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import AddressPopup from "./AddressPopup";
import { motion } from "framer-motion";

const CreateEmployee = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    username: "",
    dateOfJoining: "",
    email: "",
    password: "",
    phoneNumber: "",
    status: "ACTIVE",
    dob: "",
    gender: "",
    address: [], // Array to hold address object
    photo: null,
  });

  const [addressClicked, setAddressClicked] = useState(false);
  const [addressDisplay, setAddressDisplay] = useState(""); // For display only

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === "file") {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSaveAddress = (address) => {
    setFormData((prev) => ({
      ...prev,
      address: [address], // Ensure it’s an array with one object
    }));
    const formattedAddress = `${address.city || "N/A"}, ${address.zone || "N/A"}, ${address.region || "N/A"}, ${address.country || "N/A"}`;
    setAddressDisplay(formattedAddress);
    setAddressClicked(false);
    console.log("Address saved:", address);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("Submitting Form with Data:", formData);

    const formDataToSend = new FormData();
    Object.keys(formData).forEach((key) => {
      if (key === "address") {
        const addressObj = formData.address.length > 0 ? formData.address[0] : {};
        formDataToSend.append("addressJson", JSON.stringify(addressObj));
      } else if (key === "photo" && formData.photo) {
        formDataToSend.append("photo", formData.photo);
      } else {
        formDataToSend.append(key, formData[key]);
      }
    });

    console.log("FormData to send:", Array.from(formDataToSend.entries()));

    try {
      const response = await axios.post(
        "http://localhost:5000/api/employees/create",
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log("Employee successfully registered:", response.data);
      toast.success("Employee created successfully!");
      setFormData({
        firstName: "",
        middleName: "",
        lastName: "",
        username: "",
        dateOfJoining: "",
        email: "",
        password: "",
        phoneNumber: "",
        status: "ACTIVE",
        dob: "",
        gender: "",
        address: [],
        photo: null,
      });
      setAddressDisplay("");
    } catch (error) {
      console.error("Error during submission:", error);
      toast.error(
        error.response?.data?.message ||
          "An error occurred while creating the employee."
      );
    }
  };

  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-indigo-50 p-6 pt-20">
      <form onSubmit={handleSubmit} className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Personal Information */}
          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className="bg-white p-6 rounded-xl shadow-lg"
          >
            <h2 className="text-xl font-semibold mb-6 text-gray-800">
              Personal Information
            </h2>
            <div className="space-y-6">
              <InputField
                label="First Name*"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
              <InputField
                label="Middle Name"
                name="middleName"
                value={formData.middleName}
                onChange={handleChange}
              />
              <InputField
                label="Last Name*"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
              <InputField
                label="Username*"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                minLength={5}
                maxLength={30}
              />
              <InputField
                label="Password*"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <InputField
                label="Email*"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
              <InputField
                label="Phone Number"
                name="phoneNumber"
                type="tel"
                value={formData.phoneNumber}
                onChange={handleChange}
              />
            </div>
          </motion.div>

          {/* Employment Details */}
          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className="bg-white p-6 rounded-xl shadow-lg"
          >
            <h2 className="text-xl font-semibold mb-6 text-gray-800">
              Employment Details
            </h2>
            <div className="space-y-6">
              <InputField
                label="Date of Joining"
                name="dateOfJoining"
                type="date"
                value={formData.dateOfJoining}
                onChange={handleChange}
              />
              <InputField
                label="Date of Birth"
                name="dob"
                type="date"
                value={formData.dob}
                onChange={handleChange}
              />
              <SelectField
                label="Gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                options={[
                  { value: "", label: "Select Gender" },
                  { value: "MALE", label: "Male" },
                  { value: "FEMALE", label: "Female" },
                ]}
              />
              <SelectField
                label="Employment Status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                options={[
                  { value: "ACTIVE", label: "Active" },
                  { value: "INACTIVE", label: "Inactive" },
                  { value: "ON_LEAVE", label: "On Leave" },
                  { value: "TERMINATED", label: "Terminated" },
                ]}
              />
              <InputField
                label="Photo"
                name="photo"
                type="file"
                onChange={handleChange}
                accept="image/*"
              />
            </div>
          </motion.div>

          {/* Address Information */}
          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className="bg-white p-6 rounded-xl shadow-lg md:col-span-2"
          >
            <h2 className="text-xl font-semibold mb-6 text-gray-800">
              Address Information
            </h2>
            <div>
              {addressClicked ? (
                <AddressPopup
                  show={addressClicked}
                  onClose={() => setAddressClicked(false)}
                  onSave={handleSaveAddress}
                />
              ) : (
                <input
                  type="text"
                  value={addressDisplay}
                  onClick={() => setAddressClicked(true)}
                  readOnly
                  placeholder="Click to add address"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-800 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              )}
            </div>
          </motion.div>
        </div>

        <div className="mt-8 flex justify-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-lg shadow-md transition-colors duration-200"
          >
            Submit
          </motion.button>
        </div>
      </form>
    </div>
  );
};

// Reusable Input Field Component
const InputField = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  required,
  minLength,
  maxLength,
  accept,
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <input
      type={type}
      name={name}
      value={type !== "file" ? value : undefined}
      onChange={onChange}
      required={required}
      minLength={minLength}
      maxLength={maxLength}
      accept={accept}
      className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
    />
  </div>
);

// Reusable Select Field Component
const SelectField = ({ label, name, value, onChange, options }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
);

export default CreateEmployee;