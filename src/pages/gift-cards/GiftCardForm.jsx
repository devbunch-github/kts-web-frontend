import { useEffect, useState, useRef  } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { createGiftCard, updateGiftCard, getGiftCard } from "@/api/giftCards";
import { listServices } from "@/api/appointment";
import { ArrowLeft, Upload } from "lucide-react";
import dayjs from "dayjs";

export default function GiftCardForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const fileRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [services, setServices] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);
  const [form, setForm] = useState({
    code: "",
    title: "",
    service_id: "",
    discount_type: "fixed",
    discount_amount: "",
    start_date: "",
    end_date: "",
    notes: "",
    image: null,
    is_active: true,
  });

  const inputBase =
    "w-full border border-[#E4E4E4] bg-white rounded-lg px-3.5 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-[#C88D8D] transition";

  useEffect(() => {
    (async () => {
      try {
        setFetching(true);
        const s = await listServices();
        setServices(s?.data ?? s ?? []);
        if (isEdit) {
            const gc = await getGiftCard(id);
            
            // ✅ Convert date formats from DD-MM-YYYY → YYYY-MM-DD
            const parseDate = (d) => {
                if (!d) return "";
                const parts = d.split("-");
                if (parts.length === 3) {
                    // if already in DD-MM-YYYY format
                    return `${parts[2]}-${parts[1]}-${parts[0]}`;
                }
                return dayjs(d).format("YYYY-MM-DD");
            };
            setForm({
                code: gc.code || "",
                title: gc.title || "",
                service_id: gc.service_id || "",
                discount_type: gc.discount_type || "fixed",
                discount_amount: gc.discount_amount || "",
                start_date: gc.start_date || "",
                end_date: gc.end_date || "",
                notes: gc.notes || "",
                is_active: gc.is_active ?? true,
            });

            if (gc.image_url) setImagePreview(gc.image_url);
        }

      } catch {
        toast.error("Failed to load gift card");
      } finally {
        setFetching(false);
      }
    })();
  }, [id]);

  const handleChange = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleImage = (file) => {
    if (!file) return;
    setForm((p) => ({ ...p, image: file }));
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!form.title || !form.code || !form.discount_amount) {
      toast.error("Please fill all required fields");
      return;
    }

    const data = new FormData();
    Object.entries(form).forEach(([k, v]) => {
        if (v !== null && v !== undefined) {
        // ✅ normalize boolean for Laravel
        if (k === "is_active") data.append(k, v ? 1 : 0);
        else data.append(k, v);
        }
    });

    setLoading(true);
    try {
      if (isEdit) {
        await updateGiftCard(id, data);
        toast.success("Gift card updated successfully!");
      } else {
        await createGiftCard(data);
        toast.success("Gift card created successfully!");
      }
      setTimeout(() => navigate("/dashboard/gift-cards"), 800);
    } catch (err) {
      toast.error(err.response?.data?.message || "Error saving gift card");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F6F6] px-4 md:px-6 py-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg bg-[#C88D8D] text-white hover:bg-[#B37878] transition"
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-2xl font-semibold text-[#2F2F2F]">
            {isEdit ? "Edit Gift Card" : "Add New Gift Card"}
          </h1>
        </div>

        {/* Loader */}
        {fetching ? (
          <div className="bg-white h-[320px] flex items-center justify-center rounded-xl shadow-sm text-[#C88D8D]">
            Loading...
          </div>
        ) : (
          <>
            {/* Form Grid */}
            <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Code
                  </label>
                  <input
                    className={inputBase}
                    placeholder='e.g. "XMA529"'
                    value={form.code}
                    onChange={(e) => handleChange("code", e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Services
                  </label>
                  <select
                    className={inputBase}
                    value={form.service_id}
                    onChange={(e) => handleChange("service_id", e.target.value)}
                  >
                    <option value="">All services</option>
                    {services.map((s) => (
                      <option key={s.id ?? s.Id} value={s.id ?? s.Id}>
                        {s.name ?? s.Name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Validity Start Date
                  </label>
                  <input
                    type="date"
                    className={inputBase}
                    value={form.start_date}
                    onChange={(e) =>
                      handleChange("start_date", e.target.value)
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    rows={4}
                    className={inputBase}
                    value={form.notes}
                    onChange={(e) => handleChange("notes", e.target.value)}
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <label className="text-sm text-gray-700">
                    Gift Card Activated
                  </label>
                  <button
                    type="button"
                    onClick={() => handleChange("is_active", !form.is_active)}
                    className={`relative w-11 h-6 rounded-full transition-all duration-300 ${
                      form.is_active ? "bg-[#4ADE80]" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`absolute left-1 top-1 h-4 w-4 bg-white rounded-full transform transition-transform ${
                        form.is_active ? "translate-x-5" : ""
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title
                  </label>
                  <input
                    className={inputBase}
                    placeholder="Voucher Title"
                    value={form.title}
                    onChange={(e) => handleChange("title", e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Discount
                  </label>
                  <input
                    type="number"
                    className={inputBase}
                    placeholder="e.g. £10"
                    value={form.discount_amount}
                    onChange={(e) =>
                      handleChange("discount_amount", e.target.value)
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Validity End Date
                  </label>
                  <input
                    type="date"
                    className={inputBase}
                    value={form.end_date}
                    onChange={(e) => handleChange("end_date", e.target.value)}
                  />
                </div>

                {/* Upload Image */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Upload Image
                    </label>

                    <div
                        className="border-2 border-dashed border-[#D0D0D0] rounded-lg p-5 text-center cursor-pointer hover:border-[#C88D8D] transition relative"
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                        e.preventDefault();
                        handleImage(e.dataTransfer.files[0]);
                        }}
                    >
                        {imagePreview ? (
                        <img
                            src={imagePreview}
                            alt="preview"
                            className="mx-auto h-36 object-contain rounded-md"
                        />
                        ) : (
                        <div className="text-gray-400 text-sm select-none">
                            <Upload className="w-6 h-6 mx-auto mb-1 text-[#C88D8D]" />
                            <p>
                            Drag image to upload <br />
                            or{" "}
                            <button
                                type="button"
                                className="text-[#C88D8D] font-medium underline"
                                onClick={(e) => {
                                e.preventDefault();
                                fileRef.current?.click(); // ✅ trigger hidden input
                                }}
                            >
                                browse image
                            </button>
                            </p>
                            <p className="text-xs mt-1 text-gray-400">
                            Supports JPG, PNG, WEBP
                            </p>
                        </div>
                        )}

                        {/* Hidden file input */}
                        <input
                            ref={fileRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleImage(e.target.files[0])}
                        />
                    </div>
                    </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end mt-8">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-10 py-2.5 rounded-md text-white text-base font-medium bg-[#C88D8D] hover:bg-[#B37878] transition disabled:opacity-60"
              >
                {loading ? "Saving..." : "Save"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
