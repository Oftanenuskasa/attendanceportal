let attendanceRecords = []; // Temporary storage

import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(attendanceRecords, { status: 200 });
}

export async function POST(req) {
  const { name, status } = await req.json();
  const newRecord = { name, status, date: new Date().toISOString() };
  attendanceRecords.push(newRecord);
  return NextResponse.json({ message: "Attendance recorded", record: newRecord }, { status: 201 });
}
