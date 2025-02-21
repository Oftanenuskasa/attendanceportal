"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MENU_ITEMS } from "@/config/menuItems";
import { FaChevronDown, FaChevronRight } from "react-icons/fa";

const Sidebar = ({ isMenuOpen }) => {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState([]);

  const toggleExpand = (itemId) => {
    setExpandedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  const isActive = (href) => pathname === href;

  const renderMenuItem = (item) => {
    const hasSubItems = item.subItems && item.subItems.length > 0;
    const isExpanded = expandedItems.includes(item.id);
    const isItemActive =
      isActive(item.href) ||
      item.subItems?.some((subItem) => isActive(subItem.href));

    return (
      <div key={item.id}>
        <div
          className={`
            flex items-center justify-between py-1 cursor-pointer font-bold
            ${isItemActive ? "bg-navy-700 text-[#1672EE]" : "text-[#555] hover:text-[#1672EE]"}
            rounded-lg transition-colors duration-150
          `}
          onClick={() => (hasSubItems ? toggleExpand(item.id) : null)}
        >
          <Link
            href={item.href}
            className="flex items-center flex-1 gap-3"
            onClick={(e) => hasSubItems && e.preventDefault()}
          >
            <span className="glassmorphism p-2 rounded-md text-[#1672EE]">
              <item.icon size={25} />
            </span>
            {isMenuOpen && <span className="text-sm">{item.label}</span>}
          </Link>
          {isMenuOpen && hasSubItems && (
            isExpanded ? (
              <FaChevronDown className="w-3 h-3" />
            ) : (
              <FaChevronRight className="w-3 h-3" />
            )
          )}
        </div>

        {isMenuOpen && hasSubItems && isExpanded && (
          <div className="ml-8 mt-1 space-y-1">
            <div className="max-h-60 overflow-y-auto">
              {item.subItems.map((subItem) => (
                <Link
                  key={subItem.id}
                  href={subItem.href}
                  className={`
                    flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-bold
                    ${isActive(subItem.href)
                      ? "bg-navy-700 text-[#1672EE]"
                      : "text-[#555] hover:text-[#1672EE]"}
                  `}
                >
                  {/* Render sub-item icon */}
                  {subItem.icon && (
                    <span className="text-[#1672EE]">
                      <subItem.icon size={18} />
                    </span>
                  )}
                  <span>{subItem.label}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <aside
      className={`h-screen bg-[#fff] text-[#555] flex flex-col fixed left-0 top-20 transition-all duration-300 ${
        isMenuOpen ? "w-64" : "w-16"
      }`}
    >
      <nav className="flex-1 p-2 space-y-2 overflow-y-auto">
        {MENU_ITEMS.map((menu) => renderMenuItem(menu))}
      </nav>
    </aside>
  );
};

export default Sidebar;
