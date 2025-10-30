import { useEffect, useState } from "react";
import { createIncome, getIncome, updateIncome } from "../../api/income";
import { useNavigate, useParams } from "react-router-dom";
import axios from "../../api/http";
import toast from "react-hot-toast";

export default function IncomeForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const nav = useNavigate();

  const [form, setForm] = useState({
    // ✅ include CustomerId in state
    CustomerId: "",
    CustomerName: "",
    CustomerEmail: "",
    CustomerPhone: "",
    CategoryId: "",
    ServiceId: "",
    Amount: "",
    PaymentDateTime: "",
    Description: "",
    Notes: "",
    PaymentMethod: "",
  });

  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);   // saving state
  const [fetching, setFetching] = useState(false); // fetch-on-edit state

  useEffect(() => {
    (async () => {
      try {
        setFetching(true);

        const [catRes, svcRes] = await Promise.all([
          axios.get("/api/categories"),
          axios.get("/api/services"),
        ]);

        setCategories(catRes.data.data ?? catRes.data ?? []);
        setServices(svcRes.data.data ?? svcRes.data ?? []);

        if (isEdit) {
          const res = await getIncome(id);
          const data = res?.data ?? res ?? {};

          setForm({
            CustomerId: data.CustomerId
              ? String(data.CustomerId)
              : data.customer?.Id
              ? String(data.customer.Id)
              : "",

            CustomerName: data.customer?.Name ?? data.Customer?.Name ?? "",
            CustomerEmail: data.customer?.Email ?? data.Customer?.Email ?? "",
            CustomerPhone:
              data.customer?.MobileNumber ?? data.Customer?.MobileNumber ?? "",

            CategoryId: data.CategoryId ? String(data.CategoryId) : "",
            ServiceId: data.ServiceId ? String(data.ServiceId) : "",
            Amount: data.Amount ?? "",
            PaymentDateTime: data.PaymentDateTime?.slice(0, 16) ?? "",
            Description: data.Description ?? "",
            Notes: data.Notes ?? "",
            PaymentMethod: data.PaymentMethod ?? "",
          });
        } else {
          // default current datetime
          const now = new Date();
          const iso = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
            .toISOString()
            .slice(0, 16);
          setForm((f) => ({ ...f, PaymentDateTime: iso }));
        }
      } catch (err) {
        console.error("Error loading form data:", err);
        toast.error("Failed to load categories or services.");
      } finally {
        setFetching(false);
      }
    })();
  }, [id, isEdit]);

  const on = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const save = async () => {
    setLoading(true);
    try {
      const payload = {
        ...form,
        // ✅ send CustomerId (number or null); keeps link on update
        CustomerId: form.CustomerId ? Number(form.CustomerId) : null,
        CategoryId: form.CategoryId ? Number(form.CategoryId) : null,
        ServiceId: form.ServiceId ? Number(form.ServiceId) : null,
        Amount: Number(form.Amount || 0),
      };

      if (isEdit) {
        await updateIncome(id, payload);
        toast.success("Income updated successfully!");
      } else {
        await createIncome(payload);
        toast.success("Income added successfully!");
      }

      setTimeout(() => nav("/dashboard/income"), 800);
    } catch (err) {
      console.error("Error saving income:", err);

      if (err.response?.status === 422) {
        const messages = Object.values(err.response.data.errors || {}).flat();
        if (messages.length) {
          messages.forEach((m) =>
            toast.error(m, {
              duration: 4000,
              style: { background: "#fff", color: "#333", border: "1px solid #f3d6d6" },
              iconTheme: { primary: "#c98383", secondary: "#fff" },
            })
          );
          window.scrollTo({ top: 0, behavior: "smooth" });
          setLoading(false);
          return;
        }
      }

      toast.error("Failed to save income. Please review the fields and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 min-h-screen bg-[#faf8f8]">
      {/* Back */}
      <button
        onClick={() => nav(-1)}
        className="mb-6 inline-flex h-8 w-8 items-center justify-center rounded-xl bg-[#c98383]/30 text-[#a96464] hover:bg-[#c98383]/40"
        aria-label="Back"
      >
        ‹
      </button>

      <h1 className="text-[28px] font-semibold text-[#222] mb-8">
        {isEdit ? "Edit Income" : "Add New Income/Sales"}
      </h1>

      {/* Fetching loader */}
      {fetching ? (
        <div className="flex justify-center items-center bg-white rounded-2xl shadow-sm h-[300px]">
          <div className="flex flex-col items-center gap-3 text-[#c98383]">
            <div className="w-10 h-10 border-4 border-[#f3d6d6] border-t-[#c98383] rounded-full animate-spin"></div>
            <p className="text-sm font-medium text-gray-600">Loading income details...</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white p-6 rounded-2xl shadow-sm">
          {/* Customer Name */}
          <div>
            <label className="block text-sm text-[#333] mb-2">Customer Name</label>
            <input
              value={form.CustomerName}
              onChange={on("CustomerName")}
              placeholder="Enter customer name"
              className="w-full h-[48px] px-4 rounded-xl border border-[#e8e2e2] bg-white focus:ring-1 focus:ring-[#c98383]/70 outline-none"
            />
          </div>

          {/* Income Amount */}
          <div>
            <label className="block text-sm text-[#333] mb-2">Income Amount (£)</label>
            <input
              type="number"
              value={form.Amount}
              onChange={on("Amount")}
              placeholder="e.g. 87.00"
              className="w-full h-[48px] px-4 rounded-xl border border-[#e8e2e2] bg-white focus:ring-1 focus:ring-[#c98383]/70 outline-none"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm text-[#333] mb-2">Select Category</label>
            <select
              value={form.CategoryId}
              onChange={on("CategoryId")}
              className="w-full h-[48px] px-4 rounded-xl border border-[#e8e2e2] bg-white focus:ring-1 focus:ring-[#c98383]/70 outline-none"
            >
              <option value="">Select…</option>
              {categories.map((c) => (
                <option key={c.Id ?? c.id} value={String(c.Id ?? c.id)}>
                  {c.Name || "(Unnamed Category)"}
                </option>
              ))}
            </select>
          </div>

          {/* Service */}
          <div>
            <label className="block text-sm text-[#333] mb-2">Select Service</label>
            <select
              value={form.ServiceId}
              onChange={on("ServiceId")}
              className="w-full h-[48px] px-4 rounded-xl border border-[#e8e2e2] bg-white focus:ring-1 focus:ring-[#c98383]/70 outline-none"
            >
              <option value="">Select…</option>
              {services.map((s) => (
                <option key={s.Id ?? s.id} value={String(s.Id ?? s.id)}>
                  {s.Name}
                </option>
              ))}
            </select>
          </div>

          {/* Description / Notes */}
          <div className="md:col-span-2">
            <label className="block text-sm text-[#333] mb-2">Income Description</label>
            <textarea
              value={form.Notes}
              onChange={on("Notes")}
              placeholder="Enter income details here"
              className="w-full min-h-[140px] px-4 py-3 rounded-xl border border-[#e8e2e2] bg-white focus:ring-1 focus:ring-[#c98383]/70 outline-none"
            />
          </div>

          <div className="md:col-span-2 flex justify-end">
            <button
              onClick={save}
              disabled={loading}
              className={`h-[48px] rounded-2xl px-8 text-white font-semibold transition ${
                loading ? "bg-[#c98383]/60 cursor-not-allowed" : "bg-[#c98383] hover:bg-[#b87474]"
              }`}
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
