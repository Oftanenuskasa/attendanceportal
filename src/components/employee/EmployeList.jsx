"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { toast } from "react-toastify";
import { FiArrowUp, FiArrowDown } from "react-icons/fi";
import {
  FiEdit,
  FiTrash2,
  FiEye,
  FiDownload,
  FiCopy,
  FiPrinter,
  FiFile,
  FiFileText,
} from "react-icons/fi";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import axios from "axios";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import EmployeeModal from "./EmployeeModal";
import ConfirmDialog from "./ConfirmDialog";

export default function EmployeList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [employee, setEmployee] = useState([]);
  const [filteredEmployee, setFilteredEmployee] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "ascending",
  });
  const [filterStatus, setFilterStatus] = useState("all");
  const [showEditModal, setShowEditModal] = useState(false); // New state for edit modal
  const [editEmployee, setEditEmployee] = useState(null); // Employee being edited
  const router = useRouter();

  // Get token from localStorage
  const getAuthToken = () => {
    const authData = JSON.parse(localStorage.getItem("auth-store"));
    return authData?.token || null;
  };

  // Fetch employee data
  const fetchEmployeeData = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      if (!token) {
        router.push("/login");
        return;
      }

      const response = await axios.get("http://localhost:5000/api/employees", {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("Fetched Employee Data:", response.data);

      const formattedData = response.data.map((item) => ({
        employeeId: item.employeeId,
        firstName: item.firstName,
        middleName: item.middleName || "",
        lastName: item.lastName,
        email: item.email,
        status: item.status,
      }));

      setEmployee(formattedData);
      setFilteredEmployee(formattedData);
    } catch (error) {
      toast.error("Failed to fetch employee data");
      console.error("Error fetching employee:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem("auth-store");
        router.push("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployeeData();
  }, [router]);

  // Handle employee deletion
  const handleDelete = async (id) => {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error("No authentication token found. Please log in.");
      }

      const selectedEmployee = employee.find((emp) => emp.employeeId === id);
      if (!selectedEmployee || !selectedEmployee.employeeId) {
        throw new Error("Employee ID not found");
      }

      await axios.patch(
        `http://localhost:5000/api/employees/${selectedEmployee.employeeId}/deactivate`,
        { status: "INACTIVE" },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success("Employee deactivated successfully");
      fetchEmployeeData();
    } catch (error) {
      console.error("Error deactivating employee:", error);
      toast.error(
        error.response?.data?.message || "Failed to deactivate employee"
      );
      if (error.response?.status === 401) {
        localStorage.removeItem("auth-store");
        router.push("/login");
      }
    }
  };

  // Fetch complete employee details for viewing
  const fetchCompleteDetails = async (id) => {
    try {
      const token = getAuthToken();
      const response = await axios.get(
        `http://localhost:5000/api/employees/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSelectedEmployee(response.data);
      setShowModal(true);
    } catch (error) {
      toast.error("Failed to fetch employee details");
      console.error("Error fetching employee details:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem("auth-store");
        router.push("/login");
      }
    }
  };

  // Handle edit button click
  const handleEditClick = async (id) => {
    try {
      const token = getAuthToken();
      const response = await axios.get(
        `http://localhost:5000/api/employees/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setEditEmployee(response.data);
      setShowEditModal(true);
    } catch (error) {
      toast.error("Failed to fetch employee details for editing");
      console.error("Error fetching employee for edit:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem("auth-store");
        router.push("/login");
      }
    }
  };

  // Handle edit form submission
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error("No authentication token found. Please log in.");
      }

      const formData = new FormData();
      formData.append("firstName", editEmployee.firstName);
      formData.append("middleName", editEmployee.middleName || "");
      formData.append("lastName", editEmployee.lastName);
      formData.append("email", editEmployee.email);
      formData.append("phoneNumber", editEmployee.phoneNumber || "");
      formData.append("dob", editEmployee.dob || "");
      formData.append("dateOfJoining", editEmployee.dateOfJoining || "");
      formData.append("gender", editEmployee.gender || "");
      formData.append(
        "addressJson",
        editEmployee.address
          ? JSON.stringify(editEmployee.address[0] || {})
          : ""
      );
      formData.append("employeeId", editEmployee.employeeId);
      if (editEmployee.photoFile) {
        formData.append("photo", editEmployee.photoFile);
      }

      await axios.patch(
        "http://localhost:5000/api/employees/profile/edit-no-auth",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      toast.success("Employee updated successfully");
      setShowEditModal(false);
      setEditEmployee(null);
      fetchEmployeeData();
    } catch (error) {
      console.error("Error updating employee:", error);
      toast.error(error.response?.data?.message || "Failed to update employee");
      if (error.response?.status === 401) {
        localStorage.removeItem("auth-store");
        router.push("/login");
      }
    }
  };

  // Export functions (unchanged)
  const exportToExcel = () => {
    if (filteredEmployee.length === 0) {
      toast.warn("No data available to export to Excel.");
      return;
    }
    const ws = XLSX.utils.json_to_sheet(filteredEmployee);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Employee Data");
    XLSX.writeFile(wb, "employee_list.xlsx");
  };

  const exportToPDF = () => {
    if (filteredEmployee.length === 0) {
      toast.warn("No data available to export to PDF.");
      return;
    }
    const doc = new jsPDF();
    doc.autoTable({
      head: [["Employee ID", "Full Name", "Email", "Status"]],
      body: filteredEmployee.map((staff) => [
        staff.employeeId,
        `${staff.firstName} ${staff.middleName} ${staff.lastName}`.trim(),
        staff.email,
        staff.status,
      ]),
    });
    doc.save("employee_list.pdf");
  };

  const exportToCSV = () => {
    if (filteredEmployee.length === 0) {
      toast.warn("No data available to export to CSV.");
      return;
    }
    const ws = XLSX.utils.json_to_sheet(filteredEmployee);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Employee Data");
    XLSX.writeFile(wb, "employee_list.csv");
  };

  const printPage = () => {
    if (filteredEmployee.length === 0) {
      toast.warn("No data available to print.");
      return;
    }
    window.print();
  };

  const copyToClipboard = () => {
    if (filteredEmployee.length === 0) {
      toast.warn("No data available to copy to clipboard.");
      return;
    }
    const textToCopy = filteredEmployee
      .map(
        (record) =>
          `${record.firstName} ${record.middleName} ${record.lastName} - ${record.employeeId} - ${record.email} - ${record.status}`
      )
      .join("\n");

    navigator.clipboard
      .writeText(textToCopy)
      .then(() => toast.success("Data copied to clipboard!"))
      .catch(() => toast.error("Failed to copy data."));
  };

  // Sorting function
  const handleSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });

    const sorted = [...filteredEmployee].sort((a, b) => {
      let aValue, bValue;

      if (key === "fullName") {
        aValue = `${a.firstName} ${a.middleName || ""} ${a.lastName}`.trim();
        bValue = `${b.firstName} ${b.middleName || ""} ${b.lastName}`.trim();
      } else {
        aValue = a[key];
        bValue = b[key];
      }

      if (aValue < bValue) return direction === "ascending" ? -1 : 1;
      if (aValue > bValue) return direction === "ascending" ? 1 : -1;
      return 0;
    });

    setFilteredEmployee(sorted);
  };

  // Search and filter effect
  useEffect(() => {
    const filtered = employee.filter((record) => {
      const searchString = searchQuery.toLowerCase();
      const matchesSearch =
        record.firstName?.toLowerCase().includes(searchString) ||
        record.lastName?.toLowerCase().includes(searchString) ||
        record.employeeId?.toString().includes(searchString) ||
        record.email?.toLowerCase().includes(searchString);

      const matchesStatus =
        filterStatus === "all" ? true : record.status === filterStatus;

      return matchesSearch && matchesStatus;
    });
    setFilteredEmployee(filtered);
    setCurrentPage(1);
  }, [searchQuery, employee, filterStatus]);

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredEmployee.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredEmployee.length / itemsPerPage);

  // Animation variants
  const tableVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <div className="container mx-auto px-4 py-8 mt-12 bg-gradient-to-br from-gray-50 to-indigo-50">
      {/* Header and Controls */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Employee List</h1>
        <div className="flex justify-end space-x-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.5 }}
            onClick={exportToExcel}
            className="px-4 py-2 bg-green-500 text-white rounded-lg shadow flex items-center"
            title="Export to Excel"
          >
            <FiFileText className="mr-2" /> Excel
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={exportToPDF}
            className="px-4 py-2 bg-red-500 text-white rounded-lg shadow flex items-center"
            title="Export to PDF"
          >
            <FiDownload className="mr-2" /> PDF
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={exportToCSV}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg shadow flex items-center"
            title="Export to CSV"
          >
            <FiFile className="mr-2" /> CSV
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={printPage}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow flex items-center"
            title="Print Page"
          >
            <FiPrinter className="mr-2" /> Print
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={copyToClipboard}
            className="px-4 py-2 bg-yellow-500 text-white rounded-lg shadow flex items-center"
            title="Copy to Clipboard"
          >
            <FiCopy className="mr-2" /> Copy
          </motion.button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-wrap justify-end gap-4 mb-6">
        <input
          type="text"
          placeholder="Search employees..."
          className="px-4 py-2 border rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <select
          className="px-4 py-2 border rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
          <option value="ON_LEAVE">On Leave</option>
          <option value="TERMINATED">Terminated</option>
        </select>
      </div>

      {/* Employee Table */}
      <motion.div
        variants={tableVariants}
        initial="hidden"
        animate="visible"
        className="overflow-x-auto rounded-xl shadow-lg"
      >
        <table className="min-w-full bg-white text-gray-800">
          <thead className="bg-indigo-600 text-white">
            <tr>
              <th
                className="px-6 py-3 cursor-pointer text-center"
                onClick={() => handleSort("employeeId")}
              >
                Employee ID{" "}
                {sortConfig.key === "employeeId" &&
                sortConfig.direction === "ascending" ? (
                  <FiArrowUp className="ml-1 inline" />
                ) : (
                  <FiArrowDown className="ml-1 inline" />
                )}
              </th>
              <th
                className="px-6 py-3 cursor-pointer text-center"
                onClick={() => handleSort("fullName")}
              >
                Full Name{" "}
                {sortConfig.key === "fullName" &&
                sortConfig.direction === "ascending" ? (
                  <FiArrowUp className="ml-1 inline" />
                ) : (
                  <FiArrowDown className="ml-1 inline" />
                )}
              </th>
              <th
                className="px-6 py-3 cursor-pointer text-center"
                onClick={() => handleSort("email")}
              >
                Email{" "}
                {sortConfig.key === "email" &&
                sortConfig.direction === "ascending" ? (
                  <FiArrowUp className="ml-1 inline" />
                ) : (
                  <FiArrowDown className="ml-1 inline" />
                )}
              </th>
              <th className="px-6 py-3 text-center">Status</th>
              <th className="px-6 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="text-center py-4">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1 }}
                    className="inline-block h-8 w-8 border-4 border-t-indigo-500 border-gray-200 rounded-full"
                  />
                </td>
              </tr>
            ) : currentItems.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-4 text-gray-500">
                  No employees found
                </td>
              </tr>
            ) : (
              currentItems.map((item) => (
                <motion.tr
                  key={item.employeeId}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="hover:bg-gray-100"
                >
                  <td className="px-6 py-4 text-center">{item.employeeId}</td>
                  <td className="px-6 py-4 text-center">
                    {`${item.firstName} ${item.middleName} ${item.lastName}`.trim()}
                  </td>
                  <td className="px-6 py-4 text-center">{item.email}</td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`px-2 py-1 rounded-full text-sm ${
                        item.status === "ACTIVE"
                          ? "bg-green-100 text-green-800"
                          : item.status === "INACTIVE"
                          ? "bg-gray-100 text-gray-800"
                          : item.status === "ON_LEAVE"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center space-x-3">
                      <button
                        onClick={() => fetchCompleteDetails(item.employeeId)}
                        className="text-blue-500 hover:text-blue-700"
                        title="View Details"
                      >
                        <FiEye size={20} />
                      </button>
                      <button
                        onClick={() => handleEditClick(item.employeeId)}
                        className="text-yellow-500 hover:text-yellow-700"
                        title="Edit Employee"
                      >
                        <FiEdit size={20} />
                      </button>
                      <button
                        onClick={() => {
                          setEmployeeToDelete(item);
                          setShowConfirmDialog(true);
                        }}
                        className="text-red-500 hover:text-red-700"
                        title="Deactivate Employee"
                      >
                        <FiTrash2 size={20} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </motion.div>

      {/* Pagination */}
      <div className="mt-6 flex justify-between items-center text-gray-700">
        <span>
          Showing {indexOfFirstItem + 1} to{" "}
          {Math.min(indexOfLastItem, filteredEmployee.length)} of{" "}
          {filteredEmployee.length} entries
        </span>
        <div className="flex space-x-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-indigo-500 text-white rounded-lg disabled:opacity-50 shadow"
          >
            Previous
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-indigo-500 text-white rounded-lg disabled:opacity-50 shadow"
          >
            Next
          </motion.button>
        </div>
      </div>

      {/* Modals */}
      {showModal && (
        <EmployeeModal
          employee={selectedEmployee}
          onClose={() => {
            setShowModal(false);
            setSelectedEmployee(null);
          }}
        />
      )}

      {showConfirmDialog && (
        <ConfirmDialog
          title="Confirm Deactivation"
          message={`Are you sure you want to deactivate ${employeeToDelete.firstName} ${employeeToDelete.middleName} ${employeeToDelete.lastName} (${employeeToDelete.email})?`}
          onConfirm={() => {
            handleDelete(employeeToDelete.employeeId);
            setShowConfirmDialog(false);
          }}
          onCancel={() => setShowConfirmDialog(false)}
        />
      )}

      {/* Edit Modal */}
      {showEditModal && editEmployee && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-semibold text-gray-800">
                Edit Employee
              </h2>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name *
                    </label>
                    <input
                      type="text"
                      value={editEmployee.firstName}
                      onChange={(e) =>
                        setEditEmployee({
                          ...editEmployee,
                          firstName: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Middle Name
                    </label>
                    <input
                      type="text"
                      value={editEmployee.middleName || ""}
                      onChange={(e) =>
                        setEditEmployee({
                          ...editEmployee,
                          middleName: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      value={editEmployee.lastName}
                      onChange={(e) =>
                        setEditEmployee({
                          ...editEmployee,
                          lastName: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={editEmployee.email}
                      onChange={(e) =>
                        setEditEmployee({
                          ...editEmployee,
                          email: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      value={editEmployee.phoneNumber || ""}
                      onChange={(e) =>
                        setEditEmployee({
                          ...editEmployee,
                          phoneNumber: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      value={
                        editEmployee.dob
                          ? new Date(editEmployee.dob)
                              .toISOString()
                              .split("T")[0]
                          : ""
                      }
                      onChange={(e) =>
                        setEditEmployee({
                          ...editEmployee,
                          dob: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date of Joining
                    </label>
                    <input
                      type="date"
                      value={
                        editEmployee.dateOfJoining
                          ? new Date(editEmployee.dateOfJoining)
                              .toISOString()
                              .split("T")[0]
                          : ""
                      }
                      onChange={(e) =>
                        setEditEmployee({
                          ...editEmployee,
                          dateOfJoining: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Gender
                    </label>
                    <select
                      value={editEmployee.gender || ""}
                      onChange={(e) =>
                        setEditEmployee({
                          ...editEmployee,
                          gender: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                    >
                      <option value="">Select Gender</option>
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Photo
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        setEditEmployee({
                          ...editEmployee,
                          photoFile: e.target.files[0],
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition-all duration-200"
                    />
                  </div>

                  {/* Address Fields */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City
                      </label>
                      <input
                        type="text"
                        value={
                          (editEmployee.address &&
                            editEmployee.address[0]?.city) ||
                          ""
                        }
                        onChange={(e) =>
                          setEditEmployee({
                            ...editEmployee,
                            address: [
                              {
                                ...editEmployee.address[0],
                                city: e.target.value,
                              },
                            ],
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Zone
                      </label>
                      <input
                        type="text"
                        value={
                          (editEmployee.address &&
                            editEmployee.address[0]?.zone) ||
                          ""
                        }
                        onChange={(e) =>
                          setEditEmployee({
                            ...editEmployee,
                            address: [
                              {
                                ...editEmployee.address[0],
                                zone: e.target.value,
                              },
                            ],
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Region
                      </label>
                      <input
                        type="text"
                        value={
                          (editEmployee.address &&
                            editEmployee.address[0]?.region) ||
                          ""
                        }
                        onChange={(e) =>
                          setEditEmployee({
                            ...editEmployee,
                            address: [
                              {
                                ...editEmployee.address[0],
                                region: e.target.value,
                              },
                            ],
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Country
                      </label>
                      <input
                        type="text"
                        value={
                          (editEmployee.address &&
                            editEmployee.address[0]?.country) ||
                          ""
                        }
                        onChange={(e) =>
                          setEditEmployee({
                            ...editEmployee,
                            address: [
                              {
                                ...editEmployee.address[0],
                                country: e.target.value,
                              },
                            ],
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="mt-8 flex justify-end space-x-3 border-t border-gray-200 pt-6">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditEmployee(null);
                  }}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all duration-200 font-medium"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-200 font-medium"
                >
                  Save Changes
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
