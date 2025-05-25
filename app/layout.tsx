
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "VAsA – Virtual Assistant’s Assistant",
  description: "Your command center for managing tasks, clients, and productivity.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <nav className="bg-gray-100 p-4 shadow flex gap-4 text-sm font-medium">
          <Link href="/">Home</Link>
          <Link href="/inbox">Inbox</Link>
          <Link href="/clients">Clients</Link>
          <Link href="/projects">Projects</Link>
          <Link href="/docs">Docs</Link>
          <Link href="/planner">Planner</Link>
          <Link href="/invoices">Invoices</Link>
          <Link href="/settings">Settings</Link>
          <Link href="/trash">Trash</Link>
        </nav>
        <main className="p-6">{children}</main>
      </body>
    </html>
  );
}

