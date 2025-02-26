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
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "ascending" });
  const [filterStatus, setFilterStatus] = useState("all");
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
        router.push('/login');
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
        router.push('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployeeData();
  }, [router]);

  // Handle employee deletion (corrected to use employee state)
  const handleDelete = async (id) => {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error("No authentication token found. Please log in.");
      }

      // Find the employee to get the employeeId (EMPxxx format)
      const selectedEmployee = employee.find((emp) => emp.employeeId === id); // Changed from employees to employee
      if (!selectedEmployee || !selectedEmployee.employeeId) {
        throw new Error("Employee ID not found");
      }

      // Send PATCH request to deactivate instead of delete
      await axios.patch(
        `http://localhost:5000/api/employees/${selectedEmployee.employeeId}/deactivate`,
        { status: "INACTIVE" },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success("Employee deactivated successfully");
      fetchEmployeeData(); // Refresh the employee list
    } catch (error) {
      console.error("Error deactivating employee:", error);
      toast.error(error.response?.data?.message || "Failed to deactivate employee");
      if (error.response?.status === 401) {
        localStorage.removeItem("auth-store");
        router.push('/login');
      }
    }
  };

  const fetchCompleteDetails = async (id) => {
    try {
      const token = getAuthToken();
      const response = await axios.get(`http://localhost:5000/api/employees/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSelectedEmployee(response.data);
      setShowModal(true);
    } catch (error) {
      toast.error("Failed to fetch employee details");
      console.error("Error fetching employee details:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem("auth-store");
        router.push('/login');
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
      .map((record) =>
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
  const currentItems = filteredEmployee.slice(indexOfFirstItem, indexOfLastItem);
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
                {sortConfig.key === "employeeId" && sortConfig.direction === "ascending" ? (
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
                {sortConfig.key === "fullName" && sortConfig.direction === "ascending" ? (
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
                {sortConfig.key === "email" && sortConfig.direction === "ascending" ? (
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
                <td colSpan="5" className="text-center py-4 text-gray-500">No employees found</td>
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
                  <td className="px-6 py-4 text-center">{`${item.firstName} ${item.middleName} ${item.lastName}`.trim()}</td>
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
                      <Link
                        href={`/employee/edit/${item.employeeId}`}
                        className="text-yellow-500 hover:text-yellow-700"
                        title="Edit Employee"
                      >
                        <FiEdit size={20} />
                      </Link>
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
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
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
    </div>
  );
}