import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  createAccountant,
  getAccountantById,
  updateAccountant,
} from "../../api/accountant";
import { ArrowLeft } from "lucide-react";

export default function AddAccountant() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm_password: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  // ✅ Fetch existing data for edit
  useEffect(() => {
    if (isEdit) {
      const fetchAccountant = async () => {
        try {
          setLoading(true);
          const res = await getAccountantById(id);
          if (res?.success && res.data) {
            setForm({
              name: res.data.name || "",
              email: res.data.email || "",
              password: "",
              confirm_password: "",
            });
          }
        } catch (err) {
          setMessage({
            text: "Failed to load accountant details.",
            type: "error",
          });
        } finally {
          setLoading(false);
        }
      };
      fetchAccountant();
    }
  }, [id]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: "", type: "" });

    // ✅ Validate password match (only if one is filled)
    if (form.password || form.confirm_password) {
      if (form.password !== form.confirm_password) {
        setMessage({ text: "Passwords do not match.", type: "error" });
        return;
      }
    }

    try {
      setLoading(true);
      if (isEdit) {
        const payload = {
          name: form.name,
          email: form.email,
        };

        // ✅ Only include password fields if provided
        if (form.password) {
          payload.password = form.password;
          payload.confirm_password = form.confirm_password;
        }

        await updateAccountant(id, payload);
        setMessage({
          text: "Accountant updated successfully.",
          type: "success",
        });
      } else {
        await createAccountant({
          name: form.name,
          email: form.email,
          password: form.password,
        });
        setMessage({
          text: "Accountant added successfully.",
          type: "success",
        });
      }

      setTimeout(() => navigate("/dashboard/accountant"), 1200);
    } catch (err) {
      setMessage({
        text:
          err?.response?.data?.message ||
          `Failed to ${isEdit ? "update" : "create"} accountant.`,
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf7f7] px-4 py-6 sm:px-8">
      <div className="max-w-1xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-2 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center h-9 w-9 rounded-lg bg-rose-100 hover:bg-rose-200 text-[#b77272] transition"
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-xl font-semibold text-gray-800">
            {isEdit ? "Edit Accountant" : "Add New Accountant"}
          </h1>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 mx-auto max-w-4xl">
          {message.text && (
            <div
              className={`mb-4 p-3 rounded-md text-sm text-center font-medium border ${
                message.type === "success"
                  ? "bg-green-50 text-green-700 border-green-200"
                  : "bg-red-50 text-red-700 border-red-200"
              }`}
            >
              {message.text}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                placeholder="Enter name"
                className="w-full border border-gray-300 rounded-md px-3 py-2.5 focus:ring-2 focus:ring-rose-300 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="Enter email"
                className="w-full border border-gray-300 rounded-md px-3 py-2.5 focus:ring-2 focus:ring-rose-300 outline-none"
              />
            </div>
          </div>

          {/* ✅ Passwords optional in Edit */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password {isEdit && <span className="text-gray-400">(optional)</span>}
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder={
                  isEdit ? "Enter new password (optional)" : "Enter password"
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2.5 focus:ring-2 focus:ring-rose-300 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password {isEdit && <span className="text-gray-400">(optional)</span>}
              </label>
              <input
                type="password"
                name="confirm_password"
                value={form.confirm_password}
                onChange={handleChange}
                placeholder={
                  isEdit
                    ? "Confirm new password (optional)"
                    : "Confirm password"
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2.5 focus:ring-2 focus:ring-rose-300 outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="bg-[#b77272] hover:bg-[#a86262] text-white font-medium px-8 py-2.5 rounded-md transition disabled:opacity-60"
            >
              {loading
                ? "Saving..."
                : isEdit
                ? "Update Accountant"
                : "Save Accountant"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
