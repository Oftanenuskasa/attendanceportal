import {
  FiGrid,
  FiDollarSign,
  FiClock,
  FiPackage,
  FiSettings,
  FiList,
  FiUserPlus,
  FiDownload,
  FiCamera,
  FiEye,
  FiUserCheck,
} from "react-icons/fi";
import {
  FaSchool,
  FaRegPlusSquare,
  FaUser,
  FaUsers,
  FaCalendarCheck,
  FaQrcode,
} from "react-icons/fa";

export const MENU_ITEMS = [
  {
    id: "dashboard",
    icon: FiGrid,
    label: "Dashboard",
    href: "/dashboard",
    roles: "",
  },
  {
    id: "employee",
    icon: FaUsers,
    label: "Employee",
    href: "/employee",
    roles: "",
    subItems: [
      {
        id: "employee_List",
        icon: FiList,
        label: "Employee List",
        href: "/employee",
        roles: "",
      },
      {
        id: "addEmployee",
        icon: FiUserPlus,
        label: "Add Employee",
        href: "/employee/addemployee",
        roles: "",
      },
    ],
  },
  {
    id: "attendance",
    icon: FaCalendarCheck,
    label: "Attendance",
    href: "/attendance",
    roles: "",
    subItems: [
      {
        id: "mark",
        icon: FiUserCheck,   
        label: "Mark Attendance",
        href: "/attendance",
        roles: "",
      },
      {
        id: "list",
        icon: FiList,
        label: "Attendance List",
        href: "/attendance/list",
        roles: "",
      },
      {
        id: "view",
        icon: FiEye,
        label: "View Attendance",
        href: "/attendance/view",
        roles: "",
      },
    ],
  },
  {
    id: "setting",
    icon: FiSettings,
    label: "Settings",
    href: "/setting",
    roles: "",
    subItems: [
      {
        id: "system",
        label: "System Setting",
        href: "/setting/system",
        roles: "",
      },
      {
        id: "about",
        label: "About",
        href: "/setting/about",
        roles: "",
      },
      {
        id: "contact",
        label: "Contact",
        href: "/setting/contact",
        roles: "",
      },
    ],
  },
];
