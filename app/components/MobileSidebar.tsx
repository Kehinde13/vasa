"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { DarkModeToggle} from "./DarkmodeToggle";
import {
  FaHome,
  FaInbox,
  FaUsers,
  FaClipboardList,
  FaFileAlt,
  FaCalendarAlt,
  FaCreditCard,
  FaCog,
  FaTrash,
  FaToolbox,
  FaSignOutAlt,
} from "react-icons/fa";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileSidebar({ isOpen, onClose }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
    localStorage.removeItem("token");
    onClose();
    router.push("/auth/login");
  };

  const homeLinks = [
    { href: "/dashboard", label: "Home", icon: <FaHome /> },
    { href: "/dashboard/inbox", label: "Inbox", icon: <FaInbox /> },
  ];

  const toolLinks = [
    { href: "/dashboard/clients", label: "Clients", icon: <FaUsers /> },
    { href: "/dashboard/projects", label: "Projects", icon: <FaClipboardList /> },
    { href: "/dashboard/docs", label: "Docs", icon: <FaFileAlt /> },
    { href: "/dashboard/planner", label: "Planner", icon: <FaCalendarAlt /> },
    { href: "/dashboard/invoices", label: "Invoices", icon: <FaCreditCard /> },
  ];

  const settingsLinks = [
    { href: "/dashboard/settings", label: "Settings", icon: <FaCog /> },
    { href: "/dashboard/trash", label: "Trash", icon: <FaTrash /> },
  ];

  return (
    <aside
      className={`
        fixed top-0 left-0 h-screen w-64 bg-white dark:bg-gray-800 dark:text-white border-r shadow-lg z-50
        transform transition-transform flex flex-col justify-between
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
      `}
    >
      <div>
        <div className="p-6 flex justify-between items-center border-b">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center font-bold text-gray-700">
              {typeof user?.fullName === "string" && user.fullName.length > 0
                ? user.fullName[0].toUpperCase()
                : "U"}
            </div>
            <span className="text-base font-semibold">
              {user?.fullName || "User"}
            </span>
          </div>
          <button onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>
        <nav className="flex flex-col gap-4 p-4 text-sm">
          <div className="flex flex-col gap-1">
            {homeLinks.map(({ href, label, icon }) => (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className={`
                  flex items-center gap-2 px-3 py-2 rounded transition-colors
                  hover:bg-gray-200 dark:hover:bg-gray-700
                  ${pathname === href ? "bg-gray-300 dark:bg-gray-700 font-semibold" : ""}
                `}
              >
                {icon}
                {label}
              </Link>
            ))}
          </div>
          <div className="flex flex-col gap-1 mt-4">
            <div className="flex items-center gap-2 text-gray-500 font-semibold mb-1 text-xs uppercase tracking-wide">
              <FaToolbox />
              Toolkit
            </div>
            {toolLinks.map(({ href, label, icon }) => (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className={`
                  flex items-center gap-2 px-3 py-2 rounded transition-colors
                  hover:bg-gray-200 dark:hover:bg-gray-700
                  ${pathname === href ? "bg-gray-300 dark:bg-gray-700 font-semibold" : ""}
                `}
              >
                {icon}
                {label}
              </Link>
            ))}
          </div>
          <div className="flex flex-col gap-1 mt-4 border-t pt-4">
            {settingsLinks.map(({ href, label, icon }) => (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className={`
                  flex items-center gap-2 px-3 py-2 rounded transition-colors
                  hover:bg-gray-200 dark:hover:bg-gray-700
                  ${pathname === href ? "bg-gray-300 dark:bg-gray-700 font-semibold" : ""}
                `}
              >
                {icon}
                {label}
              </Link>
            ))}
          </div>
        </nav>
      </div>

      <div className="p-4 border-t">
        <DarkModeToggle />
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 text-left text-sm text-red-600 hover:underline"
        >
          <FaSignOutAlt />
          Logout
        </button>
      </div>
    </aside>
  );
}
