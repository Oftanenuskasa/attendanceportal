"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import att from "@/Image/att.png";
import Image from "next/image";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import axios from "axios";

const Login = ({ setLogin }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [username, setUsername]= useState("");
  const router = useRouter();

  const handlePasswordVisibilityToggle = () => {
    setShowPassword((prev) => !prev);
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
        
        console.log("username and password ", username, password);
        
        const response = await axios.post(
            "https://attendanceportal-3.onrender.com/api/employees/login",
            { username, password }
          );

          if(response.status === 200){
            const user={
                firstName: response.data.firstName,
                middleName: response.data.middleName,
                lastName: response.data.lastName,
                name: response.data.username,
                email: response.data.email,
                role: response.data.roles,
                employeeId: response.data.employeeId,
                photo: response.data.photo,
              };
              const token=response.data.token;
              localStorage.setItem("auth-store", JSON.stringify({ token, user }));
              console.log("Login successful:", response.data);
              router.push("/dashboard");
        }
        
    } catch (error) {
      console.log(error);
      alert(error.response?.data?.message || "Login failed");
    }

  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-indigo-500 to-blue-600 p-8">
      <div className="bg-white p-8 rounded-xl shadow-2xl max-w-lg w-full">
        <div onClick={() => setLogin(false)} className="w-24 mx-auto mb-6 cursor-pointer">
          <Image
            src={att}
            alt="logo"
            width={96}
            height={96}
            className="rounded-full"
          />
        </div>

        <h2 className="text-center text-3xl font-semibold text-gray-800 mb-6">
          Welcome Back!
        </h2>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="email" className="text-sm font-medium text-gray-700">
              Username or Email
            </label>
            <input
              type="text"
              id="email"
              placeholder="Enter your username or email"
              value={username}
              onChange={(e)=> setUsername(e.target.value)}
              className="mt-2 block w-full px-4 py-3 text-gray-800 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 border-gray-300 transition-all duration-200 hover:ring-2 hover:ring-blue-300"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="mt-2 block w-full px-4 py-3 text-gray-800 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 border-gray-300 transition-all duration-200 hover:ring-2 hover:ring-blue-300"
                required
              />
              <button
                type="button"
                onClick={handlePasswordVisibilityToggle}
                className="absolute inset-y-0 right-0 flex items-center px-4 text-gray-500 hover:text-blue-600"
              >
                {showPassword ? (
                  <AiOutlineEyeInvisible className="h-5 w-5" />
                ) : (
                  <AiOutlineEye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center text-sm text-gray-600">
              <input
                type="checkbox"
                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
              <span className="ml-2">Remember me</span>
            </label>
            <a href="/forgot-password" className="text-sm text-blue-600 hover:underline">
              Forgot password?
            </a>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-full hover:bg-blue-700 transition-all duration-300 ease-in-out"
          >
            Login
          </button>
        </form>

      </div>
    </div>
  );
};

export default Login;