"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Trash2, Pencil, CalendarDays } from "lucide-react";

type BlockType = "task" | "meeting" | "focus";

interface TimeBlock {
  id: string;
  startHour: number;
  startMinute: number;
  endHour: number;
  endMinute: number;
  title: string;
  type: BlockType;
}

const hours = Array.from({ length: 15 }, (_, i) => 7 + i); // 7 AM to 9 PM
const minutesOptions = [0, 15, 30, 45, 60];
const getFormattedDate = (offset: number) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().split("T")[0];
};

export default function DailyPlanner() {
  const router = useRouter();
  const days = Array.from({ length: 7 }, (_, i) => getFormattedDate(i));
  const [selectedDate, setSelectedDate] = useState(days[0]);
  const [blocksMap, setBlocksMap] = useState<Record<string, TimeBlock[]>>({});
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState({
    startHour: 7,
    startMinute: 0,
    endHour: 8,
    endMinute: 0,
    title: "",
    type: "task" as BlockType,
    id: "",
    editing: false,
  });
  const [errorMsg, setErrorMsg] = useState("");

  const openModal = (block?: TimeBlock) => {
    setErrorMsg("");
    setShowModal(true);
    if (block) {
      setModalData({ ...block, editing: true });
    } else {
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
    }
  };

  const saveBlock = () => {
    const { startHour, startMinute, endHour, endMinute, id, editing } = modalData;

    const start = new Date();
    start.setHours(startHour, startMinute);
    const end = new Date();
    end.setHours(endHour, endMinute);

    if (end <= start) {
      setErrorMsg("End time must be after start time.");
      return;
    }

    const blocks = blocksMap[selectedDate] || [];
    const overlap = blocks.some((b) => {
      if (editing && b.id === id) return false;
      const bStart = new Date();
      bStart.setHours(b.startHour, b.startMinute);
      const bEnd = new Date();
      bEnd.setHours(b.endHour, b.endMinute);
      return start < bEnd && end > bStart;
    });

    if (overlap) {
      setErrorMsg("This time overlaps with an existing block.");
      return;
    }

    const updated = editing
      ? blocks.map((b) => (b.id === id ? { ...modalData } : b))
      : [...blocks, { ...modalData, id: crypto.randomUUID() }];

    setBlocksMap({ ...blocksMap, [selectedDate]: updated });
    setShowModal(false);
  };

  const deleteBlock = (id: string) => {
    const filtered = (blocksMap[selectedDate] || []).filter((b) => b.id !== id);
    setBlocksMap({ ...blocksMap, [selectedDate]: filtered });
  };

  const formatTime = (h: number, m: number) => {
    const ampm = h >= 12 ? "PM" : "AM";
    const hh = h % 12 || 12;
    const mm = m.toString().padStart(2, "0");
    return `${hh}:${mm} ${ampm}`;
  };

  const exportToICS = () => {
    const events = (blocksMap[selectedDate] || [])
      .map((block) => {
        const dt = (h: number, m: number) => {
          const d = new Date(selectedDate);
          d.setHours(h, m);
          return d.toISOString().replace(/[-:]/g, "").split(".")[0];
        };
        return `
BEGIN:VEVENT
SUMMARY:${block.title}
DTSTART:${dt(block.startHour, block.startMinute)}
DTEND:${dt(block.endHour, block.endMinute)}
DESCRIPTION:VAsA Planner - ${block.type}
END:VEVENT
`;
      })
      .join("");

    const ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//VAsA Planner//EN
${events}
END:VCALENDAR`;

    const blob = new Blob([ics], { type: "text/calendar" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `planner-${selectedDate}.ics`;
    a.click();
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <button onClick={() => router.back()} className="text-sm text-blue-600 underline">
          ← Back
        </button>
        <div className="flex gap-2">
          <CalendarDays className="w-5 h-5 text-blue-600" />
          <button onClick={exportToICS} className="text-blue-600 font-semibold hover:underline">
            Export to Calendar
          </button>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {days.map((d) => (
          <button
            key={d}
            onClick={() => setSelectedDate(d)}
            className={`px-4 py-2 border rounded ${selectedDate === d ? "bg-blue-600 text-white" : ""}`}
          >
            {d}
          </button>
        ))}
      </div>

      <div className="grid gap-3">
        {hours.map((hour) => (
          <div key={hour} className="border rounded p-3">
            <div className="text-sm text-gray-600 font-semibold mb-2">{formatTime(hour, 0)}</div>
            {(blocksMap[selectedDate] || [])
              .filter((b) => b.startHour === hour)
              .map((block) => (
                <div
                  key={block.id}
                  className={`p-2 rounded text-sm mb-2 text-white flex justify-between items-center ${
                    block.type === "task"
                      ? "bg-blue-500"
                      : block.type === "meeting"
                      ? "bg-green-500"
                      : "bg-yellow-500"
                  }`}
                >
                  <span>
                    {block.title} ({formatTime(block.startHour, block.startMinute)} -{" "}
                    {formatTime(block.endHour, block.endMinute)})
                  </span>
                  <div className="flex gap-2">
                    <Pencil onClick={() => openModal(block)} className="w-4 h-4 cursor-pointer" />
                    <Trash2 onClick={() => deleteBlock(block.id)} className="w-4 h-4 cursor-pointer" />
                  </div>
                </div>
              ))}
            <button onClick={() => openModal()} className="text-xs text-blue-600 hover:underline">
              + Add Block
            </button>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
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
              className="border px-3 py-2 w-full rounded mb-3"
            />
            <select
              value={modalData.type}
              onChange={(e) => setModalData({ ...modalData, type: e.target.value as BlockType })}
              className="border px-2 py-1 rounded w-full mb-3"
            >
              <option value="task">Task</option>
              <option value="meeting">Meeting</option>
              <option value="focus">Focus</option>
            </select>
            <div className="grid grid-cols-2 gap-4 mb-3">
              <div>
                <label className="text-xs">Start Time</label>
                <div className="flex gap-2">
                  <select
                    value={modalData.startHour}
                    onChange={(e) => setModalData({ ...modalData, startHour: parseInt(e.target.value) })}
                    className="border px-2 py-1 rounded w-full"
                  >
                    {hours.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                  <select
                    value={modalData.startMinute}
                    onChange={(e) => setModalData({ ...modalData, startMinute: parseInt(e.target.value) })}
                    className="border px-2 py-1 rounded w-full"
                  >
                    {minutesOptions.map((m) => (
                      <option key={m} value={m}>
                        {m.toString().padStart(2, "0")}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs">End Time</label>
                <div className="flex gap-2">
                  <select
                    value={modalData.endHour}
                    onChange={(e) => setModalData({ ...modalData, endHour: parseInt(e.target.value) })}
                    className="border px-2 py-1 rounded w-full"
                  >
                    {hours.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                  <select
                    value={modalData.endMinute}
                    onChange={(e) => setModalData({ ...modalData, endMinute: parseInt(e.target.value) })}
                    className="border px-2 py-1 rounded w-full"
                  >
                    {minutesOptions.map((m) => (
                      <option key={m} value={m}>
                        {m.toString().padStart(2, "0")}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            {errorMsg && <p className="text-red-600 text-sm mb-2">{errorMsg}</p>}
            <div className="flex justify-end">
              <button onClick={saveBlock} className="bg-blue-600 text-white px-4 py-2 rounded">
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
