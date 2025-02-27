"use client";

import React, { useState, useEffect } from 'react';
import { useReactTable, getCoreRowModel, flexRender, getSortedRowModel } from '@tanstack/react-table';
import { Calendar, Search, ChevronDown, ChevronUp, Clock, Download } from 'lucide-react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

const AttendanceHistory = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    employeeId: '',
    date: '', // Changed from 'Date' to 'date' for consistency
  });
  const router = useRouter();

  // Get token from localStorage
  const getAuthToken = () => {
    const authData = JSON.parse(localStorage.getItem("auth-store"));
    return authData?.token || null;
  };

  // Table columns definition
  const columns = [
    { header: '#', cell: (info) => info.row.index + 1, size: 60 },
    { header: 'Employee ID', accessorFn: (row) => row.employeeId?._id || 'N/A' },
    { header: 'Name', accessorKey: 'name' },
    { header: 'Department', accessorKey: 'department' },
    {
      header: 'Date',
      accessorKey: 'date',
      cell: ({ getValue }) => new Date(getValue()).toLocaleDateString(),
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: ({ getValue }) => (
        <span
          className={`px-3 py-1 rounded-full text-sm ${
            getValue() === 'Present'
              ? 'bg-green-100 text-green-800'
              : getValue() === 'Late'
              ? 'bg-yellow-100 text-yellow-800'
              : getValue() === 'Work From Home'
              ? 'bg-blue-100 text-blue-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {getValue()}
        </span>
      ),
    },
  ];

  const table = useReactTable({
    data: attendanceData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const fetchAttendanceData = async () => {
    try {
      setIsLoading(true);
      setError('');

      const token = getAuthToken();
      if (!token) {
        router.push('/login');
        return;
      }

      const dateToFetch = filters.date || new Date().toISOString().split('T')[0]; // Default to today
      const url = `https://attendanceportal-3.onrender.com/api/employees/attendance/date?employeeId=${filters.employeeId || ''}&date=${dateToFetch}`;

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setAttendanceData(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch attendance data');
      if (err.response?.status === 401) {
        localStorage.removeItem("auth-store");
        router.push('/login');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data on mount with today's date if no filters
  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      router.push('/login');
    } else {
      fetchAttendanceData();
    }
  }, [router]);

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    if (!filters.employeeId) {
      alert('Please enter an Employee ID');
      return;
    }
    fetchAttendanceData();
  };

  const exportToCSV = () => {
    if (attendanceData.length === 0) {
      alert('No data available to export');
      return;
    }

    const headers = columns.map(col => col.header);
    const rows = attendanceData.map(row => 
      columns.map(col => {
        if (col.accessorFn) {
          return col.accessorFn(row);
        }
        return row[col.accessorKey] || '';
      })
    );

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-report-${filters.date || new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 mt-12 text-black">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Attendance History
          </h1>

          {/* Filter Form */}
          <form onSubmit={handleFilterSubmit} className="space-y-4 md:space-y-0 md:flex md:space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Employee ID
              </label>
              <input
                type="text"
                value={filters.employeeId}
                onChange={(e) => setFilters(prev => ({ ...prev, employeeId: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter Employee ID"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <input
                type="date"
                value={filters.date}
                onChange={(e) => setFilters(prev => ({ ...prev, date: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex items-end space-x-2">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <Search size={20} className="inline-block mr-2" />
                Filter
              </button>
              <button
                type="button"
                onClick={exportToCSV}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                <Download size={20} className="inline-block mr-2" />
                Export
              </button>
            </div>
          </form>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading attendance records...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center text-red-600">
              {error}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  {table.getHeaderGroups().map(headerGroup => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map(header => (
                        <th
                          key={header.id}
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {table.getRowModel().rows.map(row => (
                    <tr key={row.id}>
                      {row.getVisibleCells().map(cell => (
                        <td
                          key={cell.id}
                          className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {attendanceData.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No attendance records found
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttendanceHistory;