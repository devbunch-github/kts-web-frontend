import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Spinner from "../../components/Spinner";
import {
  createServiceCategory,
  updateServiceCategory,
  getServiceCategory,
} from "../../api/service";

export default function CategoryForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    Name: "",
    Description: "",
  });

  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      try {
        const res = await getServiceCategory(id);
        const cat = res?.data || res;
        setForm({
          Name: cat?.Name || cat?.name || "",
          Description: cat?.Description || cat?.description || "",
        });
      } catch (e) {
        alert("Failed to load category.");
      }
    })();
  }, [id, isEdit]);

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
      alert(e2?.response?.data?.message || "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="px-6 py-6">
      <div className="mb-6 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-600 hover:bg-rose-200"
        >
          ‹
        </button>
        <h1 className="text-xl font-semibold text-gray-800">
          {isEdit ? "Edit Category" : "Add New Category"}
        </h1>
      </div>

      <form onSubmit={onSubmit} className="max-w-4xl space-y-5" autoComplete="off">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Category Name
          </label>
          <input
            value={form.Name}
            onChange={(e) => setForm({ ...form, Name: e.target.value })}
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 outline-none ring-rose-200 focus:ring-2"
            placeholder="e.g Hair & Styling"
            required
          />
        </div>

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
            className="w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-2.5 outline-none ring-rose-200 focus:ring-2"
            placeholder="Enter description"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="h-11 w-[160px] rounded-xl bg-rose-300 text-white transition hover:bg-rose-400 disabled:opacity-60"
          >
            {saving ? <Spinner sm /> : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}
