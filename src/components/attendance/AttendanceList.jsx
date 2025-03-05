"use client";

import { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  getSortedRowModel,
} from '@tanstack/react-table';
import { 
  Search, 
  ChevronDown, 
  ChevronUp, 
  Download, 
  Printer,
  FileSpreadsheet,
  FileText,
  ArrowUpDown
} from 'lucide-react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

const AttendanceList = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [searchType, setSearchType] = useState('general');
  const [searchDate, setSearchDate] = useState('');
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
  const [employeeId, setEmployeeId] = useState('');
  const router = useRouter();

  // Get token from localStorage
  const getAuthToken = () => {
    const authData = JSON.parse(localStorage.getItem("auth-store"));
    return authData?.token || null;
  };

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      router.push('/login');
    } else {
      fetchAttendanceData();
    }
  }, [router]);

  const fetchAttendanceData = async () => {
    setLoading(true);
    try {
      const token = getAuthToken();
      const response = await axios.get('https://attendanceportal-3.onrender.com/api/employees/attendance', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAttendanceData(response.data);
    } catch (error) {
      console.error('Error fetching attendance data:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem("auth-store");
        router.push('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendanceByDate = async () => {
    if (!employeeId || !searchDate) {
      alert('Please enter both Employee ID and Date');
      return;
    }
    setLoading(true);
    try {
      const token = getAuthToken();
      const response = await axios.get(
        `https://attendanceportal-3.onrender.com/api/employees/attendance/date?employeeId=${employeeId}&date=${searchDate}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAttendanceData(response.data);
    } catch (error) {
      console.error('Error fetching attendance by date:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem("auth-store");
        router.push('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendanceHistory = async () => {
    if (!employeeId || !dateRange.startDate || !dateRange.endDate) {
      alert('Please enter Employee ID and both dates');
      return;
    }
    setLoading(true);
    try {
      const token = getAuthToken();
      const response = await axios.get(
        `https://attendanceportal-3.onrender.com/api/employees/attendance/history?employeeId=${employeeId}&startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAttendanceData(response.data);
    } catch (error) {
      console.error('Error fetching attendance history:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem("auth-store");
        router.push('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (searchType === 'date') {
      fetchAttendanceByDate();
    } else if (searchType === 'dateRange') {
      fetchAttendanceHistory();
    } else {
      fetchAttendanceData(); // Reset to all data
    }
  };

  const handleReset = () => {
    setSearchType('general');
    setSearchDate('');
    setDateRange({ startDate: '', endDate: '' });
    setEmployeeId('');
    setGlobalFilter('');
    fetchAttendanceData();
  };

  const columns = [
    { header: '#', cell: (info) => info.row.index + 1, size: 60 },
    { header: 'Employee ID', accessorKey: 'employeeId' },
    { header: 'Name', accessorKey: 'name' },
    { header: 'Department', accessorKey: 'department' },
    {
      header: 'Date',
      accessorKey: 'date',
      cell: ({ getValue }) => {
        const date = getValue();
        return date ? new Date(date).toLocaleDateString() : 'N/A';
      },
    },
    { header: 'Attendance Status', accessorKey: 'status' },
  ];

  const table = useReactTable({
    data: attendanceData,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const exportToPDF = () => {
    if (attendanceData.length === 0) {
      alert("No records available to export.");
      return;
    }
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Employee Attendance Records', 14, 20);
    const headers = columns.map(col => col.header);
    const rows = table.getFilteredRowModel().rows.map(row => 
      row.getVisibleCells().map(cell => flexRender(cell.column.columnDef.cell, cell.getContext()))
    );
    doc.autoTable({ startY: 30, head: [headers], body: rows, theme: 'grid' });
    doc.save('attendance_records.pdf');
  };

  const exportToExcel = () => {
    if (attendanceData.length === 0) {
      alert("No records available to export.");
      return;
    }
    const headers = columns.map(col => col.header).join('\t');
    const rows = table.getFilteredRowModel().rows.map(row => 
      row.getVisibleCells().map(cell => flexRender(cell.column.columnDef.cell, cell.getContext())).join('\t')
    ).join('\n');
    const content = `${headers}\n${rows}`;
    const blob = new Blob([content], { type: 'application/vnd.ms-excel' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'attendance_data.xls';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportToCSV = () => {
    if (attendanceData.length === 0) {
      alert("No records available to export.");
      return;
    }
    const headers = columns.map(col => col.header).join(',');
    const rows = table.getFilteredRowModel().rows.map(row => 
      row.getVisibleCells().map(cell => `"${flexRender(cell.column.columnDef.cell, cell.getContext())}"`).join(',')
    ).join('\n');
    const content = `${headers}\n${rows}`;
    const blob = new Blob([content], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'attendance_data.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const print = () => {
    if (attendanceData.length === 0) {
      alert("No records available to export.");
      return;
    }
    const printWindow = window.open('', '_blank');
    const headers = columns.map(col => col.header);
    const rows = table.getFilteredRowModel().rows.map(row => 
      row.getVisibleCells().map(cell => flexRender(cell.column.columnDef.cell, cell.getContext()))
    );
    printWindow.document.write(`
      <html>
        <head>
          <title>Attendance Records</title>
          <style>
            table { border-collapse: collapse; width: 100%; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f5f5f5; }
            @media print { body { margin: 0; padding: 20px; } h1 { margin-bottom: 20px; } }
          </style>
        </head>
        <body>
          <h1>Employee Attendance Records</h1>
          <table>
            <thead><tr>${headers.map(header => `<th>${header}</th>`).join('')}</tr></thead>
            <tbody>${rows.map(row => `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`).join('')}</tbody>
          </table>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); printWindow.close(); }, 250);
  };

  return (
    <div className="p-4 bg-gray-50 min-h-screen mt-12">
      <div className="mb-4 bg-white rounded-lg shadow p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-800">Employee Attendance Records</h1>
          <div className="flex gap-2 relative">
            <div className="relative">
              <button 
                className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
                onClick={() => setShowExportMenu(!showExportMenu)}
                onBlur={() => setTimeout(() => setShowExportMenu(false), 200)}
              >
                <Download size={20} />
                <ChevronDown size={16} />
              </button>
              {showExportMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10 text-black">
                  <button onClick={exportToExcel} className="w-full px-4 py-2 text-left flex items-center gap-2 hover:bg-gray-50">
                    <FileSpreadsheet size={16} /> <span>Export to Excel</span>
                  </button>
                  <button onClick={exportToCSV} className="w-full px-4 py-2 text-left flex items-center gap-2 hover:bg-gray-50">
                    <FileText size={16} /> <span>Export to CSV</span>
                  </button>
                  <button onClick={exportToPDF} className="w-full px-4 py-2 text-left flex items-center gap-2 hover:bg-gray-50">
                    <FileText size={16} /> <span>Export to PDF</span>
                  </button>
                  <button onClick={print} className="w-full px-4 py-2 text-left flex items-center gap-2 hover:bg-gray-50">
                    <Printer size={16} /> <span>Print</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 mb-4 text-black">
          <div className="flex gap-4">
            <select
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
              className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="general">General Search</option>
              <option value="date">Search by Date</option>
              <option value="dateRange">Search by Date Range</option>
            </select>

            {searchType !== 'general' && (
              <input
                type="text"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                placeholder="Enter Employee ID"
                className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            )}
          </div>

          <div className="flex gap-4">
            {searchType === 'general' && (
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={globalFilter ?? ''}
                  onChange={(e) => setGlobalFilter(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Search records..."
                />
              </div>
            )}

            {searchType === 'date' && (
              <input
                type="date"
                value={searchDate}
                onChange={(e) => setSearchDate(e.target.value)}
                className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            )}

            {searchType === 'dateRange' && (
              <>
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                  className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Start Date"
                />
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                  className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="End Date"
                />
              </>
            )}

            {searchType !== 'general' && (
              <button
                onClick={handleSearch}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:ring-2 focus:ring-blue-500"
              >
                Search
              </button>
            )}

            <button
              onClick={handleReset}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 focus:ring-2 focus:ring-gray-500"
            >
              Reset
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-4">Loading...</div>
        ) : attendanceData.length === 0 ? (
          <div className="text-center py-4 text-black">No records available.</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id} className="bg-gray-100">
                      {headerGroup.headers.map((header) => (
                        <th
                          key={header.id}
                          className="px-4 py-3 text-left text-sm font-semibold text-gray-600 border-b cursor-pointer group"
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          <div className="flex items-center gap-2">
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            <span className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                              {header.column.getIsSorted() ? (
                                header.column.getIsSorted() === 'asc' ? (
                                  <ChevronUp size={16} />
                                ) : (
                                  <ChevronDown size={16} />
                                )
                              ) : (
                                <ArrowUpDown size={16} />
                              )}
                            </span>
                          </div>
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody>
                  {table.getRowModel().rows.map((row) => (
                    <tr key={row.id} className="border-b hover:bg-gray-50 transition-colors">
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="px-4 py-3 text-sm text-gray-700">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => table.setPageIndex(0)}
                  disabled={!table.getCanPreviousPage() || attendanceData.length === 0}
                  className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50 text-black"
                >
                  {'<<'}
                </button>
                <button
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage() || attendanceData.length === 0}
                  className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50 text-black"
                >
                  {'<'}
                </button>
                <button
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage() || attendanceData.length === 0}
                  className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50 text-black"
                >
                  {'>'}
                </button>
                <button
                  onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                  disabled={!table.getCanNextPage() || attendanceData.length === 0}
                  className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50 text-black"
                >
                  {'>>'}
                </button>
                <select
                  value={table.getState().pagination.pageSize}
                  onChange={e => table.setPageSize(Number(e.target.value))}
                  className="px-3 py-1 border rounded text-black"
                >
                  {[5, 10, 20, 30, 40, 50].map(pageSize => (
                    <option key={pageSize} value={pageSize}>
                      Show {pageSize}
                    </option>
                  ))}
                </select>
              </div>
              <span className="text-sm text-black">
                Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AttendanceList;