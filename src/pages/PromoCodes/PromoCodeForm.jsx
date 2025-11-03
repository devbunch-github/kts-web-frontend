import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import dayjs from "dayjs";
import {
  createPromoCode,
  updatePromoCode,
  getPromoCode,
} from "@/api/promoCode";
import { listServices } from "@/api/appointment";
import { ArrowLeft } from "lucide-react";

// 🎨 Theme tokens
const roseBg = "bg-[#F6EAEA]";
const roseBtn = "bg-[#D49A9A] hover:bg-[#C38888]";
const textDark = "text-[#2F2F2F]";
const softInput =
  "border border-gray-200 focus:border-[#C48888] focus:ring-0 rounded-md";

export default function PromoCodeForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);   // saving
  const [fetching, setFetching] = useState(false); // fetching existing
  const [services, setServices] = useState([]);

  const [form, setForm] = useState({
    code: "",
    title: "",
    service_id: "",
    discount_type: "percent",
    discount_value: "",
    start_date: "",
    end_date: "",
    notes: "",
    status: 1,
  });

  // 🔹 Load data
  useEffect(() => {
    (async () => {
      try {
        setFetching(true);
        const res = await listServices();
        setServices(res?.data ?? res ?? []);

        if (isEdit) {
          const promo = await getPromoCode(id);
          setForm({
            code: promo.code || "",
            title: promo.title || "",
            service_id: promo.service_id || "",
            discount_type: promo.discount_type || "percent",
            discount_value: promo.discount_value || "",
            start_date: promo.start_date || "",
            end_date: promo.end_date || "",
            notes: promo.notes || "",
            status: promo.raw_status ?? 1,
          });
        }
      } catch (err) {
        console.error("Error loading promo code:", err);
        toast.error("Failed to load promo code or services");
      } finally {
        setFetching(false);
      }
    })();
  }, [id, isEdit]);

  const handleChange = (key, value) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async () => {
    if (!form.code || !form.title || !form.discount_value || !form.start_date) {
      toast.error("Please fill all required fields");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...form,
        discount_value: Number(form.discount_value),
      };
      if (isEdit) {
        await updatePromoCode(id, payload);
        toast.success("Promo code updated successfully!");
      } else {
        await createPromoCode(payload);
        toast.success("Promo code created successfully!");
      }
      setTimeout(() => navigate("/dashboard/promo-codes"), 800);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Error saving promo code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen ${roseBg} p-6`}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg bg-[#D49A9A] text-white hover:bg-[#C38888]"
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className={`text-2xl font-semibold ${textDark}`}>
            {isEdit ? "Edit Promo Code" : "Add New Promo Code"}
          </h1>
        </div>

        {/* 🔄 Fetch Loader */}
        {fetching ? (
          <div className="flex justify-center items-center bg-white rounded-2xl shadow-sm h-[320px]">
            <div className="flex flex-col items-center gap-3 text-[#c98383]">
              <div className="w-10 h-10 border-4 border-[#f3d6d6] border-t-[#c98383] rounded-full animate-spin"></div>
              <p className="text-sm font-medium text-gray-600">
                Loading promo code details...
              </p>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl bg-white shadow-sm p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Code */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Code <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder='e.g. "XMA529"'
                  className={`w-full px-3 py-2 ${softInput}`}
                  value={form.code}
                  onChange={(e) => handleChange("code", e.target.value)}
                />
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Voucher Title"
                  className={`w-full px-3 py-2 ${softInput}`}
                  value={form.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                />
              </div>

              {/* Service */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Select Service
                </label>
                <select
                  className={`w-full px-3 py-2 ${softInput}`}
                  value={form.service_id}
                  onChange={(e) =>
                    handleChange("service_id", e.target.value || null)
                  }
                >
                  <option value="">All services</option>
                  {services.map((s) => (
                    <option key={s.Id ?? s.id} value={s.Id ?? s.id}>
                      {s.Name ?? s.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Discount */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Discount <span className="text-rose-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="e.g. 25"
                    className={`flex-1 px-3 py-2 ${softInput}`}
                    value={form.discount_value}
                    onChange={(e) =>
                      handleChange("discount_value", e.target.value)
                    }
                  />
                  <select
                    className={`w-40 px-3 py-2 ${softInput}`}
                    value={form.discount_type}
                    onChange={(e) =>
                      handleChange("discount_type", e.target.value)
                    }
                  >
                    <option value="percent">Percentage</option>
                    <option value="fixed">Fixed price</option>
                  </select>
                </div>
              </div>

              {/* Start Date */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Validity Start Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  className={`w-full px-3 py-2 ${softInput}`}
                  value={form.start_date}
                  onChange={(e) => handleChange("start_date", e.target.value)}
                />
              </div>

              {/* End Date */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Validity End Date
                </label>
                <input
                  type="date"
                  className={`w-full px-3 py-2 ${softInput}`}
                  value={form.end_date}
                  onChange={(e) => handleChange("end_date", e.target.value)}
                />
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Description
                </label>
                <textarea
                  rows={4}
                  className={`w-full px-3 py-2 ${softInput}`}
                  value={form.notes}
                  onChange={(e) => handleChange("notes", e.target.value)}
                />
              </div>

              {/* Toggle */}
              <div className="md:col-span-2 flex items-center gap-3 mt-2">
                <label className="text-sm font-medium text-gray-600">
                  Promo Code Activated
                </label>
                <button
                  type="button"
                  onClick={() => handleChange("status", form.status ? 0 : 1)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                    form.status ? "bg-[#C48888]" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                      form.status ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end mt-10">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className={`px-8 py-2 text-white font-medium rounded-md ${roseBtn} disabled:opacity-60`}
              >
                {loading ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
