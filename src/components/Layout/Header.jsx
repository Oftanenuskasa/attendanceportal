"use client";

import { FiBell, FiMenu, FiSun, FiUser, FiLock } from 'react-icons/fi';
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
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const BASE_URL = "https://attendanceportal-3.onrender.com";

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

  const handleChangePasswordToggle = () => {
    setIsChangePasswordOpen((prev) => !prev);
    setError('');
    setSuccess('');
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleChangePasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setError('All fields are required');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError('New password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      const authData = JSON.parse(localStorage.getItem("auth-store") || "{}");
      const token = authData.token;

      if (!token) {
        setError('You are not logged in');
        setLoading(false);
        return;
      }

      const response = await fetch(`${BASE_URL}/api/employees/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to change password');
      }

      setSuccess('Password changed successfully. You will be logged out and redirected to login.');

      // Clear form fields
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

      // Log out and redirect to login page after a delay
      setTimeout(() => {
        localStorage.removeItem("auth-store"); // Log out by clearing auth data
        setUser(null); // Clear user state
        setIsChangePasswordOpen(false); // Close modal
        router.push("/login"); // Redirect to login page
      }, 2000);

    } catch (error) {
      setError(error.message || 'An error occurred while changing password');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("auth-store");
    setUser(null);
    router.push("/login");
  };

  // Rest of your component (render logic) remains unchanged
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
                  key={user.photo}
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
                onClick={handleChangePasswordToggle}
                className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600"
              >
                Change Password
              </button>
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

      {isChangePasswordOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center">
                <FiLock className="mr-2" /> Change Password
              </h2>
              <button 
                onClick={handleChangePasswordToggle}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
              >
                ✕
              </button>
            </div>
            
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4">
                {error}
              </div>
            )}
            
            {success && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded mb-4">
                {success}
              </div>
            )}
            
            <form onSubmit={handleChangePasswordSubmit}>
              <div className="mb-4">
                <label htmlFor="currentPassword" className="block text-gray-700 dark:text-gray-300 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  id="currentPassword"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="newPassword" className="block text-gray-700 dark:text-gray-300 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>
              
              <div className="mb-6">
                <label htmlFor="confirmPassword" className="block text-gray-700 dark:text-gray-300 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>
              
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleChangePasswordToggle}
                  className="px-4 py-2 mr-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? 'Processing...' : 'Change Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;