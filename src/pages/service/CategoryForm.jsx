import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Spinner from "../../components/Spinner";
import {
  createServiceCategory,
  updateServiceCategory,
  getServiceCategory,
} from "../../api/service";
import { ChevronLeft } from "lucide-react";

export default function CategoryForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEdit); // 👈 Show loader only when editing
  const [form, setForm] = useState({
    Name: "",
    Description: "",
  });

  // Load existing category (for edit mode)
  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      try {
        setLoading(true);
        const res = await getServiceCategory(id);
        const cat = res?.data || res;
        setForm({
          Name: cat?.Name || cat?.name || "",
          Description: cat?.Description || cat?.description || "",
        });
      } catch {
        alert("Failed to load category details.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, isEdit]);

  // Submit
  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (isEdit) {
        await updateServiceCategory(id, form);
      } else {
        await createServiceCategory(form);
      }
      navigate("/dashboard/services");
    } catch (e2) {
      alert(e2?.response?.data?.message || "Failed to save category.");
    } finally {
      setSaving(false);
    }
  };

  // Show loading spinner while fetching
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#FBF8F7] text-gray-600">
        <Spinner className="h-5 w-5 mb-3" />
        <p className="text-sm">Loading category details…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBF8F7] px-6 py-8 text-gray-800">
      {/* Header */}
      <div className="mb-10 flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-rose-100 to-rose-200 text-rose-600 hover:bg-rose-200 shadow-sm"
        >
          <ChevronLeft size={18} />
        </button>
        <h1 className="text-[22px] font-semibold tracking-tight">
          {isEdit ? "Edit Category" : "Add New Category"}
        </h1>
      </div>

      {/* Form */}
      <form
        onSubmit={onSubmit}
        className="max-w-4xl space-y-8"
        autoComplete="off"
      >
        {/* Category Name */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Category Name
          </label>
          <input
            type="text"
            value={form.Name}
            onChange={(e) => setForm({ ...form, Name: e.target.value })}
            placeholder="e.g Hair, Makeup"
            required
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-rose-200"
          />
        </div>

        {/* Description */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            value={form.Description}
            onChange={(e) =>
              setForm({ ...form, Description: e.target.value })
            }
            rows={6}
            placeholder="Enter description"
            className="w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-rose-200"
          />
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={saving}
            className="h-11 w-[160px] rounded-xl bg-[#D6A5A5] text-sm font-medium text-white transition hover:bg-[#c38e8e] disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <Spinner className="h-4 w-4" /> Saving…
              </>
            ) : (
              "Save"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
