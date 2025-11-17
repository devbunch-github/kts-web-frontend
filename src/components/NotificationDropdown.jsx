import { useEffect, useState } from "react";
import { Bell, ChevronDown, ChevronUp } from "lucide-react";
import { getNotifications } from "@/api/notifications";

export default function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({}); // Track open/close per notification

  useEffect(() => {
    (async () => {
      try {
        const data = await getNotifications();
        setNotifications(data);
      } catch (err) {
        console.error("Failed to load notifications", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const toggleExpand = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="relative">
      {/* Bell Icon */}
      <button
        className="relative p-2 rounded-full hover:bg-rose-50 border border-gray-200 transition"
        onClick={() => setOpen(!open)}
      >
        <Bell size={18} />
        {notifications.length > 0 && (
          <span className="absolute top-1 right-1 h-2.5 w-2.5 bg-rose-500 rounded-full"></span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white shadow-xl rounded-2xl border border-gray-100 overflow-hidden z-50">
          <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
            <div className="px-4 py-3 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-700">
                Notifications
              </h3>
            </div>

            {loading ? (
              <div className="p-4 text-xs text-gray-500">
                Loading notifications...
              </div>
            ) : notifications.length ? (
              notifications.map((n) => (
                <div key={n.id} className="p-2">
                  <button
                    onClick={() => toggleExpand(n.id)}
                    className="w-full flex items-center justify-between text-left px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-rose-50"
                  >
                    <span>{n.header}</span>
                    {expanded[n.id] ? (
                      <ChevronUp size={14} className="text-gray-500" />
                    ) : (
                      <ChevronDown size={14} className="text-gray-500" />
                    )}
                  </button>

                  {expanded[n.id] && (
                    <div className="mt-1 ml-3 mr-3 mb-2 p-3 rounded-xl bg-rose-50/40 border border-rose-100 text-xs text-gray-600 leading-relaxed">
                      {n.message}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="p-4 text-xs text-gray-400">
                No new notifications.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
