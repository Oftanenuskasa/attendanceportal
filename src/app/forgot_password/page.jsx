"use client";

import React, { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Image from "next/image";
import att from "@/Image/att.png";

const ForgotPassword = () => {
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const response = await axios.post(
        "https://attendanceportal-3.onrender.com/api/employees/forgot-password",
        { username }
      );
      setMessage("A password reset link has been sent to your email.");
      setTimeout(() => router.push("/login"), 3000); // Redirect to login after 3 seconds
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-indigo-500 to-blue-600 p-8">
      <div className="bg-white p-8 rounded-xl shadow-2xl max-w-lg w-full">
        <div className="w-24 mx-auto mb-6">
          <Image src={att} alt="logo" width={96} height={96} className="rounded-full" />
        </div>

        <h2 className="text-center text-3xl font-semibold text-gray-800 mb-6">
          Forgot Password
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="text-sm font-medium text-gray-700">
              Username or Email
            </label>
            <input
              type="text"
              id="username"
              placeholder="Enter your username or email"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-2 block w-full px-4 py-3 text-gray-800 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 border-gray-300 transition-all duration-200 hover:ring-2 hover:ring-blue-300"
              required
            />
          </div>

          {message && <p className="text-green-600 text-sm">{message}</p>}
          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-full hover:bg-blue-700 transition-all duration-300 ease-in-out"
          >
            Send Reset Link
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-4">
          Back to{" "}
          <a href="/login" className="text-blue-600 hover:underline">
            Login
          </a>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;