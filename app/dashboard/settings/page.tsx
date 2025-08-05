"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import toast, { Toaster } from "react-hot-toast";
import { User } from "@/app/types";

export default function SettingsPage() {
  const [client, setClient] = useState<User | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const base = "https://vasabackend.onrender.com/api";

  // ✅ Load user safely from localStorage
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData || userData === "undefined" || userData === "null") return;
    try {
      const parsed: User = JSON.parse(userData);
      setClient(parsed);
    } catch (err) {
      console.error("Invalid stored user", err);
      localStorage.removeItem("user");
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setFile(e.target.files[0]);
  };

  const uploadImage = async () => {
    if (!file) return toast.error("Please select an image");

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch(`${base}/clients/upload-profile-image`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token || ""}` },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      setClient(data.client);
      localStorage.setItem("user", JSON.stringify(data.client));
      toast.success("Profile image updated!");
      console.log(client)
      setFile(null);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!client) return;
    setClient({ ...client, [e.target.name]: e.target.value });
  };

  const handleSaveChanges = async () => {
    if (!client) return;
    setLoading(true);

    try {
      const res = await fetch(`${base}/clients/update-profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token || ""}`,
        },
        body: JSON.stringify({
          fullName: client.fullName,
          businessName: client.businessName,
          phone: client.phone,
          timeZone: client.timeZone,
          businessType: client.businessType,
          services: client.services || [],
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");

      setClient(data.client);
      localStorage.setItem("user", JSON.stringify(data.client));
      toast.success("Profile updated!");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-4 space-y-6 text-gray-800 dark:text-gray-200">
      <Toaster />
      <h1 className="text-2xl font-bold text-center sm:text-left">Account Settings</h1>

      {/* Profile Image Section */}
      <div className="flex flex-col items-center sm:items-start space-y-4 w-full">
        <div className="relative w-28 h-28 rounded-full overflow-hidden border-2 border-gray-300 dark:border-gray-600">
          <Image
            src={
              client?.profileImage
                ? `${base.replace("/api", "")}${client.profileImage}`
                : "/default-avatar.png"
            }
            alt="Profile"
            fill
            className="object-cover"
          />
        </div>

        <label className="w-full sm:w-auto">
          <span className="sr-only">Choose profile image</span>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer 
                       bg-gray-50 dark:text-gray-400 dark:bg-gray-700 dark:border-gray-600 focus:outline-none"
          />
        </label>

        <button
          onClick={uploadImage}
          className="bg-blue-600 text-white px-4 py-2 rounded w-full sm:w-auto"
        >
          Upload Image
        </button>
      </div>

      {/* Editable User Info */}
      {client && (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow space-y-4 w-full">
          {[
            { label: "Full Name", name: "fullName" },
            { label: "Business Name", name: "businessName" },
            { label: "Phone", name: "phone" },
            { label: "Time Zone", name: "timeZone" },
            { label: "Business Type", name: "businessType" },
          ].map((field) => (
            <div key={field.name}>
              <label className="block text-sm font-semibold">{field.label}</label>
              <input
                name={field.name}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                value={(client as any)[field.name] || ""}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded mt-1 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
          ))}

          <div>
            <label className="block text-sm font-semibold">Services (comma-separated)</label>
            <input
              name="services"
              value={client.services?.join(", ") || ""}
              onChange={(e) =>
                setClient({
                  ...client,
                  services: e.target.value.split(",").map((s) => s.trim()),
                })
              }
              className="w-full px-3 py-2 border rounded mt-1 dark:bg-gray-700 dark:border-gray-600"
            />
          </div>

          <button
            onClick={handleSaveChanges}
            disabled={loading}
            className="bg-green-600 text-white px-4 py-2 rounded w-full sm:w-auto disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      )}
    </div>
  );
}
