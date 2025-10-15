import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Spinner from "../../components/Spinner";
import {
  createService,
  updateService,
  getService,
  listServiceCategories,
  uploadGeneric,
} from "../../api/service";

export default function ServiceForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    Name: "",
    CategoryId: "",
    TotalPrice: "",
    DepositType: "Percentage",
    Deposit: "",
    DefaultAppointmentDuration: "",
    Description: "",
    FilePath: "",
    ImagePath: "",
  });

  const [fileLabel, setFileLabel] = useState("");
  const [imageLabel, setImageLabel] = useState("");

  useEffect(() => {
    const boot = async () => {
      const cats = await listServiceCategories();
      setCategories(cats?.data || cats || []);

      if (isEdit) {
        const res = await getService(id);
        const svc = res?.data || res;
        setForm({
          Name: svc?.Name ?? "",
          CategoryId: svc?.CategoryId ?? "",
          TotalPrice: svc?.TotalPrice ?? "",
          DepositType: svc?.DepositType ?? "Percentage",
          Deposit: svc?.Deposit ?? "",
          DefaultAppointmentDuration:
            svc?.DefaultAppointmentDuration ?? "",
          Description: svc?.Description ?? "",
          FilePath: svc?.FilePath ?? "",
          ImagePath: svc?.ImagePath ?? "",
        });
        if (svc?.FilePath) setFileLabel(svc.FilePath.split("/").pop());
        if (svc?.ImagePath) setImageLabel(svc.ImagePath.split("/").pop());
      }
    };
    boot();
  }, [id, isEdit]);

  const onUpload = async (file, key) => {
    const fd = new FormData();
    fd.append("file", file);
    const res = await uploadGeneric(fd);
    const path = res?.path || res?.url || res?.data?.path;
    if (!path) return alert("Upload failed.");
    setForm((f) => ({ ...f, [key]: path }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (isEdit) {
        await updateService(id, form);
      } else {
        await createService(form);
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
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-600 hover:bg-rose-200"
        >
          ‹
        </button>
        <h1 className="text-xl font-semibold text-gray-800">
          {isEdit ? "Edit Service" : "Add New Service"}
        </h1>
      </div>

      <form
        onSubmit={onSubmit}
        className="grid grid-cols-12 gap-x-6 gap-y-6"
        autoComplete="off"
      >
        {/* Left */}
        <div className="col-span-12 md:col-span-6 space-y-5">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Service Name
            </label>
            <input
              value={form.Name}
              onChange={(e) => setForm({ ...form, Name: e.target.value })}
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 focus:ring-2 ring-rose-200 outline-none"
              required
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Price (£)
            </label>
            <input
              type="number"
              step="0.01"
              value={form.TotalPrice}
              onChange={(e) =>
                setForm({ ...form, TotalPrice: e.target.value })
              }
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 focus:ring-2 ring-rose-200 outline-none"
              required
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Duration (minutes)
            </label>
            <input
              type="number"
              min="1"
              value={form.DefaultAppointmentDuration}
              onChange={(e) =>
                setForm({
                  ...form,
                  DefaultAppointmentDuration: e.target.value,
                })
              }
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 focus:ring-2 ring-rose-200 outline-none"
              required
            />
          </div>

          {/* Upload File */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Upload File
            </label>
            <label className="flex h-[140px] cursor-pointer items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white">
              <input
                type="file"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) {
                    setFileLabel(f.name);
                    onUpload(f, "FilePath");
                  }
                }}
              />
              <div className="text-sm text-gray-500 text-center">
                {fileLabel || "Browse or drag a file"}
              </div>
            </label>
            {form.FilePath && (
              <a
                href={form.FilePath}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-rose-600 underline mt-2 block"
              >
                View uploaded file
              </a>
            )}
          </div>
        </div>

        {/* Right */}
        <div className="col-span-12 md:col-span-6 space-y-5">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Select Category
            </label>
            <select
              value={form.CategoryId}
              onChange={(e) =>
                setForm({ ...form, CategoryId: e.target.value })
              }
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 focus:ring-2 ring-rose-200 outline-none"
              required
            >
              <option value="">Select category</option>
              {(categories || []).map((c) => (
                <option key={c.Id || c.id} value={c.Id || c.id}>
                  {c.Name || c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Deposit
            </label>
            <div className="flex gap-3">
              <input
                type="number"
                step="0.01"
                value={form.Deposit}
                onChange={(e) =>
                  setForm({ ...form, Deposit: e.target.value })
                }
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 focus:ring-2 ring-rose-200 outline-none"
              />
              <select
                value={form.DepositType}
                onChange={(e) =>
                  setForm({ ...form, DepositType: e.target.value })
                }
                className="h-[44px] w-[140px] rounded-xl border border-gray-200 px-4 outline-none focus:ring-2 ring-rose-200"
              >
                <option value="Percentage">%</option>
                <option value="Fixed">Fixed (£)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              value={form.Description}
              onChange={(e) =>
                setForm({ ...form, Description: e.target.value })
              }
              rows={5}
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 resize-none focus:ring-2 ring-rose-200 outline-none"
              placeholder="Enter description"
            />
          </div>

          {/* Upload Image */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Upload Image
            </label>
            <label className="flex h-[140px] cursor-pointer items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) {
                    setImageLabel(f.name);
                    onUpload(f, "ImagePath");
                  }
                }}
              />
              <div className="text-sm text-gray-500 text-center">
                {imageLabel || "Browse or drag image"}
              </div>
            </label>
            {form.ImagePath && (
              <img
                src={form.ImagePath}
                alt="Preview"
                className="mt-3 h-32 w-32 rounded-xl object-cover border"
              />
            )}
          </div>
        </div>

        <div className="col-span-12 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="h-11 w-[160px] rounded-xl bg-rose-300 text-white hover:bg-rose-400 disabled:opacity-60"
          >
            {saving ? <Spinner sm /> : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}
