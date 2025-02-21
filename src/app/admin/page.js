"use client";
import { useEffect, useState } from "react";

export default function Admin() {
  const [records, setRecords] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const res = await fetch("/api/attendance");
        if (!res.ok) throw new Error("Failed to fetch records");
        const data = await res.json();
        setRecords(data);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchAttendance();
  }, []);

  return (
    <div className="container mx-auto p-5">
      <h1 className="text-2xl font-bold">Attendance Records</h1>
      {error && <p className="text-red-500">{error}</p>}
      <table className="w-full mt-4 border">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2">Name</th>
            <th className="p-2">Status</th>
            <th className="p-2">Date</th>
          </tr>
        </thead>
        <tbody>
          {records.length > 0 ? (
            records.map((rec, index) => (
              <tr key={index} className="border-t">
                <td className="p-2">{rec.name}</td>
                <td className="p-2">{rec.status}</td>
                <td className="p-2">{new Date(rec.date).toLocaleDateString()}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3" className="p-2 text-center">
                No attendance records yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
