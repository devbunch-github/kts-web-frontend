import { useEffect, useState } from "react";
import { listCustomers, deleteCustomer } from "../../api/customer";
import { useNavigate } from "react-router-dom";
import ConfirmDialog from "../../components/ConfirmDialog";
import { Search } from "lucide-react";
import { Eye, Pencil, Trash2 } from "lucide-react"; // icons for actions

export default function CustomerList() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // ✅ Fetch all customers
  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await listCustomers();
      setCustomers(res);
    } catch (err) {
      console.error("Failed to load customers", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const confirmDelete = (id) => {
    setSelectedId(id);
    setConfirmOpen(true);
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await deleteCustomer(selectedId);
      setConfirmOpen(false);
      fetchData();
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setDeleting(false);
    }
  };

  const filtered = customers.filter((c) =>
    c.Name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 bg-[#FAF7F7] min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="bg-[#E7C7C7] w-7 h-7 rounded-lg flex items-center justify-center shadow-sm">
            <span className="text-rose-700 text-sm font-bold">👤</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Customer</h2>
        </div>

        <button
          onClick={() => navigate("/dashboard/customers/new")}
          className="bg-[#C47B7B] hover:bg-[#B86C6C] text-white px-5 py-2.5 rounded-md text-sm font-medium shadow-sm transition"
        >
          + Add Customer
        </button>
      </div>

      {/* Card */}
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-[#F2EAEA]">
        {/* Top Controls */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <span>Show</span>
            <select className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none">
              <option>10</option>
              <option>25</option>
              <option>50</option>
            </select>
            <span>Entries</span>
          </div>

          {/* Search */}
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-rose-400"
            />
            <input
              type="text"
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border border-[#EACFCF] rounded-md pl-9 pr-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-rose-300 w-44"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-12 text-center text-gray-500 text-sm">
              Loading customers...
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-gray-500 text-sm">
              No customers found
            </div>
          ) : (
            <table className="w-full text-sm text-gray-800">
              <thead>
                <tr className="border-b border-[#EDECEC] text-left text-gray-800">
                  <th className="pb-3 font-medium">Full Name</th>
                  <th className="pb-3 font-medium">Mobile Number</th>
                  <th className="pb-3 font-medium">Date of Birth</th>
                  <th className="pb-3 font-medium">Email</th>
                  <th className="pb-3 font-medium text-right pr-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr
                    key={c.Id}
                    className="border-b border-[#F1EFEF] hover:bg-[#FAF7F7] transition"
                  >
                    <td className="py-3">{c.Name}</td>
                    <td>{c.MobileNumber || "-"}</td>
                    <td>
                      {c.DateOfBirth
                        ? new Date(c.DateOfBirth).toLocaleDateString("en-GB")
                        : "-"}
                    </td>
                    <td>{c.Email || "-"}</td>

                    {/* ✅ Action Buttons */}
                    <td className="py-3 text-right pr-4">
                      <div className="flex justify-end items-center gap-2">
                        <button
                          onClick={() =>
                            navigate(`/dashboard/customers/view/${c.Id}`)
                          }
                          className="p-1.5 hover:bg-[#F9E9E9] rounded-md transition"
                          title="View"
                        >
                          <Eye size={16} className="text-gray-600" />
                        </button>
                        <button
                          onClick={() =>
                            navigate(`/dashboard/customers/edit/${c.Id}`)
                          }
                          className="p-1.5 hover:bg-[#EAF0FF] rounded-md transition"
                          title="Edit"
                        >
                          <Pencil size={15} className="text-gray-600" />
                        </button>
                        <button
                          onClick={() => confirmDelete(c.Id)}
                          className="p-1.5 hover:bg-[#FFEAEA] rounded-md transition"
                          title="Delete"
                        >
                          <Trash2 size={15} className="text-gray-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {!loading && filtered.length > 0 && (
          <div className="flex justify-end items-center gap-6 mt-4 text-sm text-gray-600">
            <button className="text-gray-400 cursor-not-allowed">‹</button>
            <span className="font-medium text-gray-900">1</span>
            <button className="text-gray-400 cursor-not-allowed">›</button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={confirmOpen}
        title="Delete Customer"
        message="Are you sure you want to delete this customer? This action cannot be undone."
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  );
}
