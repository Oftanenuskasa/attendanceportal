"use client";

import React, { useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import AddressPopup from "./AddressPopup";

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
    address: [],
    photo: null,
  });

  const [addressClicked, setAddressClicked] = useState(false);
  const [addresses, setAddresses] = useState("");

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
  
    if (name.startsWith('teacher.')) {
      const teacherField = name.split('.')[1]; 
      setFormData((prevState) => ({
        ...prevState,
        teacher: {
          ...prevState.teacher,
          [teacherField]: value, 
        },
      }));
    } else if (type === "file") {
      setFormData((prevState) => ({
        ...prevState,
        [name]: files[0],
      }));
    } else {
      setFormData((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("Submitting Form with Data:", formData);

    const formDataToSend = new FormData();
    Object.keys(formData).forEach(key => {
      if (key !== 'address' && key !== 'teacher' && key !== 'photo') {
        formDataToSend.append(key, formData[key]);
      }
    });
    formDataToSend.append('addressJson', JSON.stringify(formData.address[0] || {}));

    if (formData.photo) {
      formDataToSend.append('photo', formData.photo);
    }
    try {
      const response = await axios.post(
        "",
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log("Employee successfully registered :", response);
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
        role: "",
        address: [],
        photo: null,
      });
    } catch (error) {
      console.error("Error during submission:", error);
      toast.error(error.response?.data?.message || "An error occurred while creating the employee.");
    }
  };

  const handleSaveAddress = (address) => {
    // Add the address to the schoolAddress array
    setFormData((prevState) => ({
      ...prevState,
      address: [{ ...address }], // Address saved as an array
    }));
    // Assuming address is an object with properties like street, city, state, zip, etc.
    const formattedAddress = ` ${address.city}, ${address.zone}, ${address.region}, ${address.country}`;

    console.log("address is taken this data", address);
    setAddressClicked(false); // Close the popup
    setAddresses(formattedAddress);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 top-20 relative">
      <form onSubmit={handleSubmit} className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-6 text-black">
              Personal Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name*
                </label>
                <input
                  type="text"
                  name="firstName"
                  placeholder="Enter your first name"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Middle Name
                </label>
                <input
                  type="text"
                  name="middleName"
                  placeholder="Enter your middle name"
                  value={formData.middleName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name*
                </label>
                <input
                  type="text"
                  name="lastName"
                  placeholder="Enter your last name"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username*
                </label>
                <input
                  type="text"
                  name="username"
                  placeholder="Enter your username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  minLength={5}
                  maxLength={30}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password*
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email*
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  placeholder="Enter your phone number"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-black"
                />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-6 text-black">
              Employment Details
            </h2>
            <div className="space-y-4">
        
              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Date of Joining
                </label>
                <input
                  type="date"
                  name="dateOfJoining"
                  value={formData.dateOfJoining}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Date of Birth
                </label>
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gender
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-black"
                >
                  <option value="">Select Gender</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Employment Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full text-black px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="ON_LEAVE">On Leave</option>
                  <option value="TERMINATED">Terminated</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Photo
                </label>
                <input
                  type="file"
                  name="photo"
                  placeholder="Upload your photo"
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-black"
                />
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow md:col-span-2">
            <h2 className="text-lg font-semibold mb-6 text-black">
              Address Information
            </h2>
            <div>
                {addressClicked ? (
                  <div>
                    <AddressPopup
                      show={addressClicked}
                      onClose={() => setAddressClicked(false)}
                      onSave={handleSaveAddress}
                    />
                  </div>
                ) : (
                  <div>
                    <input
                      type="text"
                      name="address"
                      value={addresses}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="click to add address"
                      onClick={() => setAddressClicked(true)} // Show the popup when clicked
                    />
                  </div>
                )}
              </div>
          </div>
        </div>

        <div className="mt-8">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateEmployee;
