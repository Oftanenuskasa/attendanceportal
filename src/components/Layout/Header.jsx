"use client";

import { FiBell, FiMenu, FiSun, FiUser } from 'react-icons/fi';
import Link from 'next/link';
import { FaCalendarAlt } from 'react-icons/fa';
import atte2 from '@/Image/atte2.jpg';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const Header = ({ setIsMenuOpen, isMenuOpen }) => {
  const [user, setUser] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const router = useRouter();
  const BASE_URL = "http://localhost:5000";

  useEffect(() => {
    const loadUserData = () => {
      const authData = JSON.parse(localStorage.getItem("auth-store") || "{}");
      console.log("Auth data from localStorage:", authData);
      if (authData && authData.user) {
        setUser(authData.user);
        console.log("User set:", authData.user);
        console.log("User roles:", authData.user.roles);
        console.log("Photo:", authData.user.photo);
      } else {
        setUser(null);
      }
    };

    loadUserData();
    window.addEventListener("storage", loadUserData);
    return () => window.removeEventListener("storage", loadUserData);
  }, []);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const handleThemeToggle = () => {
    setIsDarkMode((prev) => {
      const newMode = !prev;
      if (newMode) {
        document.documentElement.classList.add("dark");
        localStorage.setItem("theme", "dark");
      } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("theme", "light");
      }
      return newMode;
    });
  };

  const handleCalendarToggle = () => {
    setIsCalendarOpen((prev) => !prev);
  };

  const handleNotificationToggle = () => {
    setIsNotificationOpen((prev) => !prev);
  };

  const handleLogout = () => {
    localStorage.removeItem("auth-store");
    setUser(null);
    router.push("/login");
  };

  return (
    <header className="fixed top-0 left-0 right-0 flex justify-between items-center py-4 px-6 bg-[#fff] shadow-md z-10 dark:bg-gray-800 dark:text-white">
      <div className="flex items-center">
        <Link href="/dashboard" className="flex items-center gap-3">
          <Image src={atte2} alt="attendance logo" height={40} />
        </Link>
        <button
          className="ml-28 glassmorphism p-1 rotate-45"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <FiMenu className="-rotate-45 text-[#999] font-bold dark:text-gray-300" size={24} />
        </button>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex gap-4 relative">
          <button
            className="glassmorphism p-1 rotate-45"
            onClick={handleThemeToggle}
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            <FiSun
              className="-rotate-45 text-[#999] font-bold dark:text-gray-300"
              size={24}
            />
          </button>

          <button
            className="glassmorphism p-1 rotate-45"
            onClick={handleCalendarToggle}
            title="View Calendar"
          >
            <FaCalendarAlt
              className="-rotate-45 text-[#999] font-bold dark:text-gray-300"
              size={24}
            />
          </button>
          {isCalendarOpen && (
            <div className="absolute top-12 right-20 w-48 bg-white dark:bg-gray-700 rounded-md shadow-lg z-20 p-2">
              <p className="text-gray-800 dark:text-gray-200">
                Calendar feature coming soon!
              </p>
              <Link
                href="/attendance"
                className="block px-2 py-1 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                onClick={() => setIsCalendarOpen(false)}
              >
                Go to Attendance
              </Link>
            </div>
          )}

          <button
            className="glassmorphism p-1 rotate-45"
            onClick={handleNotificationToggle}
            title="Notifications"
          >
            <FiBell
              className="-rotate-45 text-[#999] font-bold dark:text-gray-300"
              size={24}
            />
          </button>
          {isNotificationOpen && (
            <div className="absolute top-12 right-0 w-48 bg-white dark:bg-gray-700 rounded-md shadow-lg z-20 p-2">
              <p className="text-gray-800 dark:text-gray-200">
                No new notifications
              </p>
            </div>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-end gap-3 focus:outline-none"
          >
            <div className="flex flex-col">
              <span className="font-bold text-[#333] dark:text-gray-200">
                {user?.firstName || user?.name || "Doe"} {user?.middleName || ""}
              </span>
              <span className="text-[#555] font-medium dark:text-gray-300">
                {user?.role?.[0] || "Guest"}
              </span>
            </div>
            <span className="bg-white p-1 rounded-md glassmorphism dark:bg-gray-600">
              {user?.photo ? (
                <img
                  src={`${BASE_URL}/${user.photo.replace(/\\/g, '/')}`}
                  alt="Profile"
                  className="w-[35px] h-[35px] rounded-full object-cover"
                  onError={(e) => (e.target.src = "/default-photo.jpg")}
                  key={user.photo} // Force re-render when photo changes
                />
              ) : (
                <FiUser size={35} className="text-[#999] font-bold dark:text-gray-300" />
              )}
            </span>
          </button>
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-20 dark:bg-gray-700">
              <Link
                href="/profile"
                className="block px-4 py-2 text-gray-800 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600"
              >
                Profile
              </Link>
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;