"use client";
import { useState } from "react";
import { Plus, ArrowLeft, Trash2, Pencil } from "lucide-react";
import { useRouter } from "next/navigation";

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
    billing: "Monthly, due on 1st"
  },
  {
    id: "2",
    name: "Beta LLC",
    email: "hello@beta.io",
    status: "prospect",
    projects: "Initial discovery phase",
    preferences: "Slack communication",
    billing: "Not yet defined"
  }
];

export default function ClientTracker() {
  const router = useRouter();
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    if (!form.name || !form.email) return;

    if (editingId) {
      setClients(clients.map(c => c.id === editingId ? { id: editingId, ...form } : c));
    } else {
      setClients([{ id: crypto.randomUUID(), ...form }, ...clients]);
    }

    setForm({ name: "", email: "", status: "active", projects: "", preferences: "", billing: "" });
    setEditingId(null);
    setShowModal(false);
  };

  const deleteClient = (id: string) => {
    setClients(clients.filter(c => c.id !== id));
  };

  const editClient = (client: Client) => {
    setForm({ name: client.name, email: client.email, status: client.status, projects: client.projects, preferences: client.preferences, billing: client.billing });
    setEditingId(client.id);
    setShowModal(true);
  };

  return (
    <div className="max-w-5xl mx-auto py-10 px-4 space-y-10">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="text-blue-600 hover:text-blue-800 flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <h1 className="text-3xl font-bold">👥 Client Tracker</h1>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" /> Add Client
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex justify-center items-center">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg">
            <h2 className="text-lg font-semibold mb-4">{editingId ? "Edit Client" : "New Client"}</h2>
            <div className="grid gap-4">
              <input name="name" value={form.name} onChange={handleChange} placeholder="Client name" className="border px-4 py-2 rounded w-full" />
              <input name="email" value={form.email} onChange={handleChange} placeholder="Email" className="border px-4 py-2 rounded w-full" />
              <select name="status" value={form.status} onChange={handleChange} className="border px-4 py-2 rounded w-full">
                {STATUSES.map(status => <option key={status}>{status}</option>)}
              </select>
              <textarea name="projects" value={form.projects} onChange={handleChange} placeholder="Project history..." className="border px-4 py-2 rounded w-full" />
              <textarea name="preferences" value={form.preferences} onChange={handleChange} placeholder="Communication preferences..." className="border px-4 py-2 rounded w-full" />
              <textarea name="billing" value={form.billing} onChange={handleChange} placeholder="Billing info..." className="border px-4 py-2 rounded w-full" />
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => { setShowModal(false); setEditingId(null); }} className="px-4 py-2 border rounded text-gray-500">Cancel</button>
              <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded">{editingId ? "Update" : "Save"}</button>
            </div>
          </div>
        </div>
      )}

      <ul className="space-y-4">
        {clients.map(client => (
          <li key={client.id} className="border rounded p-4 shadow flex flex-col gap-1 bg-white">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">{client.name}</h3>
              <span className={`px-2 py-1 text-xs rounded ${
                client.status === 'active' ? 'bg-green-100 text-green-700' :
                client.status === 'paused' ? 'bg-yellow-100 text-yellow-700' :
                client.status === 'prospect' ? 'bg-blue-100 text-blue-700' :
                'bg-gray-100 text-gray-700'}`}>{client.status}</span>
            </div>
            <p className="text-sm text-gray-500">{client.email}</p>
            <p className="text-sm">📂 {client.projects}</p>
            <p className="text-sm">💬 {client.preferences}</p>
            <p className="text-sm">💳 {client.billing}</p>
            <div className="flex gap-4 mt-2">
              <button onClick={() => editClient(client)} className="text-blue-500 hover:text-blue-700 text-sm flex items-center gap-1">
                <Pencil className="w-4 h-4" /> Edit
              </button>
              <button onClick={() => deleteClient(client.id)} className="text-red-500 hover:text-red-700 text-sm flex items-center gap-1">
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}