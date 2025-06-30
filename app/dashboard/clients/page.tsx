"use client";
import { useState } from "react";
import { Plus, Trash2, Pencil } from "lucide-react";

const STATUSES = ["active", "paused", "prospect", "ex-client"] as const;
type Status = typeof STATUSES[number];

type Client = {
  id: string;
  name: string;
  email: string;
  status: Status;
  projects: string;
  preferences: string;
  billing: string;
};

const dummyClients: Client[] = [
  {
    id: "1",
    name: "Acme Corp",
    email: "client@acme.com",
    status: "active",
    projects: "Landing page redesign, CRM integration",
    preferences: "Weekly email, Zoom calls",
    billing: "Monthly, due on 1st",
  },
  {
    id: "2",
    name: "Beta LLC",
    email: "hello@beta.io",
    status: "prospect",
    projects: "Initial discovery phase",
    preferences: "Slack communication",
    billing: "Not yet defined",
  },
];

export default function ClientTracker() {
  const [clients, setClients] = useState<Client[]>(dummyClients);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Client, "id">>({
    name: "",
    email: "",
    status: "active",
    projects: "",
    preferences: "",
    billing: "",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    if (!form.name || !form.email) return;

    if (editingId) {
      setClients(
        clients.map((c) =>
          c.id === editingId ? { id: editingId, ...form } : c
        )
      );
    } else {
      setClients([{ id: crypto.randomUUID(), ...form }, ...clients]);
    }

    setForm({
      name: "",
      email: "",
      status: "active",
      projects: "",
      preferences: "",
      billing: "",
    });
    setEditingId(null);
    setShowModal(false);
  };

  const deleteClient = (id: string) => {
    setClients(clients.filter((c) => c.id !== id));
  };

  const editClient = (client: Client) => {
    setForm({
      name: client.name,
      email: client.email,
      status: client.status,
      projects: client.projects,
      preferences: client.preferences,
      billing: client.billing,
    });
    setEditingId(client.id);
    setShowModal(true);
  };

  return (
    <div className=" py-6 px-4 space-y-8 dark:bg-neutral-900">
      {/* Header */}
      <div className="flex flex-wrap gap-3 justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <h1 className="text-xl sm:text-3xl font-bold text-neutral-800 dark:text-neutral-100">
            👥 Client Tracker
          </h1>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-md shadow hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-400 transition"
        >
          <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Add Client</span>
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-center items-center p-4">
          <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-lg p-4 sm:p-6 w-full max-w-lg space-y-4">
            <h2 className="text-lg font-semibold text-neutral-800 dark:text-neutral-100">
              {editingId ? "Edit Client" : "New Client"}
            </h2>
            <div className="grid gap-3">
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Client name"
                className="border px-3 py-2 rounded w-full dark:bg-neutral-700 dark:border-neutral-600 dark:text-white"
              />
              <input
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Email"
                className="border px-3 py-2 rounded w-full dark:bg-neutral-700 dark:border-neutral-600 dark:text-white"
              />
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="border px-3 py-2 rounded w-full dark:bg-neutral-700 dark:border-neutral-600 dark:text-white"
              >
                {STATUSES.map((status) => (
                  <option key={status}>{status}</option>
                ))}
              </select>
              <textarea
                name="projects"
                value={form.projects}
                onChange={handleChange}
                placeholder="Project history..."
                className="border px-3 py-2 rounded w-full dark:bg-neutral-700 dark:border-neutral-600 dark:text-white"
              />
              <textarea
                name="preferences"
                value={form.preferences}
                onChange={handleChange}
                placeholder="Communication preferences..."
                className="border px-3 py-2 rounded w-full dark:bg-neutral-700 dark:border-neutral-600 dark:text-white"
              />
              <textarea
                name="billing"
                value={form.billing}
                onChange={handleChange}
                placeholder="Billing info..."
                className="border px-3 py-2 rounded w-full dark:bg-neutral-700 dark:border-neutral-600 dark:text-white"
              />
            </div>
            <div className="flex justify-end gap-2 flex-wrap">
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingId(null);
                }}
                className="px-4 py-2 border rounded text-gray-500 dark:text-gray-300 dark:border-neutral-600"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-400 transition"
              >
                {editingId ? "Update" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clients List */}
      <ul className="space-y-4">
        {clients.map((client) => (
          <li
            key={client.id}
            className="border rounded-lg p-4 shadow-sm bg-white dark:bg-neutral-800 dark:border-neutral-700 flex flex-col gap-2"
          >
            <div className="flex flex-wrap justify-between gap-2 items-center">
              <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-100">
                {client.name}
              </h3>
              <span
                className={`px-2 py-1 text-xs rounded font-medium capitalize ${
                  client.status === "active"
                    ? "bg-green-100 text-green-700 dark:bg-green-200/10 dark:text-green-300"
                    : client.status === "paused"
                    ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-200/10 dark:text-yellow-300"
                    : client.status === "prospect"
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-200/10 dark:text-blue-300"
                    : "bg-gray-100 text-gray-700 dark:bg-gray-200/10 dark:text-gray-300"
                }`}
              >
                {client.status}
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {client.email}
            </p>
            <p className="text-sm text-neutral-700 dark:text-neutral-300">
              📂 {client.projects}
            </p>
            <p className="text-sm text-neutral-700 dark:text-neutral-300">
              💬 {client.preferences}
            </p>
            <p className="text-sm text-neutral-700 dark:text-neutral-300">
              💳 {client.billing}
            </p>
            <div className="flex flex-wrap gap-4 mt-2">
              <button
                onClick={() => editClient(client)}
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm flex items-center gap-1"
              >
                <Pencil className="w-4 h-4" /> Edit
              </button>
              <button
                onClick={() => deleteClient(client.id)}
                className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 text-sm flex items-center gap-1"
              >
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
