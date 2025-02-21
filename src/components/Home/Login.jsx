"use client";

import React, { useState } from "react";
import { useRouter } from 'next/navigation'
import att from "@/Image/att.png";
import Image from "next/image";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

const Login = ({ setLogin }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handlePasswordVisibilityToggle = () => {
    setShowPassword((prev) => !prev);
  };

  const handleLogin = (e) => {
    e.preventDefault();

    router.push("/dashboard"); 
  };

  return (
    <div className="bg-white p-8 mt-6 rounded-lg shadow-lg flex flex-col items-center space-y-6 max-w-sm w-full">
      <div onClick={() => setLogin(false)} className="w-24 cursor-pointer">
        <Image
          src={att}
          alt="logo"
          width={96}
          height={96}
          className="rounded-lg"
        />
      </div>

      <form onSubmit={handleLogin} className="w-full space-y-4">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            Username or Email
          </label>
          <input
            type="text"
            id="email"
            placeholder="Enter your username or email"
            className="mt-1 block w-full px-4 py-2 text-gray-600 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 border-gray-300"
            required
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700"
          >
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="mt-1 block w-full px-4 py-2 text-gray-600 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 border-gray-300"
              required
            />
            <button
              type="button"
              onClick={handlePasswordVisibilityToggle}
              className="absolute inset-y-0 right-0 flex items-center px-4 text-gray-500"
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
          className="w-full bg-blue-600 text-white px-6 py-3 rounded-full hover:bg-blue-700 transition-all"
        >
          Login
        </button>
      </form>
    </div>
  );
};

export default Login;