import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import Spinner from "../../components/Spinner";
import { deleteUploadedFile } from "../../api/service";
import {
  createService,
  updateService,
  getService,
  listServiceCategories,
  uploadGeneric,
} from "../../api/service";
import { ChevronLeft, UploadCloud, ChevronDown } from "lucide-react";

export default function ServiceForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const duplicateId = searchParams.get("duplicate");

  const isEdit = Boolean(id);
  const isDuplicate = Boolean(duplicateId);

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [fileLabel, setFileLabel] = useState("");
  const [imageLabel, setImageLabel] = useState("");
  const [durationType, setDurationType] = useState("mins");
  const [showDurationMenu, setShowDurationMenu] = useState(false);

  const [form, setForm] = useState({
    Name: "",
    CategoryId: "",
    TotalPrice: "",
    DepositType: "Percentage",
    Deposit: "",
    DefaultAppointmentDuration: "",
    DurationUnit: "mins",
    Description: "",
    FilePath: "",
    ImagePath: "",
  });

  // Utility for full asset URL
  const assetUrl = (path) => {
    if (!path) return "";
    // Full URL already?
    if (path.startsWith("http")) return path;

    // If backend returned "storage/uploads/services/..."
    if (path.startsWith("storage/")) {
      const base = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") || window.location.origin;
      return `${base}/${path}`;
    }

    // Default fallback (legacy)
    const base = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") || window.location.origin;
    return `${base}/storage/${path.replace(/^\/?storage\//, "")}`;
  };


  // Boot
  useEffect(() => {
    const boot = async () => {
      try {
        setLoading(true);
        const cats = await listServiceCategories();
        setCategories(cats?.data || cats || []);

        let svcData = null;
        if (isEdit) svcData = (await getService(id))?.data;
        else if (isDuplicate) svcData = (await getService(duplicateId))?.data;

        if (svcData) {
          setForm({
            Name: isDuplicate ? `${svcData?.Name || ""} Copy` : svcData?.Name || "",
            CategoryId: svcData?.CategoryId || "",
            TotalPrice: svcData?.TotalPrice || "",
            DepositType:
              svcData?.DepositType === "1" ? "Fixed" : "Percentage",
            Deposit: svcData?.Deposit || "",
            DefaultAppointmentDuration: svcData?.DefaultAppointmentDuration || "",
            DurationUnit: svcData?.DurationUnit || "mins",
            Description: svcData?.Description || "",
            FilePath: svcData?.FilePath || "",
            ImagePath: svcData?.ImagePath || "",
          });
          setDurationType(svcData?.DurationUnit || "mins");
          setFileLabel(svcData?.FilePath?.split("/").pop() || "");
          setImageLabel(svcData?.ImagePath?.split("/").pop() || "");
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    boot();
  }, [id, duplicateId, isEdit, isDuplicate]);

  // Upload
  const handleUpload = async (file, key) => {
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await uploadGeneric(fd);
      const path = res?.path || res?.url || res?.data?.path;
      if (!path) return alert("Upload failed: no file path returned.");

      if (key === "FilePath") {
        setForm((p) => ({ ...p, FilePath: path }));
        setFileLabel(file.name);
      } else {
        setForm((p) => ({ ...p, ImagePath: path }));
        setImageLabel(file.name);
      }
    } catch {
      alert("Upload failed. Please try again.");
    }
  };

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, DurationUnit: durationType };
      if (isEdit) await updateService(id, payload);
      else await createService(payload);
      navigate("/dashboard/services");
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to save service.");
    } finally {
      setSaving(false);
    }
  };

  // Loader
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#FBF8F7] text-gray-600">
        <Spinner className="h-5 w-5 mb-3" />
        <p className="text-sm">
          {isEdit ? "Loading service details..." : "Loading categories…"}
        </p>
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
          {isEdit
            ? "Edit Service"
            : isDuplicate
            ? "Duplicate Service"
            : "Add New Service"}
        </h1>
      </div>

      {/* FORM */}
      <form
        onSubmit={handleSubmit}
        autoComplete="off"
        className="grid grid-cols-12 gap-x-8 gap-y-8"
      >
        {/* LEFT */}
        <div className="col-span-12 md:col-span-6 space-y-6">
          {/* Name */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Service Name
            </label>
            <input
              value={form.Name}
              onChange={(e) => setForm({ ...form, Name: e.target.value })}
              placeholder="e.g Hair Color"
              required
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-rose-200"
            />
          </div>

          {/* Price */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Price
            </label>
            <input
              type="text"
              value={form.TotalPrice}
              onChange={(e) => setForm({ ...form, TotalPrice: e.target.value })}
              placeholder="e.g. £87.00"
              required
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-rose-200"
            />
          </div>

          {/* Duration */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Duration
            </label>
            <div className="relative flex rounded-xl border border-gray-200 bg-white focus-within:ring-2 focus-within:ring-rose-200">
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
                placeholder="e.g. 25"
                className="w-full rounded-l-xl border-none px-4 py-2.5 text-sm placeholder:text-gray-400 outline-none"
              />
              <button
                type="button"
                onClick={() => setShowDurationMenu(!showDurationMenu)}
                className="flex items-center justify-between w-[100px] border-l border-gray-200 px-3 text-sm text-gray-600"
              >
                {durationType}
                <ChevronDown size={16} className="text-gray-500" />
              </button>
              {showDurationMenu && (
                <div className="absolute right-0 top-full z-20 mt-1 w-[100px] rounded-lg border border-gray-200 bg-white shadow-md">
                  {["mins", "hours"].map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => {
                        setDurationType(opt);
                        setShowDurationMenu(false);
                      }}
                      className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Upload File */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Upload File
            </label>
            <div className="flex h-[140px] items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white relative">
              {!form.FilePath ? (
                <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer">
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleUpload(f, "FilePath");
                    }}
                  />
                  <div className="text-center text-[13px] text-gray-500">
                    <UploadCloud
                      size={18}
                      className="mx-auto mb-2 text-rose-400 opacity-70"
                    />
                    <p>Drag file to upload</p>
                    <p className="my-1">or</p>
                    <p className="underline">Browse file</p>
                  </div>
                </label>
              ) : (
                <div className="flex flex-col items-center">
                  <a
                    href={assetUrl(form.FilePath)}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-rose-500 underline"
                  >
                    {fileLabel || "View Uploaded File"}
                  </a>
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        if (form.FilePath) await deleteUploadedFile(form.FilePath);
                        setForm((p) => ({ ...p, FilePath: "" }));
                        setFileLabel("");
                      } catch {
                        alert("Failed to delete uploaded file.");
                      }
                    }}
                    className="mt-2 text-xs text-gray-500 underline hover:text-rose-500"
                  >
                    Remove
                  </button>
                </div>

              )}
            </div>
          </div>

          {/* Upload Image */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Upload Image
            </label>
            <div className="flex h-[140px] items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white relative">
              {!form.ImagePath ? (
                <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleUpload(f, "ImagePath");
                    }}
                  />
                  <div className="text-center text-[13px] text-gray-500">
                    <UploadCloud
                      size={18}
                      className="mx-auto mb-2 text-rose-400 opacity-70"
                    />
                    <p>Drag image to upload</p>
                    <p className="my-1">or</p>
                    <p className="underline">Browse image</p>
                  </div>
                </label>
              ) : (
                <div className="flex flex-col items-center">
                  <img
                    src={assetUrl(form.ImagePath)}
                    alt="Preview"
                    className="h-[90px] w-[90px] rounded-lg object-cover"
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        if (form.ImagePath) await deleteUploadedFile(form.ImagePath);
                        setForm((p) => ({ ...p, ImagePath: "" }));
                        setImageLabel("");
                      } catch {
                        alert("Failed to delete image file.");
                      }
                    }}
                    className="mt-2 text-xs text-gray-500 underline hover:text-rose-500"
                  >
                    Remove
                  </button>
                </div>

              )}
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="col-span-12 md:col-span-6 space-y-6">
          {/* Category */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Select Category
            </label>
            <select
              value={form.CategoryId}
              onChange={(e) => setForm({ ...form, CategoryId: e.target.value })}
              required
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-rose-200"
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
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Deposit
            </label>
            <div className="flex gap-3">
              <input
                type="number"
                step="0.01"
                value={form.Deposit}
                onChange={(e) => setForm({ ...form, Deposit: e.target.value })}
                placeholder="e.g. 25"
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-rose-200"
              />
              <select
                value={form.DepositType}
                onChange={(e) => setForm({ ...form, DepositType: e.target.value })}
                className="h-[44px] w-[160px] rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-rose-200"
              >
                <option value="Percentage">Percentage</option>
                <option value="Fixed">Fixed price</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              rows={5}
              value={form.Description}
              onChange={(e) => setForm({ ...form, Description: e.target.value })}
              placeholder="Enter description"
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm placeholder:text-gray-400 resize-none outline-none focus:ring-2 focus:ring-rose-200"
            />
          </div>
        </div>

        {/* SAVE */}
        <div className="col-span-12 flex justify-end pt-4">
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
