"use client";

import { useState } from "react";
import { Plus, Trash2, Pencil } from "lucide-react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";

const STATUSES = ["To Do", "In Progress", "Done", "On Hold"] as const;
type Status = typeof STATUSES[number];

type Task = {
  id: string;
  title: string;
  description: string;
  startDate: string; // NEW
  endDate: string;   // NEW
  priority: "Low" | "Medium" | "High";
  status: Status;
  client: string;
  subtasks: string[];
};

const dummyTasks: Task[] = [
  {
    id: "1",
    title: "Design Landing Page",
    description: "Create mockups for homepage",
    startDate: "2025-06-01",
    endDate: "2025-06-05",
    priority: "High",
    status: "To Do",
    client: "Acme Corp",
    subtasks: ["Header", "Hero Section", "Footer"]
  },
  {
    id: "2",
    title: "Setup Analytics",
    description: "Integrate Google Analytics",
    startDate: "2025-06-03",
    endDate: "2025-06-07",
    priority: "Medium",
    status: "In Progress",
    client: "Beta LLC",
    subtasks: ["Add GA ID", "Confirm data stream"]
  }
];

export default function ProjectBoard() {
  const [tasks, setTasks] = useState<Task[]>(dummyTasks);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Task, "id">>({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    priority: "Low",
    status: "To Do",
    client: "",
    subtasks: [],
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddSubtask = () => {
    setForm({ ...form, subtasks: [...form.subtasks, ""] });
  };

  const handleSubtaskChange = (index: number, value: string) => {
    const updated = [...form.subtasks];
    updated[index] = value;
    setForm({ ...form, subtasks: updated });
  };

  const handleSave = () => {
    if (!form.title || !form.client) return;
    if (editingTask) {
      setTasks(tasks.map(task => task.id === editingTask ? { ...task, ...form } : task));
    } else {
      const newTask: Task = {
        id: crypto.randomUUID(),
        ...form,
      };
      setTasks([...tasks, newTask]);
    }
    setForm({
      title: "",
      description: "",
      startDate: "",
      endDate: "",
      priority: "Low",
      status: "To Do",
      client: "",
      subtasks: [],
    });
    setEditingTask(null);
    setShowModal(false);
  };

  const tasksByStatus = (status: Status) => tasks.filter(task => task.status === status);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const updatedTasks = [...tasks];
    const task = updatedTasks.find(t => t.id === result.draggableId);
    if (task) {
      task.status = result.destination.droppableId as Status;
      setTasks(updatedTasks);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-wrap justify-between items-center gap-2">
        <h1 className="text-3xl font-bold mb-4 dark:text-white">🗂️ Project Board</h1>
        <button
          onClick={() => {
            setEditingTask(null);
            setForm({
              title: "",
              description: "",
              startDate: "",
              endDate: "",
              priority: "Low",
              status: "To Do",
              client: "",
              subtasks: [],
            });
            setShowModal(true);
          }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" /> Add Task
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex justify-center items-center">
          <div className="bg-white dark:bg-gray-900 dark:text-white p-6 rounded-lg w-full max-w-lg">
            <h2 className="text-lg font-semibold mb-4">{editingTask ? "Edit Task" : "New Task"}</h2>
            <div className="space-y-3">
              <input name="title" value={form.title} onChange={handleChange} placeholder="Title" className="border px-3 py-2 rounded w-full dark:bg-gray-800 dark:border-gray-700" />
              <textarea name="description" value={form.description} onChange={handleChange} placeholder="Description" className="border px-3 py-2 rounded w-full dark:bg-gray-800 dark:border-gray-700" />
              <div className="flex gap-2">
                <input name="startDate" value={form.startDate} onChange={handleChange} type="date" className="border px-3 py-2 rounded w-full dark:bg-gray-800 dark:border-gray-700" />
                <input name="endDate" value={form.endDate} onChange={handleChange} type="date" className="border px-3 py-2 rounded w-full dark:bg-gray-800 dark:border-gray-700" />
              </div>
              <input name="client" value={form.client} onChange={handleChange} placeholder="Client name" className="border px-3 py-2 rounded w-full dark:bg-gray-800 dark:border-gray-700" />
              <select name="priority" value={form.priority} onChange={handleChange} className="border px-3 py-2 rounded w-full dark:bg-gray-800 dark:border-gray-700">
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
              <select name="status" value={form.status} onChange={handleChange} className="border px-3 py-2 rounded w-full dark:bg-gray-800 dark:border-gray-700">
                {STATUSES.map(s => <option key={s}>{s}</option>)}
              </select>
              <div>
                <label className="block text-sm font-medium mb-1">Subtasks</label>
                {form.subtasks.map((sub, idx) => (
                  <input
                    key={idx}
                    value={sub}
                    onChange={(e) => handleSubtaskChange(idx, e.target.value)}
                    className="border px-3 py-1 rounded w-full mb-2 dark:bg-gray-800 dark:border-gray-700"
                  />
                ))}
                <button
                  type="button"
                  onClick={handleAddSubtask}
                  className="text-xs text-blue-600 hover:underline mt-1"
                >
                  + Add subtask
                </button>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 border rounded text-gray-500 dark:border-gray-700">Cancel</button>
              <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded">Save</button>
            </div>
          </div>
        </div>
      )}

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {STATUSES.map(status => (
            <Droppable droppableId={status} key={status}>
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 rounded-lg p-4 shadow-sm min-h-[200px]"
                >
                  <h2 className="text-lg font-semibold mb-3 dark:text-white">{status}</h2>
                  <div className="space-y-4">
                    {tasksByStatus(status).map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(provided) => (
                          <div
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            ref={provided.innerRef}
                            className="bg-white dark:bg-gray-900 dark:text-white p-4 rounded shadow"
                          >
                            <div className="flex justify-between items-center">
                              <h3 className="font-bold text-sm">{task.title}</h3>
                              <span className={`text-xs px-2 py-1 rounded ${
                                task.priority === "High" ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300" :
                                task.priority === "Medium" ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300" :
                                "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"}`}>
                                {task.priority}
                              </span>
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">{task.description}</p>
                            <p className="text-xs mt-2">📅 {task.startDate} → {task.endDate}</p>
                            <p className="text-xs">👤 {task.client}</p>
                            {task.subtasks.length > 0 && (
                              <ul className="text-xs mt-2 list-disc list-inside text-gray-600 dark:text-gray-300">
                                {task.subtasks.map((sub, i) => (
                                  <li key={i}>{sub}</li>
                                ))}
                              </ul>
                            )}
                            <div className="flex gap-2 mt-2">
                              <button
                                className="text-xs text-blue-500 hover:text-blue-700 flex items-center gap-1"
                                onClick={() => {
                                  setEditingTask(task.id);
                                  setForm({ ...task });
                                  setShowModal(true);
                                }}
                              >
                                <Pencil className="w-4 h-4" /> Edit
                              </button>
                              <button
                                className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1"
                                onClick={() => setTasks(tasks.filter(t => t.id !== task.id))}
                              >
                                <Trash2 className="w-4 h-4" /> Delete
                              </button>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}
