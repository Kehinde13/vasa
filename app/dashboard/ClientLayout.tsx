'use client';

import { useState, ReactNode } from 'react';
import DesktopSidebar from '@/app/components/DesktopSidebar';
import MobileSidebar from '@/app/components/MobileSidebar';
import { Menu } from 'lucide-react';

export default function ClientLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex">
      <MobileSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <DesktopSidebar />

      <div className="flex-1 flex flex-col md:ml-64">
        {/* Mobile Header */}
        <header className="sticky top-0 bg-white dark:bg-gray-800 dark:text-white border-b px-4 py-3 flex justify-between items-center md:hidden shadow-sm z-10">
          <span className="font-bold text-lg">VAsA</span>
          <button onClick={() => setSidebarOpen(true)}>
            <Menu className="w-6 h-6" />
          </button>
        </header>

        <main className="flex-1 md:p-6 px-2 py-6">{children}</main>
      </div>
    </div>
  );
}
