"use client"

import { FiBell, FiMenu, FiSun, FiUser } from 'react-icons/fi';
import Link from 'next/link';
import { FaCalendarAlt } from 'react-icons/fa';
import atte2 from '@/Image/atte2.jpg';                                                                                                                      
import Image from 'next/image';

const Header = ({ setIsMenuOpen, isMenuOpen }) => { 
  return (
    <header className="fixed top-0 left-0 right-0 flex justify-between items-center py-4 px-6 bg-[#fff] shadow-md z-10">
      <div className="flex items-center">
        <Link href="/dashboard" className="flex items-center gap-3">
          
          <Image src={atte2} alt="attendance logo" height={40} />
          
        </Link>
        <button className="ml-28 glassmorphism p-1 rotate-45" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          <FiMenu className='-rotate-45 text-[#999] font-bold' size={24} />
        </button>
      </div>
      <div className="flex items-center gap-4">
        <div className='flex gap-4'>
          <button className="glassmorphism p-1 rotate-45">
            <FiSun className='-rotate-45 text-[#999] font-bold' size={24} />
          </button>
          <button className="glassmorphism p-1 rotate-45">
            <FaCalendarAlt className='-rotate-45 text-[#999] font-bold' size={24} />
          </button>
          <button className="glassmorphism p-1 rotate-45">
            <FiBell className='-rotate-45 text-[#999] font-bold' size={24} />
          </button>
        </div>
        <Link href="#" className="flex items-end gap-3">
          <div className='flex flex-col'>
            <span className="font-bold text-[#333]">John Doe</span>
            <span className="text-[#555] font-medium">Admin</span>
          </div>
          <span className="bg-white p-1 rounded-md glassmorphism">
            <FiUser size={35} className='text-[#999] font-bold'/>
          </span>
        </Link>
      </div>
    </header>
  );
};

export default Header;