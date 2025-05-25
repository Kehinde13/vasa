import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="bg-gray-100 p-4 shadow">
      <ul className="flex gap-4">
        <li><Link href="/">Home</Link></li>
        <li><a href="/inbox">Inbox</a></li>
        <li><a href="/clients">Clients</a></li>
        <li><a href="/projects">Projects</a></li>
        <li><a href="/docs">Docs</a></li>
        <li><a href="/planner">Planner</a></li>
        <li><a href="/invoices">Invoices</a></li>
        <li><a href="/settings">Settings</a></li>
        <li><a href="/trash">Trash</a></li>
      </ul>
    </nav>
  );
}