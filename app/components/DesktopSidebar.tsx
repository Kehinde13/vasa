// /src/components/DesktopSidebar.tsx
import Link from "next/link";

export default function DesktopSidebar() {
  return (
    <aside className="hidden md:flex fixed top-0 left-0 h-screen w-64 bg-white border-r shadow-lg flex-col z-30">
      <div className="p-6 text-xl font-bold border-b">VAsA</div>
      <nav className="flex flex-col gap-1 p-4 text-sm">
        <Link href="/inbox" className="hover:bg-blue-100 px-3 py-2 rounded">📥 Inbox</Link>
        <Link href="/clients" className="hover:bg-green-100 px-3 py-2 rounded">👥 Clients</Link>
        <Link href="/projects" className="hover:bg-yellow-100 px-3 py-2 rounded">📋 Projects</Link>
        <Link href="/docs" className="hover:bg-purple-100 px-3 py-2 rounded">📄 Docs</Link>
        <Link href="/planner" className="hover:bg-pink-100 px-3 py-2 rounded">🗓️ Planner</Link>
        <Link href="/invoices" className="hover:bg-indigo-100 px-3 py-2 rounded">💳 Invoices</Link>
        <Link href="/settings" className="hover:bg-gray-100 px-3 py-2 rounded">⚙️ Settings</Link>
        <Link href="/trash" className="hover:bg-red-100 px-3 py-2 rounded">🗑️ Trash</Link>
      </nav>
    </aside>
  );
}
