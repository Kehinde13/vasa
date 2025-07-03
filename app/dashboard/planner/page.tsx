"use client";
import { useState } from "react";
import { X, Trash2, Pencil } from "lucide-react";
import { signIn, useSession } from "next-auth/react";
import { TimeBlock } from "@/app/types";

const hours = Array.from({ length: 15 }, (_, i) => 7 + i); // 7 AM to 9 PM
const minutesOptions = [0, 15, 30, 45];

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
  const [modalData, setModalData] = useState({
    startHour: 7,
    startMinute: 0,
    endHour: 8,
    endMinute: 0,
    title: "",
    type: "task" as "task" | "meeting" | "focus",
    id: "",
    editing: false,
  });
  const [errorMsg, setErrorMsg] = useState("");
  const { data: session } = useSession();

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

  const createGoogleEvent = async (block: TimeBlock) => {
    if (!session?.accessToken) return;

    const start = new Date(selectedDate);
    start.setHours(block.startHour, block.startMinute);

    const end = new Date(selectedDate);
    end.setHours(block.endHour, block.endMinute);

    try {
      await fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          summary: block.title,
          description: `VAsA Planner - ${block.type}`,
          start: { dateTime: start.toISOString() },
          end: { dateTime: end.toISOString() },
        }),
      });
    } catch (err) {
      console.error("Failed to create Google Calendar event:", err);
    }
  };

  const saveBlock = async () => {
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

    if (!editing) await createGoogleEvent(modalData);
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

  return (
    <div className="p-4 mx-auto space-y-6 text-gray-900 dark:text-gray-100">
      <div className="flex justify-between items-center">
        {!session ? (
          <button onClick={() => signIn("google")}>Connect Google Calendar</button>
        ) : (
          <p>Connected as {session.user?.email}</p>
        )}
      </div>

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
                    <Trash2 onClick={() => deleteBlock(block.id)} className="w-4 h-4 cursor-pointer" />
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
