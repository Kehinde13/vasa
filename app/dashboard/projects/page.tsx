"use client";
import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Plus, Trash2, Pencil } from "lucide-react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";

const STATUSES = ["To Do", "In Progress", "On Hold", "Done"] as const;
type Status = (typeof STATUSES)[number];
type Priority = "Low" | "Medium" | "High";

interface Task {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  priority: Priority;
  status: Status;
  client: string; // client _id
  clientName: string; // ✅ actual name for display
  subtasks: string[];
}

interface Client {
  _id: string;
  name: string;
}

export default function ProjectBoard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [form, setForm] = useState<Omit<Task, "id">>({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    priority: "Low",
    status: "To Do",
    client: "",
    subtasks: [],
    clientName: "",
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : undefined;
  const base = "https://vasabackend.onrender.com/api";
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  useEffect(() => {
    const load = async () => {
      setFetching(true);
      try {
        const [tRes, cRes] = await Promise.all([
          fetch(`${base}/projects`, { headers }),
          fetch(`${base}/va-clients`, { headers }),
        ]);
        if (!tRes.ok || !cRes.ok) throw Error("Load failed");
        const [tData, cData] = await Promise.all([tRes.json(), cRes.json()]);
        setClients(cData);
        setTasks(
          tData.map((p) => ({
            id: p._id,
            title: p.title,
            description: p.description,
            startDate: p.createdAt?.slice(0, 10),
            endDate: p.dueDate?.slice(0, 10) || "",
            priority: p.priority,
            status: p.status,
            client: p.client?._id || "",
            clientName: p.client?.name || "",
            subtasks: p.tags || [],
          }))
        );
      } catch (e: any) {
        toast.error(e.message);
      } finally {
        setFetching(false);
      }
    };
    load();
  }, []);

  const filtered = tasks
    .filter((t) => !filterStatus || t.status === filterStatus)
    .filter((t) => !filterPriority || t.priority === filterPriority);

  const onDragEnd = async (res: DropResult) => {
    if (!res.destination) return;
    const moved = tasks.find((t) => t.id === res.draggableId);
    if (!moved) return;
    const newStatus = res.destination.droppableId as Status;

    try {
      const res = await fetch(`${base}/projects/${moved.id}/status`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      setTasks((prev) =>
        prev.map((t) => (t.id === moved.id ? { ...t, status: newStatus } : t))
      );
      toast.success("Status updated");
    } catch {
      toast.error("Status update failed");
    }
  };

  const handleSave = async () => {
    if (!form.title || !form.client)
      return toast.error("Title & client required");
    setLoading(true);
    try {
      const method = editingId ? "PUT" : "POST";
      const url = editingId
        ? `${base}/projects/${editingId}`
        : `${base}/projects`;
      const body = {
        title: form.title,
        description: form.description,
        dueDate: form.endDate,
        priority: form.priority,
        status: form.status,
        tags: form.subtasks,
        client: form.client,
      };
      await fetch(url, { method, headers, body: JSON.stringify(body) });
      toast.success(editingId ? "Task updated" : "Task created");

      const res = await fetch(`${base}/projects`, { headers });
      const tData = await res.json();
      setTasks(
        tData.map((p) => ({
          id: p._id,
          title: p.title,
          description: p.description,
          startDate: p.createdAt?.slice(0, 10),
          endDate: p.dueDate?.slice(0, 10) || "",
          priority: p.priority,
          status: p.status,
          client: p.client?._id || "",
          subtasks: p.tags || [],
        }))
      );
      setShowForm(false);
      setEditingId(null);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete task?")) return;
    try {
      await fetch(`${base}/projects/${id}`, { method: "DELETE", headers });
      setTasks((prev) => prev.filter((t) => t.id !== id));
      toast.success("Deleted");
    } catch {
      toast.error("Delete failed");
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold dark:text-white">Project Board</h1>

      <div className="flex flex-wrap gap-3 items-center">
        <select
          className="border rounded p-2 dark:bg-gray-800 dark:text-white"
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="">All Status</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          className="border rounded p-2 dark:bg-gray-800 dark:text-white"
          onChange={(e) => setFilterPriority(e.target.value)}
        >
          <option value="">All Priority</option>
          {["Low", "Medium", "High"].map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        <button
          className="ml-auto bg-blue-600 text-white px-4 py-2 rounded flex items-center"
          onClick={() => {
            setForm({
              title: "",
              description: "",
              startDate: "",
              endDate: "",
              priority: "Low",
              status: "To Do",
              client: "",
              subtasks: [],
              clientName: "",
            });
            setEditingId(null);
            setShowForm(true);
          }}
        >
          <Plus className="w-4 h-4 mr-1" /> New Task
        </button>
      </div>

      {fetching ? (
        <p className="text-gray-600 dark:text-gray-400">Loading...</p>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
            {STATUSES.map((status) => (
              <Droppable key={status} droppableId={status}>
                {(provided) => (
                  <div
                    className="bg-gray-100 dark:bg-gray-800 p-4 rounded"
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                  >
                    <h2 className="font-semibold dark:text-white">{status}</h2>
                    {filtered
                      .filter((t) => t.status === status)
                      .map((t, i) => (
                        <Draggable key={t.id} draggableId={t.id} index={i}>
                          {(p2) => (
                            <div
                              ref={p2.innerRef}
                              {...p2.draggableProps}
                              {...p2.dragHandleProps}
                              className="bg-white dark:bg-gray-900 p-4 mb-2 rounded shadow"
                            >
                              <div className="flex justify-between items-start mb-1">
                                <span className="font-semibold dark:text-white">
                                  {t.title}
                                </span>
                                <span className="text-xs px-2 py-1 border rounded">
                                  {t.priority}
                                </span>
                              </div>
                              {t.description && (
                                <p className="text-xs text-gray-500 mb-2">
                                  {t.description}
                                </p>
                              )}
                              {t.endDate && (
                                <div className="text-xs text-gray-500 mb-2">
                                  📅 Due: {t.endDate}
                                </div>
                              )}
                              {t.subtasks?.length > 0 && (
                                <div className="text-xs text-gray-600 mb-2">
                                  📌 Subtasks:
                                  <ul className="list-disc pl-4">
                                    {t.subtasks.map((sub, i) => (
                                      <li key={i}>{sub}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              <div className="text-xs text-gray-500 mb-2">
                                👤 Client: {t.clientName}
                              </div>
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => {
                                    setEditingId(t.id);
                                    setForm({
                                      title: t.title,
                                      description: t.description,
                                      startDate: t.startDate,
                                      endDate: t.endDate,
                                      priority: t.priority,
                                      status: t.status,
                                      client: t.client, // ✅ just the client _id
                                      clientName: t.clientName, // ✅ for display only
                                      subtasks: t.subtasks,
                                    });
                                    setShowForm(true);
                                  }}
                                >
                                  <Pencil className="w-4 h-4 text-blue-500" />
                                </button>
                                <button onClick={() => handleDelete(t.id)}>
                                  <Trash2 className="w-4 h-4 text-red-500" />
                                </button>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            ))}
          </div>
        </DragDropContext>
      )}

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/30 flex justify-center items-center px-4 py-6 sm:p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg w-full max-w-md space-y-4 shadow-lg">
            <h2 className="text-xl font-semibold dark:text-white">
              {editingId ? "Edit Task" : "New Task"}
            </h2>
            <input
              value={form.title}
              onChange={(e) =>
                setForm((f) => ({ ...f, title: e.target.value }))
              }
              placeholder="Title"
              className="w-full border p-2 rounded dark:bg-gray-800 dark:text-white"
            />
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              placeholder="Description"
              className="w-full border p-2 rounded dark:bg-gray-800 dark:text-white"
            />
            <div className="flex gap-2">
              <input
                type="date"
                value={form.startDate}
                onChange={(e) =>
                  setForm((f) => ({ ...f, startDate: e.target.value }))
                }
                className="flex-1 border p-2 rounded dark:bg-gray-800 dark:text-white"
              />
              <input
                type="date"
                value={form.endDate}
                onChange={(e) =>
                  setForm((f) => ({ ...f, endDate: e.target.value }))
                }
                className="flex-1 border p-2 rounded dark:bg-gray-800 dark:text-white"
              />
            </div>
            <select
              value={form.client}
              onChange={(e) =>
                setForm((f) => ({ ...f, client: e.target.value }))
              }
              className="w-full border p-2 rounded dark:bg-gray-800 dark:text-white"
            >
              <option value="">Select Client</option>
              {clients.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
            <div className="flex gap-2">
              <select
                value={form.priority}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    priority: e.target.value as Priority,
                  }))
                }
                className="flex-1 border p-2 rounded dark:bg-gray-800 dark:text-white"
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
              <select
                value={form.status}
                onChange={(e) =>
                  setForm((f) => ({ ...f, status: e.target.value as Status }))
                }
                className="flex-1 border p-2 rounded dark:bg-gray-800 dark:text-white"
              >
                {STATUSES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium dark:text-white">
                Tags/Subtasks
              </label>
              {form.subtasks.map((sub, i) => (
                <input
                  key={i}
                  value={sub}
                  onChange={(e) => {
                    const arr = [...form.subtasks];
                    arr[i] = e.target.value;
                    setForm((f) => ({ ...f, subtasks: arr }));
                  }}
                  className="w-full border p-2 rounded dark:bg-gray-800 dark:text-white mb-1"
                />
              ))}
              <button
                type="button"
                className="text-sm text-blue-600"
                onClick={() =>
                  setForm((f) => ({ ...f, subtasks: [...f.subtasks, ""] }))
                }
              >
                + Add tag
              </button>
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowForm(false)} className="px-4 py-2">
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                {loading ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
