// config/MenuItems.js
import {
  FiGrid,
  FiSettings,
  FiList,
  FiUserPlus,
  FiEye,
  FiUserCheck,
} from "react-icons/fi";
import { FaUsers, FaCalendarCheck } from "react-icons/fa";

export const MENU_ITEMS = [
  {
    id: "dashboard",
    icon: FiGrid,
    label: "Dashboard",
    href: "/dashboard",
    roles: "", // Accessible to all
  },
  {
    id: "employee",
    icon: FaUsers,
    label: "Employee",
    href: "/employee",
    roles: "ADMIN", // Only admins
    subItems: [
      {
        id: "employee_List",
        icon: FiList,
        label: "Employee List",
        href: "/employee",
        roles: "ADMIN",
      },
      {
        id: "addEmployee",
        icon: FiUserPlus,
        label: "Add Employee",
        href: "/employee/addemployee",
        roles: "ADMIN",
      },
    ],
  },
  {
    id: "attendance",
    icon: FaCalendarCheck,
    label: "Attendance",
    href: "/attendance",
    roles: "", // Accessible to all
    subItems: [
      {
        id: "mark",
        icon: FiUserCheck,
        label: "Mark Attendance",
        href: "/attendance",
        roles: "", // Accessible to all
      },
      {
        id: "list",
        icon: FiList,
        label: "Attendance List",
        href: "/attendance/list",
        roles: "ADMIN", // Only admins
      },
      {
        id: "view",
        icon: FiEye,
        label: "View Attendance",
        href: "/attendance/view",
        roles: "", // Accessible to all
      },
    ],
  },
  {
    id: "setting",
    icon: FiSettings,
    label: "Settings",
    href: "/setting",
    roles: "ADMIN", // Only admins
    subItems: [
      {
        id: "system",
        label: "System Setting",
        href: "/setting/system",
        roles: "ADMIN",
      },
      {
        id: "about",
        label: "About",
        href: "/setting/about",
        roles: "ADMIN",
      },
      {
        id: "contact",
        label: "Contact",
        href: "/setting/contact",
        roles: "ADMIN",
      },
    ],
  },
];