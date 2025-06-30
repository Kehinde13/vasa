import Link from "next/link";
import DashboardHeader from "../components/DashboardHeader";
import { FaInbox, FaUsers, FaClipboardList } from "react-icons/fa";

export default function DashboardPage() {
  return (
    <>
      <DashboardHeader />

      {/* Recently Visited Panel */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold mb-4 dark:text-white">🕑 Recently Visited</h2>
        <div className="flex flex-col sm:flex-row gap-2">
          <VisitedLink href="/dashboard/inbox" icon={<FaInbox />} label="Inbox" />
          <VisitedLink href="/dashboard/clients" icon={<FaUsers />} label="Clients" />
          <VisitedLink href="/dashboard/projects" icon={<FaClipboardList />} label="Projects" />
        </div>
      </section>

      {/* Learn Panel */}
      <section>
        <h2 className="text-lg font-semibold mb-4 dark:text-white">🎓 Learn</h2>
        <div className="max-w-xl">
          <VideoCard
            title="Overview of VAsA"
            url="https://www.youtube.com/embed/ysz5S6PUM-U"
          />
        </div>
      </section>
    </>
  );
}

// 🧭 Visited Link component
function VisitedLink({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 flex-1 p-3 rounded-lg border bg-white dark:bg-gray-800 dark:border-gray-700 shadow hover:shadow-md hover:bg-gray-100 dark:hover:bg-gray-700 transition"
    >
      <span className="text-gray-600 dark:text-gray-300">{icon}</span>
      <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{label}</span>
    </Link>
  );
}

// 🎞️ Video Card component
function VideoCard({ title, url }: { title: string; url: string }) {
  return (
    <div className="rounded-lg overflow-hidden border bg-white dark:bg-gray-800 dark:border-gray-700 shadow hover:shadow-md transition">
      <iframe
        className="w-full h-64"
        src={url}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
      <div className="p-4 text-sm font-semibold dark:text-white">{title}</div>
    </div>
  );
}
