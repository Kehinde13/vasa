"use client";
import { useState } from "react";
import { CheckCircle2, Circle, Trash2, Plus, StickyNote, X, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

const PRIORITY_COLORS = {
  High: "bg-red-100 text-red-700",
  Medium: "bg-yellow-100 text-yellow-700",
  Low: "bg-green-100 text-green-700",
};

type InboxItem = { id: string; content: string };
type TaskItem = { id: string; title: string; done: boolean; priority: "High" | "Medium" | "Low" };
type NoteItem = { id: string; content: string };

export default function InboxPage() {
  const router = useRouter();
  const [entries, setEntries] = useState<InboxItem[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [input, setInput] = useState("");

  const addEntry = () => {
    if (!input.trim()) return;
    setEntries([{ id: crypto.randomUUID(), content: input.trim() }, ...entries]);
    setInput("");
    setShowModal(false);
  };

  const deleteEntry = (id: string) => {
    setEntries(entries.filter(item => item.id !== id));
  };

  const convertEntry = (id: string, type: "task" | "note") => {
    const entry = entries.find(e => e.id === id);
    if (!entry) return;

    if (type === "task") {
      const priority = prompt("Set priority (High, Medium, Low):", "Medium") as
        | "High"
        | "Medium"
        | "Low";
      setTasks([{ id: crypto.randomUUID(), title: entry.content, done: false, priority }, ...tasks]);
    } else if (type === "note") {
      setNotes([{ id: crypto.randomUUID(), content: entry.content }, ...notes]);
    }

    deleteEntry(id);
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => (t.id === id ? { ...t, done: !t.done } : t)));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const deleteNote = (id: string) => {
    setNotes(notes.filter(n => n.id !== id));
  };

  return (
    <div className="max-w-6xl mx-auto py-10 px-4 space-y-10">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <h1 className="text-3xl font-bold">📥 Inbox</h1>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" /> Add Entry
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex justify-center items-center">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">New Inbox Entry</h2>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Capture a quick note..."
              className="w-full border rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 border rounded text-gray-500">
                Cancel
              </button>
              <button onClick={addEntry} className="px-4 py-2 bg-blue-600 text-white rounded">
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inbox List */}
      <ul className="space-y-4">
        {entries.map((item) => (
          <li
            key={item.id}
            className="bg-white border p-4 rounded shadow flex justify-between items-start gap-4"
          >
            <p className="text-sm text-gray-700 flex-1">{item.content}</p>
            <div className="flex flex-col gap-1 text-sm">
              <button
                onClick={() => convertEntry(item.id, "task")}
                className="text-blue-500 hover:underline"
              >
                ➕ Task
              </button>
              <button
                onClick={() => convertEntry(item.id, "note")}
                className="text-green-600 hover:underline"
              >
                📝 Note
              </button>
              <button
                onClick={() => deleteEntry(item.id)}
                className="text-red-500 hover:underline"
              >
                🗑 Delete
              </button>
            </div>
          </li>
        ))}
      </ul>

      {/* Tasks Section */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">🧩 Tasks</h2>
        <ul className="space-y-3">
          {tasks.map((task) => (
            <li
              key={task.id}
              className={`border px-4 py-3 rounded flex items-center justify-between shadow-sm ${PRIORITY_COLORS[task.priority]}`}
            >
              <div
                onClick={() => toggleTask(task.id)}
                className="flex items-center gap-2 cursor-pointer"
              >
                {task.done ? (
                  <CheckCircle2 className="text-green-600 w-5 h-5" />
                ) : (
                  <Circle className="text-gray-400 w-5 h-5" />
                )}
                <span className={`${task.done ? "line-through text-gray-400" : ""}`}>{task.title}</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="px-2 py-1 rounded bg-white border font-semibold">{task.priority}</span>
                <button onClick={() => deleteTask(task.id)} className="text-red-500 hover:text-red-700">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Sticky Notes Section */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">🗒 Sticky Notes</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {notes.map((note) => (
            <div
              key={note.id}
              className="relative p-4 rounded-lg shadow-md min-h-[120px] text-sm font-medium break-words border-l-4 border-yellow-400 bg-yellow-50 before:absolute before:top-0 before:right-0 before:w-5 before:h-5 before:bg-yellow-300 before:rounded-bl-lg"
            >
              <StickyNote className="absolute top-2 right-6 text-yellow-400 w-4 h-4" />
              <button
                onClick={() => deleteNote(note.id)}
                className="absolute top-2 right-2 text-red-500 hover:text-red-700"
              >
                <X className="w-4 h-4" />
              </button>
              {note.content}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
