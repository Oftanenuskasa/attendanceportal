"use client";

import React, { useEffect, useState } from "react";
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
import EmployeeModal from "./EmployeeModal";
import ConfirmDialog from "./ConfirmDialog";

export default function EmployeeList() {
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

  // Fetch employee data
  const fetchEmployeeData = async () => {
    try {
      setLoading(true);
      const response = await attendanceService.getAllEmployee();
      
      console.log("Fetched Employee Data:", response);

      const formattedData = response.data.map((item) => ({
        employeeId: item.employeeId,
        firstName: item.firstName,
        middleName: item.middleName,
        lastName: item.lastName,
        email: item.email,
        status: item.status, // e.g., PRESENT, ABSENT, LATE
      }));

      setEmployee(formattedData);
      setFilteredEmployee(formattedData);
    } catch (error) {
      toast.error("Failed to fetch employee data");
      console.error("Error fetching employee:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployeeData();
  }, []);

  // Handle attendance deletion
  const handleDelete = async (id) => {
    try {
      await attendanceService.deleteEmployee(id);
      toast.success("Employee record deleted successfully");
      fetchEmployeeData();
    } catch (error) {
      toast.error("Failed to delete employee record");
      console.error("Error deleting employee:", error);
    }
  };

  const fetchCompleteDetails = async (id) => {
    try {
      const response = await attendanceService.getEmployeeById(id);
      setSelectedEmployee(response.data);
      setShowModal(true);
    } catch (error) {
      toast.error("Failed to fetch employee details");
      console.error("Error fetching employee details:", error);
    }
  };

  // Export functions
  const exportToExcel = () => {
    if (filteredEmployee.length === 0) {
      alert("No data available to export to Excel.");
      return;
    }
    const ws = XLSX.utils.json_to_sheet(filteredEmployee);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Employee Data");
    XLSX.writeFile(wb, "employee_list.xlsx");
  };

  const exportToPDF = () => {
    if (filteredEmployee.length === 0) {
      alert("No data available to export to PDF.");
      return;
    }
    const doc = new jsPDF();
    doc.autoTable({
      head: [["#", "Employee ID", "Full Name", "Email", "Status"]],
      body: filteredStaff.map((staff) => [
        staff.id,
        `${staff.firstName} ${staff.middleName} ${staff.lastName}`,
        staff.email,
        staff.status,   
      ]),
    });
    doc.save("employee_list.pdf");
  };

  const exportToCSV = () => {
    if (filteredEmployee.length === 0) {
      alert("No data available to export to CSV.");
      return;
    }
    const ws = XLSX.utils.json_to_sheet(filteredEmployee);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "employee Data");
    XLSX.writeFile(wb, "employee_list.csv");
  };

  const printPage = () => {
    if (filteredEmployee.length === 0) {
      alert("No data available to print.");
      return;
    }
    window.print();
  };

  const copyToClipboard = () => {
    if (filteredEmployee.length === 0) {
      alert("No data available to copy to clipboard.");
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
        record.date?.toLowerCase().includes(searchString);

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

  return (
    <div className="container mx-auto px-4 py-8 mt-12">
      {/* Header and Controls */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-4">Employee List</h1>
        {/* Export buttons */}
        <div className="flex justify-end space-x-2">
          <button onClick={exportToExcel} className="px-4 py-2 bg-green-500 text-white rounded" title="Export to Excel">
            <FiFileText className="mr-1" />
          </button>
          <button onClick={exportToPDF} className="px-4 py-2 bg-red-500 text-white rounded" title="Export to PDF">
            <FiDownload className="mr-1" />
          </button>
          <button onClick={exportToCSV} className="flex items-center px-4 py-2 bg-gray-500 text-white rounded" title="Export to CSV">
            <FiFile className="mr-2" />
          </button>
          <button onClick={printPage} className="flex items-center px-4 py-2 bg-blue-500 text-white rounded" title="Print Page">
            <FiPrinter className="mr-2" />
          </button>
          <button onClick={copyToClipboard} className="flex items-center px-4 py-2 bg-yellow-500 text-white rounded" title="Copy to Clipboard">
            <FiCopy className="mr-2" />
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-wrap justify-end gap-4 mb-4">
        <input
          type="text"
          placeholder="Search..."
          className="px-4 py-2 border rounded text-black"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <select
          className="px-4 py-2 border rounded text-black"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="PRESENT">Present</option>
          <option value="ABSENT">Absent</option>
          <option value="LATE">Late</option>
        </select>
      </div>

      {/* Attendance Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white text-black">
          <thead>
            <tr>
              <th className="px-6 py-3 border-b cursor-pointer text-center" onClick={() => handleSort("employeeId")}>
                Employee ID{" "}
                {sortConfig.key === "employeeId" && sortConfig.direction === "ascending" ? (
                  <FiArrowUp className="ml-1 inline" />
                ) : (
                  <FiArrowDown className="ml-1 inline" />
                )}
              </th>
              <th className="px-6 py-3 border-b cursor-pointer" onClick={() => handleSort("fullName")}>
                Full Name{" "}
                {sortConfig.key === "fullName" && sortConfig.direction === "ascending" ? (
                  <FiArrowUp className="ml-1 inline" />
                ) : (
                  <FiArrowDown className="ml-1 inline" />
                )}
              </th>
              <th className="px-6 py-3 border-b cursor-pointer" onClick={() => handleSort("email")}>
                Email{" "}
                {sortConfig.key === "email" && sortConfig.direction === "ascending" ? (
                  <FiArrowUp className="ml-1 inline" />
                ) : (
                  <FiArrowDown className="ml-1 inline" />
                )}
              </th>
              <th className="px-6 py-3 border-b cursor-pointer">Status</th>
              <th className="px-6 py-3 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="text-center py-4">
                  <div className="spinner-border" role="status">
                    <span className="sr-only">Loading...</span>
                  </div>
                </td>
              </tr>
            ) : (
              currentItems.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4 border-b text-center">{item.employeeId}</td>
                  <td className="px-6 py-4 border-b text-center">{`${item.firstName} ${item.middleName || ""} ${item.lastName}`}</td>
                  <td className="px-6 py-4 border-b text-center">{item.email}</td>
                  <td className="px-6 py-4 border-b text-center">
                    <span
                      className={`px-2 py-1 rounded-full text-sm ${
                        item.status === "PRESENT"
                          ? "bg-green-100 text-green-800"
                          : item.status === "ABSENT"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 border-b items-center">
                    <div className="flex justify-center space-x-2">
                      <button onClick={() => fetchCompleteDetails(item.id)} className="text-blue-500" title="View Details">
                        <FiEye />
                      </button>
                      <Link href={`/employee/edit/${item.employeeId}`} className="text-yellow-500" title="Edit Employee">
                        <FiEdit />
                      </Link>
                      <button
                        onClick={() => {
                          setEmployeeToDelete(item);
                          setShowConfirmDialog(true);
                        }}
                        className="text-red-500"
                        title="Delete employee"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex justify-between items-center text-black">
        <span>
          Showing {indexOfFirstItem + 1} to{" "}
          {Math.min(indexOfLastItem, filteredEmployee.length)} of{" "}
          {filteredEmployee.length} entries
        </span>
        <div className="flex space-x-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 border rounded disabled:opacity-50 bg-lime-300"
          >
            Previous
          </button>
          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 border rounded disabled:opacity-50 bg-green-500"
          >
            Next
          </button>
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
          title="Confirm Delete"
          message={`Are you sure you want to delete employee for ${employeeToDelete.firstName} ${employeeToDelete.middleName} ${employeeToDelete.lastName} on ${employeeToDelete.email}?`}
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