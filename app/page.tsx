export default function Home() {
  return (
    <section className="max-w-4xl mx-auto py-12 text-center space-y-6">
      <h1 className="text-3xl font-bold">Welcome to VAsA</h1>
      <p className="text-gray-600">
        Your personal productivity hub for managing clients, tasks, documents, and more.
      </p>
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-4 mt-10 text-sm">
        <a href="/inbox" className="bg-blue-100 p-4 rounded hover:bg-blue-200">Inbox</a>
        <a href="/clients" className="bg-green-100 p-4 rounded hover:bg-green-200">Clients</a>
        <a href="/projects" className="bg-yellow-100 p-4 rounded hover:bg-yellow-200">Projects</a>
        <a href="/docs" className="bg-purple-100 p-4 rounded hover:bg-purple-200">Docs</a>
        <a href="/planner" className="bg-pink-100 p-4 rounded hover:bg-pink-200">Planner</a>
        <a href="/invoices" className="bg-indigo-100 p-4 rounded hover:bg-indigo-200">Invoices</a>
        <a href="/settings" className="bg-gray-100 p-4 rounded hover:bg-gray-200">Settings</a>
        <a href="/trash" className="bg-red-100 p-4 rounded hover:bg-red-200">Trash</a>
      </div>
    </section>
  );
}
