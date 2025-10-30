import { useEffect, useMemo, useState } from "react";
import { getAccountants, deleteAccountant, toggleAccountantAccess } from "../../api/accountant";
import ConfirmModal from "../../components/ConfirmModal";
import ResetPasswordModal from "../../components/accountant/ResetPasswordModal";
import { Pencil, Trash2, LockKeyhole, UserCog  } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Accountant() {
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [selected, setSelected] = useState(null);
  const [resetOpen, setResetOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const res = await getAccountants();
      if (res.success) setRows(res.data);
    } catch (err) {
      console.error("Failed to load accountants", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = (id) => {
    setSelected(id);
    setConfirmAction("delete");
    setConfirmOpen(true);
  };

  const handleRevoke = (acct) => {
    setSelected(acct);
    setConfirmAction("revoke");
    setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    try {
      setLoading(true);
      let res;
      if (confirmAction === "delete") {
        res = await deleteAccountant(selected);
      } else if (confirmAction === "revoke") {
        res = await toggleAccountantAccess(selected.id);
      }
      setConfirmOpen(false);
      // Update local list immediately (without waiting)
      if (confirmAction === "revoke" && res?.data) {
        setRows((prev) =>
          prev.map((a) =>
            a.id === res.data.id ? { ...a, is_active: res.data.is_active } : a
          )
        );
      } else {
        await fetchData();
      }
      if (res?.message) {
        showMessage(res.message, "success");
      }

    } catch (err) {
      console.error("Action failed", err);
      showMessage("Something went wrong. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (text, type = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  const filtered = rows.filter(
    (a) =>
      a.name?.toLowerCase().includes(search.toLowerCase()) ||
      a.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 md:p-8">
      {/* Toast message */}
      {message && (
        <div
          className={`fixed top-5 right-5 z-50 px-4 py-2 rounded-lg shadow-lg text-sm font-medium transition-all duration-300 ${
            message.type === "success"
              ? "bg-green-100 text-green-700 border border-green-300"
              : "bg-red-100 text-red-700 border border-red-300"
          }`}
        >
          {message.text}
        </div>
      )}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="bg-rose-100 text-rose-700 p-2 rounded-xl">
            <UserCog size={20} strokeWidth={1.8} />
          </div>
          <h2 className="text-lg md:text-xl font-semibold text-gray-800">Accountant</h2>
        </div>
        <button
          onClick={() => navigate("/dashboard/accountant/add")}
          className="bg-[#b77272] hover:bg-[#a25d5d] text-white px-4 py-2 rounded-md text-sm font-medium shadow-sm"
        >
          + Add Accountant
        </button>
      </div>

      <div className="bg-white shadow rounded-2xl overflow-hidden">
        {/* Header Controls */}
        <div className="flex flex-wrap items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700">Show</span>
            <select className="border border-gray-300 rounded-md text-sm px-2 py-1 focus:outline-none">
              <option>10</option>
              <option>25</option>
            </select>
            <span className="text-sm text-gray-700">Entries</span>
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm pl-8 focus:outline-none focus:ring-1 focus:ring-rose-300"
            />
            <i className="fa-solid fa-magnifying-glass absolute left-2 top-2 text-gray-400 text-sm" />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-700">
            <thead>
              <tr className="border-b text-gray-600">
                <th className="py-3 px-6 font-medium">Name</th>
                <th className="py-3 px-6 font-medium">Email</th>
                <th className="py-3 px-6 font-medium text-center">Revoke Access</th>
                <th className="py-3 px-6 font-medium text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((acct) => (
                <tr key={acct.id} className="border-b hover:bg-rose-50/40 transition">
                  <td className="py-3 px-6">{acct.name}</td>
                  <td className="py-3 px-6">{acct.email}</td>
                  <td className="py-3 px-6 text-center">
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={acct.is_active}
                        onChange={() => handleRevoke(acct)}
                        className="sr-only peer"
                      />
                      <div className="w-10 h-5 bg-gray-300 peer-checked:bg-green-500 rounded-full relative after:absolute after:content-[''] after:w-4 after:h-4 after:bg-white after:rounded-full after:top-[2px] after:left-[2px] peer-checked:after:translate-x-5 after:transition-all" />
                    </label>
                  </td>
                  <td className="py-3 px-6 text-center space-x-2">
                    <button
                      onClick={() => navigate(`/dashboard/accountant/edit/${acct.id}`)}
                      className="text-gray-700 hover:text-[#b77272]"
                    >
                      <Pencil size={16} className="inline" /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(acct.id)}
                      className="text-gray-700 hover:text-[#b77272]"
                    >
                      <Trash2 size={16} className="inline" /> Delete
                    </button>
                    <button
                      onClick={() => {
                        setSelected(acct.id);
                        setResetOpen(true);
                      }}
                      className="text-gray-700 hover:text-[#b77272]"
                    >
                      <LockKeyhole size={16} className="inline" /> Reset Password
                    </button>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan="4" className="text-center text-gray-500 py-6">
                    Loading...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <ConfirmModal
        open={confirmOpen}
        title={
          confirmAction === "delete"
            ? "Are you sure you want to delete this accountant?"
            : selected?.is_active
            ? "Are you sure you want to revoke access for this user?"
            : "Re-activate this accountant?"
        }
        onConfirm={handleConfirm}
        onCancel={() => setConfirmOpen(false)}
        loading={loading}
      />

      <ResetPasswordModal
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        accountantId={selected}
      />
    </div>
  );
}
