import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
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
  const [searchParams] = useSearchParams();
  const duplicateId = searchParams.get("duplicate");

  const isEdit = Boolean(id);
  const isDuplicate = Boolean(duplicateId);

  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [fileLabel, setFileLabel] = useState("");
  const [imageLabel, setImageLabel] = useState("");

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

  // Boot: load categories + data
  useEffect(() => {
    const boot = async () => {
      try {
        const cats = await listServiceCategories();
        setCategories(cats?.data || cats || []);

        let svcData = null;

        if (isEdit) {
          const data = await getService(id);
          svcData = data?.data || data;
        } else if (isDuplicate) {
          const data = await getService(duplicateId);
          svcData = data?.data || data;
        }

        if (svcData) {
          setForm({
            Name: isDuplicate ? `${svcData?.Name || ""} Copy` : svcData?.Name || "",
            CategoryId: svcData?.CategoryId || "",
            TotalPrice: svcData?.TotalPrice || "",
            DepositType:
              svcData?.DepositType === "0"
                ? "Percentage"
                : svcData?.DepositType === "1"
                ? "Fixed"
                : "Percentage",
            Deposit: svcData?.Deposit || "",
            DefaultAppointmentDuration:
              svcData?.DefaultAppointmentDuration || "",
            Description: svcData?.Description || "",
            FilePath: svcData?.FilePath || "",
            ImagePath: svcData?.ImagePath || "",
          });

          setFileLabel(svcData?.FilePath ? svcData.FilePath.split("/").pop() : "");
          setImageLabel(svcData?.ImagePath ? svcData.ImagePath.split("/").pop() : "");
        }
      } catch (err) {
        console.error(err);
      }
    };
    boot();
  }, [id, duplicateId, isEdit, isDuplicate]);

  // File upload handler
  const handleUpload = async (file, key) => {
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await uploadGeneric(fd);
      const path = res?.path || res?.url || res?.data?.path;

      if (!path) return alert("Upload failed: no file path returned.");

      if (key === "FilePath") {
        setForm((prev) => ({ ...prev, FilePath: path }));
        setFileLabel(file.name);
      } else if (key === "ImagePath") {
        setForm((prev) => ({ ...prev, ImagePath: path }));
        setImageLabel(file.name);
      }
    } catch (err) {
      alert("Upload failed. Please try again.");
    }
  };

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        Name: form.Name,
        CategoryId: form.CategoryId,
        TotalPrice: form.TotalPrice,
        DepositType: form.DepositType,
        Deposit: form.Deposit,
        DefaultAppointmentDuration: form.DefaultAppointmentDuration,
        Description: form.Description,
        FilePath: form.FilePath,
        ImagePath: form.ImagePath,
      };

      if (isEdit) {
        await updateService(id, payload);
      } else {
        await createService(payload);
      }

      navigate("/dashboard/services");
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to save service.");
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
          {isEdit
            ? "Edit Service"
            : isDuplicate
            ? "Duplicate Service"
            : "Add New Service"}
        </h1>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-12 gap-x-6 gap-y-6"
        autoComplete="off"
      >
        {/* LEFT COLUMN */}
        <div className="col-span-12 md:col-span-6 space-y-5">
          {/* Name */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Service Name
            </label>
            <input
              value={form.Name}
              onChange={(e) => setForm({ ...form, Name: e.target.value })}
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 outline-none ring-rose-200 focus:ring-2"
              placeholder="e.g Hair Color"
              required
            />
          </div>

          {/* Price */}
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
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 outline-none ring-rose-200 focus:ring-2"
              placeholder="e.g. 87.00"
              required
            />
          </div>

          {/* Duration */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Duration (mins)
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
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 outline-none ring-rose-200 focus:ring-2"
              placeholder="e.g. 30"
            />
          </div>

          {/* Upload File */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Upload File
            </label>
            <label className="flex h-[140px] cursor-pointer items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white relative overflow-hidden">
              <input
                type="file"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleUpload(f, "FilePath");
                }}
              />
              {form.FilePath ? (
                <div className="text-center">
                  <a
                    href={`/${form.FilePath}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-rose-500 underline"
                  >
                    {fileLabel || "View Uploaded File"}
                  </a>
                </div>
              ) : (
                <div className="text-center text-sm text-gray-500">
                  <div>Drag file to upload</div>
                  <div className="my-1">or</div>
                  <div className="underline">Browse file</div>
                </div>
              )}
            </label>
          </div>

          {/* Upload Image */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Upload Image
            </label>
            <label className="flex h-[140px] cursor-pointer items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white relative overflow-hidden">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleUpload(f, "ImagePath");
                }}
              />
              {form.ImagePath ? (
                <div className="flex flex-col items-center">
                  <img
                    src={`${form.ImagePath}`}
                    alt="Preview"
                    className="h-[90px] w-[90px] rounded-lg object-cover"
                  />
                  <span className="mt-2 text-xs text-gray-500">{imageLabel}</span>
                </div>
              ) : (
                <div className="text-center text-sm text-gray-500">
                  <div>Drag image to upload</div>
                  <div className="my-1">or</div>
                  <div className="underline">Browse image</div>
                </div>
              )}
            </label>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="col-span-12 md:col-span-6 space-y-5">
          {/* Category */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Select Category
            </label>
            <select
              value={form.CategoryId}
              onChange={(e) =>
                setForm({ ...form, CategoryId: e.target.value })
              }
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 outline-none ring-rose-200 focus:ring-2"
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

          {/* Deposit */}
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
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 outline-none ring-rose-200 focus:ring-2"
                placeholder="e.g. 25"
              />
              <select
                value={form.DepositType}
                onChange={(e) =>
                  setForm({ ...form, DepositType: e.target.value })
                }
                className="h-[44px] w-[160px] rounded-xl border border-gray-200 bg-white px-4 outline-none ring-rose-200 focus:ring-2"
              >
                <option value="Percentage">Percentage</option>
                <option value="Fixed">Fixed price</option>
              </select>
            </div>
          </div>

          {/* Description */}
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
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 resize-none outline-none ring-rose-200 focus:ring-2"
              placeholder="Enter description"
            />
          </div>
        </div>

        {/* Save */}
        <div className="col-span-12 flex justify-end">
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
