"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import clsx from "clsx";
import { useAuth } from "../context/AuthContext";
import Image from "next/image";
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
import { DarkModeToggle } from "./DarkmodeToggle";

export default function DesktopSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user } = useAuth();

  const base = "https://vasabackend.onrender.com"; // for profile image
  const profileImageUrl = user?.profileImage ? `${base}${user.profileImage}` : null;

  const handleLogout = () => {
    logout();
    localStorage.removeItem("token");
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
    <aside className="hidden md:flex fixed top-0 left-0 h-screen w-64 dark:bg-gray-800 dark:text-white bg-[#F0F0F0] shadow-lg flex-col justify-between z-30">
      <div>
        {/* User Info */}
        <div className="p-6 flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-lg font-bold text-gray-700">
            {profileImageUrl ? (
              <Image
                src={profileImageUrl}
                alt={user?.fullName || "User"}
                width={40}
                height={40}
                className="object-cover w-full h-full"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = "none";
                  target.parentElement!.innerHTML = `${
                    typeof user?.fullName === "string" && user.fullName.length > 0
                      ? user.fullName[0].toUpperCase()
                      : "U"
                  }`;
                }}
              />
            ) : (
              <>
                {typeof user?.fullName === "string" && user.fullName.length > 0
                  ? user.fullName[0].toUpperCase()
                  : "U"}
              </>
            )}
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-base">
              {user?.fullName || "User"}
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-4 p-4 text-sm">
          <div className="flex flex-col gap-1">
            {homeLinks.map(({ href, label, icon }) => (
              <Link
                key={href}
                href={href}
                className={clsx(
                  "flex items-center gap-2 px-3 py-2 rounded dark:hover:bg-gray-700 hover:bg-[#D8D8D8] transition-colors",
                  pathname === href && "bg-gray-300 dark:bg-gray-700 font-semibold"
                )}
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
                className={clsx(
                  "flex items-center gap-2 px-3 py-2 rounded dark:hover:bg-gray-700 hover:bg-[#D8D8D8] transition-colors",
                  pathname === href && "bg-gray-300 dark:bg-gray-700 font-semibold"
                )}
              >
                {icon}
                {label}
              </Link>
            ))}
          </div>
        </nav>
      </div>

      {/* Footer */}
      <div className="p-4 flex flex-col gap-1">
        {settingsLinks.map(({ href, label, icon }) => (
          <Link
            key={href}
            href={href}
            className={clsx(
              "flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors",
              pathname === href && "bg-gray-300 dark:bg-gray-700 font-semibold"
            )}
          >
            {icon}
            {label}
          </Link>
        ))}
        <DarkModeToggle />
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 text-left text-sm text-red-600 hover:underline mt-2"
        >
          <FaSignOutAlt />
          Logout
        </button>
      </div>
    </aside>
  );
}
