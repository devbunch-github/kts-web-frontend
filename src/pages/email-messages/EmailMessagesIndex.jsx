import { useEffect, useState } from "react";
import axios from "@/api/http";
import { Pencil, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import Switch from "@/components/ui/Switch";
import { Link } from "react-router-dom";

export default function EmailMessagesIndex() {
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("/api/email-messages");
      setRows(data.data || []);
    } catch {
      toast.error("Failed to load email messages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const toggle = async (row) => {
    try {
      await axios.put(`/api/email-messages/${row.id}`, { status: !row.status });
      toast.success("Status updated");
      setRows((rows) =>
        rows.map((r) => (r.id === row.id ? { ...r, status: !r.status } : r))
      );
    } catch {
      toast.error("Update failed");
    }
  };

  return (
    <div className="p-6">
      <div className="bg-white rounded-2xl shadow-sm p-6 min-h-[400px] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Messages</h2>
          <input
            placeholder="Search"
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-rose-400 focus:outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Loader */}
        {loading && (
          <div className="flex-1 flex flex-col items-center justify-center py-16 text-gray-500">
            <Loader2 className="animate-spin mb-3 text-rose-400" size={28} />
            <p className="text-sm font-medium">Loading email messages...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && rows.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center py-16 text-gray-500">
            <img
              src="/images/empty-state-email.svg"
              alt="Empty"
              className="h-28 opacity-70 mb-4"
            />
            <p className="text-sm font-medium">
              No email messages found for your business.
            </p>
          </div>
        )}

        {/* Table */}
        {!loading && rows.length > 0 && (
          <div className="overflow-x-auto mt-2">
            <table className="min-w-full text-sm text-left">
              <thead>
                <tr className="text-gray-600 border-b">
                  <th className="py-3">Title</th>
                  <th className="py-3">Subject</th>
                  <th className="py-3 text-center">Status</th>
                  <th className="py-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {rows
                  .filter((r) =>
                    r.title.toLowerCase().includes(search.toLowerCase())
                  )
                  .map((row) => (
                    <tr
                      key={row.id}
                      className="border-b hover:bg-rose-50/40 transition"
                    >
                      <td className="py-3 text-gray-800">{row.title}</td>
                      <td className="py-3 text-gray-700">{row.subject}</td>
                      <td className="py-3 text-center">
                        <Switch
                          checked={row.status}
                          onCheckedChange={() => toggle(row)}
                        />
                      </td>
                      <td className="py-3 text-center">
                        <Link
                          to={`/dashboard/email-messages/${row.id}/edit`}
                          className="text-rose-500 hover:text-rose-700 inline-flex items-center gap-1 font-medium"
                        >
                          <Pencil size={16} /> Edit
                        </Link>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
