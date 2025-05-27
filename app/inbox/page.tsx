"use client";
import { useState } from "react";
import { CheckCircle2, Circle, Trash2 } from "lucide-react";

type InboxItem = { id: string; content: string };
type TaskItem = { id: string; title: string; done: boolean };
type NoteItem = { id: string; content: string };

export default function InboxPage() {
  const [entries, setEntries] = useState<InboxItem[]>([]);
  const [input, setInput] = useState("");

  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [notes, setNotes] = useState<NoteItem[]>([]);

  const addEntry = () => {
    if (!input.trim()) return;
    setEntries([{ id: crypto.randomUUID(), content: input.trim() }, ...entries]);
    setInput("");
  };

  const deleteEntry = (id: string) => {
    setEntries(entries.filter(item => item.id !== id));
  };

  const convertEntry = (id: string, type: "task" | "note") => {
    const entry = entries.find(e => e.id === id);
    if (!entry) return;

    if (type === "task") {
      setTasks([{ id: crypto.randomUUID(), title: entry.content, done: false }, ...tasks]);
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

  return (
    <div className="max-w-5xl mx-auto py-10 space-y-10">
      {/* Inbox Input */}
      <section>
        <h1 className="text-2xl font-bold mb-4">📥 Inbox</h1>
        <div className="flex gap-4">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Capture a quick note..."
            className="flex-1 border rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={addEntry}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Add
          </button>
        </div>

        {/* Inbox Items */}
        <ul className="mt-6 space-y-4">
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
      </section>

      {/* Task Section */}
      <section>
        <h2 className="text-xl font-semibold mb-4">🧩 Todo Tasks</h2>
        {tasks.length === 0 ? (
          <p className="text-gray-400 text-sm">No tasks yet.</p>
        ) : (
          <ul className="space-y-3">
            {tasks.map((task) => (
              <li
                key={task.id}
                className="bg-gray-50 border px-4 py-3 rounded flex items-center justify-between"
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
                  <span className={`${task.done ? "line-through text-gray-400" : ""}`}>
                    {task.title}
                  </span>
                </div>
                <button onClick={() => deleteTask(task.id)} className="text-red-500 hover:text-red-700">
                  <Trash2 className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Notes Section */}
      <section>
        <h2 className="text-xl font-semibold mb-4">🗒 Sticky Notes</h2>
        {notes.length === 0 ? (
          <p className="text-gray-400 text-sm">No notes yet.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {notes.map((note, idx) => (
              <div
                key={note.id}
                className={`p-4 rounded shadow text-sm font-medium whitespace-pre-wrap break-words
                  ${
                    idx % 3 === 0
                      ? "bg-yellow-100"
                      : idx % 3 === 1
                      ? "bg-pink-100"
                      : "bg-green-100"
                  }
                `}
              >
                {note.content}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
