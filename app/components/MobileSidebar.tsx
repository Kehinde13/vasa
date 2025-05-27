// /src/components/MobileSidebar.tsx
import Link from "next/link";
import { X } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileSidebar({ isOpen, onClose }: Props) {
  return (
    <aside
      className={`
        fixed top-0 left-0 h-screen w-64 bg-white border-r shadow-lg z-50 transform transition-transform
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
      `}
    >
      <div className="p-6 text-xl font-bold border-b flex justify-between items-center">
        <span>VAsA</span>
        <button onClick={onClose}>
          <X className="w-5 h-5" />
        </button>
      </div>
      <nav className="flex flex-col gap-1 p-4 text-sm">
        <Link href="/inbox" className="hover:bg-blue-100 px-3 py-2 rounded" onClick={onClose}>📥 Inbox</Link>
        <Link href="/clients" className="hover:bg-green-100 px-3 py-2 rounded" onClick={onClose}>👥 Clients</Link>
        <Link href="/projects" className="hover:bg-yellow-100 px-3 py-2 rounded" onClick={onClose}>📋 Projects</Link>
        <Link href="/docs" className="hover:bg-purple-100 px-3 py-2 rounded" onClick={onClose}>📄 Docs</Link>
        <Link href="/planner" className="hover:bg-pink-100 px-3 py-2 rounded" onClick={onClose}>🗓️ Planner</Link>
        <Link href="/invoices" className="hover:bg-indigo-100 px-3 py-2 rounded" onClick={onClose}>💳 Invoices</Link>
        <Link href="/settings" className="hover:bg-gray-100 px-3 py-2 rounded" onClick={onClose}>⚙️ Settings</Link>
        <Link href="/trash" className="hover:bg-red-100 px-3 py-2 rounded" onClick={onClose}>🗑️ Trash</Link>
      </nav>
    </aside>
  );
}
