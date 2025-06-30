// components/DashboardHeader.tsx
"use client";

import { useAuth } from "../context/AuthContext";

export default function DashboardHeader() {
  const { user } = useAuth();

  function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

  return (
    <div className="flex flex-col items-center justify-center mb-10">
      <h1 className="md:text-3xl text-2xl font-bold dark:text-white text-gray-800 mb-2 text-center">
        {getGreeting()}, <span className="font-semibold">{user?.fullName || "Guest"}</span> 👋
      </h1>
    </div>
  );
}




