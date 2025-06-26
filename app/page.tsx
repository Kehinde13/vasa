import React from "react";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-purple-200">
      <div className="bg-white rounded-xl shadow-lg p-10 max-w-md w-full text-center">
        <h1 className="text-3xl font-bold mb-4 text-gray-800">
          VA&apos;sA
        </h1>
        <p className="mb-8 text-gray-600">
          Meet your smarter virtual assistant—designed to help you organize, automate, and achieve more every day!
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/auth/login">
            <p className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
              Login
            </p>
          </Link>
          <Link href="/auth/signup">
            <p className="px-6 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition">
              Sign Up
            </p>
          </Link>
        </div>
      </div>
    </main>
  );
}