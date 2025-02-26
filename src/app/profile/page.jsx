"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Shield,
  Camera,
  Save,
  X,
} from "lucide-react";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const router = useRouter();
  const BASE_URL = "http://localhost:5000"; // Backend base URL

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      const authData = JSON.parse(localStorage.getItem("auth-store"));
      if (!authData || !authData.token) {
        router.push("/login");
        return;
      }

      try {
        const response = await axios.get(`${BASE_URL}/api/employees/profile`, {
          headers: {
            Authorization: `Bearer ${authData.token}`,
          },
        });

        console.log("Profile API response:", response.data);
        setUser(response.data);
        setFormData(response.data); // Initialize form data with fetched profile
      } catch (error) {
        console.error(error);
        if (error.response?.status === 401) {
          localStorage.removeItem("auth-store");
          router.push("/login");
        }
      }
    };

    fetchProfile();
  }, [router]);

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
    return `${addr.zone || "N/A"}, ${addr.city || "N/A"}, ${
      addr.region || "N/A"
    }, ${addr.country || "N/A"}`;
  };

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === "file") {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!user || !user.employeeId) {
      toast.error("No employee data available to edit");
      return;
    }
  
    const formDataToSend = new FormData();
    Object.keys(formData).forEach((key) => {
      if (key === "photo" && formData.photo instanceof File) {
        formDataToSend.append(key, formData.photo);
      } else if (key === "address") {
        formDataToSend.append("addressJson", JSON.stringify(formData.address));
      } else if (
        key !== "roles" &&
        key !== "_id" &&
        key !== "__v" &&
        key !== "createdAt" &&
        key !== "updatedAt" &&
        key !== "employeeId"
      ) {
        formDataToSend.append(key, formData[key]);
      }
    });
    formDataToSend.append("employeeId", user.employeeId);
  
    try {
      console.log("FormData being sent:", Array.from(formDataToSend.entries()));
      const response = await axios.patch(
        `${BASE_URL}/api/employees/profile/edit-no-auth`,
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
  
      console.log("Profile updated:", response.data);
      setUser(response.data);
      setIsEditing(false);
  
      // Update localStorage with the new user data
      const authData = JSON.parse(localStorage.getItem("auth-store") || "{}");
      const updatedAuthData = {
        ...authData,
        user: {
          ...authData.user,
          ...response.data, // Merge updated fields
        },
      };
      localStorage.setItem("auth-store", JSON.stringify(updatedAuthData));
      console.log("Updated auth-store:", updatedAuthData);
  
      toast.success("Profile updated successfully!");
  
      // Trigger storage event to notify other components (like Header)
      window.dispatchEvent(new Event("storage"));
    } catch (error) {
      console.error("Error updating profile:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to update profile";
      toast.error(errorMessage);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-12 h-12 border-4 border-t-indigo-500 border-gray-200 rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-indigo-50 p-6 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-2xl shadow-xl p-8 max-w-3xl w-full"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center">
            <User className="w-8 h-8 mr-3 text-indigo-600" /> Your Profile
          </h1>
          <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-sm font-semibold rounded-full">
            {user.roles.join(", ")}
          </span>
        </div>

        {/* Profile Card or Edit Form */}
        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <InputField
                label="First Name"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
              />
              <InputField
                label="Middle Name"
                name="middleName"
                value={formData.middleName}
                onChange={handleChange}
              />
              <InputField
                label="Last Name"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
              />
              <InputField
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
              />
              <InputField
                label="Phone Number"
                name="phoneNumber"
                type="tel"
                value={formData.phoneNumber}
                onChange={handleChange}
              />
              <InputField
                label="Date of Birth"
                name="dob"
                type="date"
                value={formData.dob ? formData.dob.split("T")[0] : ""}
                onChange={handleChange}
              />
              <InputField
                label="Date of Joining"
                name="dateOfJoining"
                type="date"
                value={
                  formData.dateOfJoining
                    ? formData.dateOfJoining.split("T")[0]
                    : ""
                }
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
              <InputField
                label="Photo"
                name="photo"
                type="file"
                onChange={handleChange}
                accept="image/*"
              />
            </div>
            <div className="flex justify-end space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-6 py-2 bg-gray-500 text-white rounded-lg shadow-md hover:bg-gray-600 transition-colors"
              >
                <X className="inline mr-2" /> Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition-colors"
              >
                <Save className="inline mr-2" /> Save
              </motion.button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Photo Section */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="col-span-1 flex flex-col items-center"
            >
              {user.photo ? (
                <img
                  src={`${BASE_URL}/${user.photo.replace(/\\/g, "/")}`}
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover border-4 border-indigo-200 shadow-md"
                  onError={(e) => (e.target.src = "/default-photo.jpg")}
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center border-4 border-indigo-200 shadow-md">
                  <Camera className="w-12 h-12 text-gray-400" />
                </div>
              )}
              <p className="mt-4 text-lg font-semibold text-gray-800">
                {user.username}
              </p>
              <p className="text-sm text-gray-500">
                Employee ID: {user.employeeId}
              </p>
            </motion.div>

            {/* Details Section */}
            <div className="col-span-2 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ProfileField
                  icon={<User />}
                  label="Full Name"
                  value={`${user.firstName} ${user.middleName || ""} ${
                    user.lastName
                  }`}
                />
                <ProfileField
                  icon={<Mail />}
                  label="Email"
                  value={user.email}
                />
                <ProfileField
                  icon={<Phone />}
                  label="Phone"
                  value={user.phoneNumber || "Not set"}
                />
                <ProfileField
                  icon={<Calendar />}
                  label="Date of Birth"
                  value={formatDate(user.dob)}
                />
                <ProfileField
                  icon={<Calendar />}
                  label="Date of Joining"
                  value={formatDate(user.dateOfJoining)}
                />
                <ProfileField
                  icon={<User />}
                  label="Gender"
                  value={user.gender || "Not set"}
                />
                <ProfileField
                  icon={<Shield />}
                  label="Status"
                  value={user.status}
                  statusColor={user.status === "ACTIVE" ? "green" : "red"}
                />
              </div>
              <ProfileField
                icon={<MapPin />}
                label="Address"
                value={formatAddress(user.address)}
              />
            </div>
          </div>
        )}

        {/* Edit Button (shown only in view mode) */}
        {!isEditing && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="mt-6 px-6 py-2 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition-colors"
            onClick={() => setIsEditing(true)}
          >
            Edit Profile
          </motion.button>
        )}
      </motion.div>
    </div>
  );
};

// Reusable Profile Field Component
const ProfileField = ({ icon, label, value, statusColor }) => (
  <motion.div
    whileHover={{ x: 5 }}
    className="flex items-start space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
  >
    <div className="text-indigo-600 mt-1">{icon}</div>
    <div>
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p
        className={`text-base font-semibold ${
          statusColor ? `text-${statusColor}-600` : "text-gray-800"
        }`}
      >
        {value}
      </p>
    </div>
  </motion.div>
);

// Reusable Input Field Component
const InputField = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  required,
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

export default Profile;