// components/DesktopSidebar.tsx
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

const links = [
  { href: "/dashboard/inbox", label: "📥 Inbox", color: "blue" },
  { href: "/dashboard/clients", label: "👥 Clients", color: "green" },
  { href: "/dashboard/projects", label: "📋 Projects", color: "yellow" },
  { href: "/dashboard/docs", label: "📄 Docs", color: "purple" },
  { href: "/dashboard/planner", label: "🗓️ Planner", color: "pink" },
  { href: "/dashboard/invoices", label: "💳 Invoices", color: "indigo" },
  { href: "/dashboard/settings", label: "⚙️ Settings", color: "gray" },
  { href: "/dashboard/trash", label: "🗑️ Trash", color: "red" },
];

export default function DesktopSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex fixed top-0 left-0 h-screen w-64 bg-white border-r shadow-lg flex-col z-30">
      <div className="p-6 text-xl font-bold border-b">VAsA</div>
      <nav className="flex flex-col gap-1 p-4 text-sm">
        {links.map(({ href, label, color }) => (
          <Link
            key={href}
            href={href}
            className={clsx(
              `px-3 py-2 rounded hover:bg-${color}-100`,
              pathname === href && `bg-${color}-100 font-semibold`
            )}
          >
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
