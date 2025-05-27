"use client";
import { useState } from "react";
import DesktopSidebar from "@/app/components/DesktopSidebar";
import MobileSidebar from "@/app/components/MobileSidebar";
import { Menu } from "lucide-react";

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex">
      <MobileSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <DesktopSidebar />

      <div className="flex-1 flex flex-col md:ml-64">
        {/* Mobile Header */}
        <header className="bg-white border-b px-4 py-3 flex justify-between items-center md:hidden shadow-sm">
          <span className="font-bold text-lg">VAsA</span>
          <button onClick={() => setSidebarOpen(true)}>
            <Menu className="w-6 h-6" />
          </button>
        </header>

        {/* Main Dashboard */}
        <main className="flex-1 p-6">
          <h1 className="text-2xl font-bold mb-6">📊 Dashboard</h1>
          <p className="text-gray-600 text-base mb-6">Welcome, <span className="font-semibold">Folaji</span> 👋</p>

          {/* Widgets */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <Widget title="📌 Today’s Tasks" value="3 pending" />
            <Widget title="📥 Unread Messages" value="5 new" />
            <Widget title="🧾 Overdue Invoices" value="2 unpaid" />
            <Widget title="👥 Recent Clients Activities" value="" />
          </section>

          {/* Demo Video Panel */}
          <section>
            <h2 className="text-lg font-semibold mb-4">🎥 Getting Started</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <VideoCard
                title="Overview of VAsA"
                url="https://www.youtube.com/embed/ysz5S6PUM-U"
              />
              <VideoCard
                title="Managing Clients"
                url="https://www.youtube.com/embed/ysz5S6PUM-U"
              />
              <VideoCard
                title="Tracking Tasks & Invoices"
                url="https://www.youtube.com/embed/ysz5S6PUM-U"
              />
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

// 🧩 Reusable Widget Card
function Widget({ title, value }: { title: string; value: string }) {
  return (
    <div className="p-5 rounded-lg border bg-white shadow hover:shadow-md transition">
      <h3 className="text-sm text-gray-600 mb-2">{title}</h3>
      <p className="text-xl font-bold">{value}</p>
    </div>
  );
}

// 🎞️ Reusable Video Card
function VideoCard({ title, url }: { title: string; url: string }) {
  return (
    <div className="rounded-lg overflow-hidden border bg-white shadow hover:shadow-md transition">
      <iframe
        className="w-full h-48"
        src={url}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
      <div className="p-4 text-sm font-semibold">{title}</div>
    </div>
  );
}
