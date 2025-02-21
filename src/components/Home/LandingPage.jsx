"use client";

import React, { useState, useEffect } from "react";
import Login from "./Login";
import att from "@/Image/att.png";
import Image from "next/image";
import Link from "next/link";

const LandingPage = () => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div className="w-full min-h-screen bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 flex flex-col items-center justify-center text-white">
      <header className="text-center py-16">
        <h1 className="text-5xl font-extrabold mb-6">
          Welcome to{" "}
          <span className="text-yellow-300">Attendance Portal System</span>
        </h1>
        <p className="text-lg max-w-2xl mx-auto leading-relaxed">
          A comprehensive attendance portal system designed to efficiently track
          and manage attendance for Employees.
        </p>
      </header>
      <section className="w-full max-w-md">
        <div className="flex items-center justify-between bg-white p-6 rounded-lg shadow-lg max-w-lg mx-auto">
          <div className="w-28 flex-shrink-0">
            <Image
              src={att}
              alt="logo"
              width={120}
              height={100}
              className="rounded-lg"
            />
          </div>
          <div className="ml-6">
            <h1 className="text-2xl font-bold text-gray-800">
              Attendance Portal
            </h1>
            <p className="text-gray-600 mt-2">
              <Link
                href="/login"
                className="cursor-pointer text-blue-600 font-semibold hover:underline"
              >
                Login
              </Link>{" "}
              to your account
            </p>
          </div>
        </div>
      </section>
      <footer className="mt-20 text-sm text-center">
        &copy; {new Date().getFullYear()} Attendance Portal System. All rights
        reserved.
      </footer>
    </div>
  );
};

export default LandingPage;
