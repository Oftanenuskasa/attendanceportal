"use client";

import Header from './Header';
import Sidebar from './SideBar';
import { useState } from 'react';

const Layout = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(true);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <Header setIsMenuOpen={setIsMenuOpen} isMenuOpen={isMenuOpen} />

      {/* Main Content Area */}
      <div className="flex flex-1">
        <Sidebar isMenuOpen={isMenuOpen} />
        <div className={`flex-1 transition-all duration-300 ${isMenuOpen ? 'ml-64' : 'ml-16'}`}>
          <main className="min-h-[calc(100vh-8rem)] overflow-y-auto p-4">
            {children}
          </main>
        </div>
      </div>
      <footer className="bg-gray-800 text-white text-center p-4 mt-5">
        <p>&copy; {new Date().getFullYear()} Attendance Portal System. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Layout;