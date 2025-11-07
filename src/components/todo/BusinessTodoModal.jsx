import { useEffect, useState } from "react";
import { X, Clock } from "lucide-react";
import toast from "react-hot-toast";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import isToday from "dayjs/plugin/isToday";
dayjs.extend(relativeTime);
dayjs.extend(isToday);

import {
  listTodos,
  createTodo,
  deleteTodo,
  toggleTodo,
  updateTodo,
} from "@/api/todo";
import LoaderOverlay from "@/components/LoaderOverlay";

/**
 * Business To-Do Modal
 * -------------------------------------------------
 * Opens from Topbar “Notes” button
 * Features:
 *  - Add, toggle, delete, and inline edit
 *  - Show due date & time with Past / Today / Upcoming status
 *  - Always visible “+ List item” input
 *  - SQL Server–friendly (numeric IDs)
 */
export default function BusinessTodoModal({ open, onClose }) {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [newText, setNewText] = useState("");
  const [newDue, setNewDue] = useState("");

  // 🚀 Load To-dos when modal opens
  useEffect(() => {
    if (!open) return;
    (async () => {
      try {
        setLoading(true);
        const { data } = await listTodos();
        setItems(data?.data || []);
      } catch {
        toast.error("Failed to load to-dos");
      } finally {
        setLoading(false);
      }
    })();
  }, [open]);

  // 🟢 Add new To-do
  const onAdd = async () => {
    if (!newText.trim()) return toast.error("Please type a list item");
    try {
      const payload = {
        title: newText.trim(),
        due_datetime: newDue ? dayjs(newDue).toISOString() : null,
      };
      const { data } = await createTodo(payload);
      setItems((prev) => [data?.data, ...prev]);
      setNewText("");
      setNewDue("");
      toast.success("Task added");
    } catch {
      toast.error("Could not add item");
    }
  };

  // ✅ Toggle completion
  const onToggle = async (id) => {
    try {
      const { data } = await toggleTodo(id);
      setItems((prev) =>
        prev.map((it) => (it.id === id ? data?.data : it))
      );
    } catch {
      toast.error("Failed to update task");
    }
  };

  // ❌ Delete
  const onRemove = async (id) => {
    try {
      await deleteTodo(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
      toast.success("Task removed");
    } catch {
      toast.error("Delete failed");
    }
  };

  // ✏️ Inline edit
  const onInlineEdit = async (id, title) => {
    try {
      const { data } = await updateTodo(id, { title });
      setItems((prev) => prev.map((i) => (i.id === id ? data?.data : i)));
    } catch {
      toast.error("Update failed");
    }
  };

  // 🧠 Helper: get due status style
  const getDueStatus = (due) => {
    if (!due) return { label: "No due date", color: "text-gray-400" };
    const d = dayjs(due);
    if (d.isBefore(dayjs(), "day")) return { label: "Past due", color: "text-rose-600" };
    if (d.isToday()) return { label: "Today", color: "text-amber-600" };
    return { label: "Upcoming", color: "text-green-600" };
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl border border-gray-200 animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">To-do list</h3>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-100"
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4 min-h-[320px] overflow-y-auto">
          {loading ? (
            <LoaderOverlay />
          ) : (
            <>
              {/* Empty State */}
              {items.length === 0 && (
                <div className="flex flex-col items-center justify-center text-center py-8 text-gray-400">
                  <Clock className="w-8 h-8 mb-3 text-rose-400" />
                  <p className="text-sm">You don’t have any tasks yet.</p>
                  <p className="text-xs text-gray-400">
                    Add your first task below to get started.
                  </p>
                </div>
              )}

              {/* To-do list */}
              <div className="divide-y divide-gray-100">
                {items.map((item) => {
                  const status = getDueStatus(item.due_datetime);
                  const formatted = item.due_datetime
                    ? dayjs(item.due_datetime).format("DD MMM, hh:mm A")
                    : null;

                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-3 py-3"
                    >
                      {/* Left side: checkbox + title */}
                      <div className="flex items-center gap-3 flex-1">
                        <input
                          type="checkbox"
                          checked={item.is_completed}
                          onChange={() => onToggle(item.id)}
                          className="w-4 h-4 rounded border-gray-300 accent-rose-500"
                        />
                        <input
                          className={`flex-1 bg-transparent outline-none text-[15px] ${
                            item.is_completed
                              ? "line-through text-gray-400"
                              : "text-gray-700"
                          }`}
                          defaultValue={item.title}
                          onBlur={(e) => {
                            const v = e.target.value.trim();
                            if (v && v !== item.title) onInlineEdit(item.id, v);
                          }}
                        />
                      </div>

                      {/* Right side: due date & status */}
                      <div className="flex flex-col items-end gap-0.5 text-xs text-gray-400 w-36">
                        {formatted && (
                          <div className="flex items-center gap-1 text-gray-500">
                            <Clock size={12} />
                            <span>{formatted}</span>
                          </div>
                        )}
                        <span className={`font-medium ${status.color}`}>
                          {status.label}
                        </span>
                      </div>

                      {/* Delete */}
                      <button
                        onClick={() => onRemove(item.id)}
                        className="text-gray-400 hover:text-gray-600 px-1"
                        aria-label="Remove"
                      >
                        ×
                      </button>
                    </div>
                  );
                })}

                {/* New Item Input */}
                <div className="flex items-center gap-3 py-3">
                  <span className="text-gray-500 select-none text-xl leading-none">
                    +
                  </span>
                  <input
                    value={newText}
                    onChange={(e) => setNewText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && onAdd()}
                    placeholder="List item"
                    className="flex-1 outline-none bg-transparent text-gray-700 placeholder:text-gray-400"
                  />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 px-6 py-4 border-t border-gray-200">
          <div>
            <label className="block text-xs text-gray-500 mb-1">
              Pick date &amp; time (optional)
            </label>
            <input
              type="datetime-local"
              value={newDue}
              onChange={(e) => setNewDue(e.target.value)}
              className="w-60 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-rose-200 focus:border-rose-300"
            />
          </div>

          <div className="flex items-center justify-end gap-3 md:ml-auto">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100"
            >
              Close
            </button>
            <button
              onClick={onAdd}
              className="px-4 py-2 rounded-lg bg-rose-600 text-white hover:bg-rose-700"
            >
              Save item
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
