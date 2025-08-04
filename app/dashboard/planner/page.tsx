"use client";
import { useState, useEffect } from "react";
import { X, Trash2, Pencil } from "lucide-react";
import { TimeBlock } from "@/app/types";

const hours = Array.from({ length: 15 }, (_, i) => 7 + i); // 7 AM to 9 PM
const minutesOptions = [0, 15, 30, 45];
const base = "https://vasabackend.onrender.com/api";

const getFormattedDate = (offset: number) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().split("T")[0];
};

const getDayName = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString(undefined, { weekday: "long" });
};

export default function DailyPlanner() {
  const days = Array.from({ length: 7 }, (_, i) => getFormattedDate(i));
  const [selectedDate, setSelectedDate] = useState(days[0]);
  const [blocksMap, setBlocksMap] = useState<Record<string, TimeBlock[]>>({});
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState<TimeBlock & { editing?: boolean; _id?: string }>({
    startHour: 7,
    startMinute: 0,
    endHour: 8,
    endMinute: 0,
    title: "",
    type: "task",
    id: "",
    editing: false,
  });
  const [errorMsg, setErrorMsg] = useState("");
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  /** Load blocks for selected day from backend */
  const loadBlocks = async (date: string) => {
    if (!token) return;
    try {
      const res = await fetch(`${base}/daily-plans?date=${date}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const events = (data.events || []).map((e: any) => {
          const [startHour, startMinute] = e.timeBlock.start.split(":").map(Number);
          const [endHour, endMinute] = e.timeBlock.end.split(":").map(Number);
          return {
            id: crypto.randomUUID(),
            _id: e._id, // backend ID for updates
            title: e.title,
            type: e.type.toLowerCase(),
            startHour,
            startMinute,
            endHour,
            endMinute,
          } as TimeBlock & { _id: string };
        });
        setBlocksMap((prev) => ({ ...prev, [date]: events }));
      }
    } catch (err) {
      console.error("Failed to load blocks:", err);
    }
  };

  useEffect(() => {
    loadBlocks(selectedDate);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  const openModal = (block?: TimeBlock & { _id?: string }) => {
    setErrorMsg("");
    setShowModal(true);
    if (block) setModalData({ ...block, editing: true });
    else
      setModalData({
        startHour: 7,
        startMinute: 0,
        endHour: 8,
        endMinute: 0,
        title: "",
        type: "task",
        id: "",
        editing: false,
      });
  };

  /** Save or update a block */
  const saveBlock = async () => {
    const { startHour, startMinute, endHour, endMinute, id, editing, _id } = modalData;
    const start = new Date(); start.setHours(startHour, startMinute);
    const end = new Date(); end.setHours(endHour, endMinute);
    if (end <= start) return setErrorMsg("End time must be after start time.");

    const blocks = blocksMap[selectedDate] || [];
    const overlap = blocks.some((b) => {
      if (editing && b.id === id) return false;
      const bStart = new Date(); bStart.setHours(b.startHour, b.startMinute);
      const bEnd = new Date(); bEnd.setHours(b.endHour, b.endMinute);
      return start < bEnd && end > bStart;
    });
    if (overlap) return setErrorMsg("This time overlaps with an existing block.");

    // Prepare local block
    const newBlock: TimeBlock & { _id?: string } = editing
      ? { ...modalData }
      : { ...modalData, id: crypto.randomUUID() };

    // Update UI first
    const updatedBlocks = editing
      ? blocks.map((b) => (b.id === id ? newBlock : b))
      : [...blocks, newBlock];
    setBlocksMap({ ...blocksMap, [selectedDate]: updatedBlocks });
    setShowModal(false);

    // Persist to backend
    try {
      const res = await fetch(`${base}/daily-plans/upsert-block`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          date: selectedDate,
          editingId: editing ? _id : null,
          block: {
            title: modalData.title,
            type: modalData.type.charAt(0).toUpperCase() + modalData.type.slice(1),
            timeBlock: {
              start: `${modalData.startHour}:${modalData.startMinute.toString().padStart(2, "0")}`,
              end: `${modalData.endHour}:${modalData.endMinute.toString().padStart(2, "0")}`,
            },
          },
        }),
      });

      if (!res.ok) throw new Error("Failed to save block");
      await loadBlocks(selectedDate); // refresh to get correct _ids
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to save block to server.");
    }
  };

  /** Delete block */
  const deleteBlock = async (block: TimeBlock & { _id?: string }) => {
    const filtered = (blocksMap[selectedDate] || []).filter((b) => b.id !== block.id);
    setBlocksMap({ ...blocksMap, [selectedDate]: filtered });

    try {
      await fetch(`${base}/daily-plans/delete-block`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ date: selectedDate, blockId: block._id }),
      });
    } catch (err) {
      console.error(err);
    }
  };

  const formatTime = (h: number, m: number) => {
    const ampm = h >= 12 ? "PM" : "AM";
    const hh = h % 12 || 12;
    const mm = m.toString().padStart(2, "0");
    return `${hh}:${mm} ${ampm}`;
  };

  return (
    <div className="p-4 mx-auto space-y-6 text-gray-900 dark:text-gray-100">
      <div className="flex gap-2 flex-wrap pb-2">
        {days.map((d) => (
          <button
            key={d}
            onClick={() => setSelectedDate(d)}
            className={`flex-shrink-0 px-3 py-2 rounded border ${
              selectedDate === d
                ? "bg-blue-600 text-white"
                : "bg-gray-100 dark:bg-gray-700 dark:text-gray-200"
            }`}
          >
            {getDayName(d)}
          </button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {hours.map((hour) => (
          <div
            key={hour}
            className="border rounded-lg p-3 bg-white dark:bg-gray-800 shadow-sm"
          >
            <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
              {formatTime(hour, 0)}
            </div>
            {(blocksMap[selectedDate] || [])
              .filter((b) => b.startHour === hour)
              .map((block) => (
                <div
                  key={block.id}
                  className={`flex justify-between items-center p-2 rounded text-sm text-white mb-2 ${
                    block.type === "task"
                      ? "bg-blue-500"
                      : block.type === "meeting"
                      ? "bg-green-500"
                      : "bg-yellow-500 text-black"
                  }`}
                >
                  <span>
                    {block.title} ({formatTime(block.startHour, block.startMinute)} - {formatTime(block.endHour, block.endMinute)})
                  </span>
                  <div className="flex gap-2">
                    <Pencil onClick={() => openModal(block)} className="w-4 h-4 cursor-pointer" />
                    <Trash2 onClick={() => deleteBlock(block)} className="w-4 h-4 cursor-pointer" />
                  </div>
                </div>
              ))}
            <button
              onClick={() => openModal()}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline mt-1"
            >
              New Block
            </button>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg w-full max-w-md shadow-lg">
            <div className="flex justify-between mb-4">
              <h2 className="text-lg font-semibold">
                {modalData.editing ? "Edit" : "New"} Time Block
              </h2>
              <X onClick={() => setShowModal(false)} className="w-5 h-5 cursor-pointer" />
            </div>
            <input
              value={modalData.title}
              onChange={(e) => setModalData({ ...modalData, title: e.target.value })}
              placeholder="Title"
              className="border dark:border-gray-700 px-3 py-2 w-full rounded mb-3 bg-gray-50 dark:bg-gray-800"
            />
            <select
              value={modalData.type}
              onChange={(e) => setModalData({ ...modalData, type: e.target.value as "task" | "meeting" | "focus" })}
              className="border dark:border-gray-700 px-2 py-1 rounded w-full mb-3 bg-gray-50 dark:bg-gray-800"
            >
              <option value="task">Task</option>
              <option value="meeting">Meeting</option>
              <option value="focus">Focus</option>
            </select>
            <div className="grid grid-cols-2 gap-4 mb-3">
              {["Start", "End"].map((label, idx) => (
                <div key={label}>
                  <label className="text-xs">{label} Time</label>
                  <div className="flex gap-2">
                    <select
                      value={idx === 0 ? modalData.startHour : modalData.endHour}
                      onChange={(e) =>
                        setModalData({
                          ...modalData,
                          ...(idx === 0
                            ? { startHour: parseInt(e.target.value) }
                            : { endHour: parseInt(e.target.value) }),
                        })
                      }
                      className="border dark:border-gray-700 px-2 py-1 rounded w-full bg-gray-50 dark:bg-gray-800"
                    >
                      {hours.map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>
                    <select
                      value={idx === 0 ? modalData.startMinute : modalData.endMinute}
                      onChange={(e) =>
                        setModalData({
                          ...modalData,
                          ...(idx === 0
                            ? { startMinute: parseInt(e.target.value) }
                            : { endMinute: parseInt(e.target.value) }),
                        })
                      }
                      className="border dark:border-gray-700 px-2 py-1 rounded w-full bg-gray-50 dark:bg-gray-800"
                    >
                      {minutesOptions.map((m) => (
                        <option key={m} value={m}>
                          {m.toString().padStart(2, "0")}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>
            {errorMsg && <p className="text-red-600 text-sm mb-2">{errorMsg}</p>}
            <div className="flex justify-end">
              <button
                onClick={saveBlock}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
