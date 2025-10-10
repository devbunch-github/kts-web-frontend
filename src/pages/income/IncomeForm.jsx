import { useEffect, useState } from "react";
import { createIncome, getIncome, updateIncome } from "../../api/income";
import { useNavigate, useParams } from "react-router-dom";
import axios from "../../api/http";

export default function IncomeForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const nav = useNavigate();

  const [form, setForm] = useState({
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

  useEffect(() => {
    (async () => {
      try {
        const catRes = await axios.get("/api/categories");
        const svcRes = await axios.get("/api/services");

        setCategories(catRes.data.data ?? catRes.data ?? []);
        setServices(svcRes.data.data ?? svcRes.data ?? []);

        if (isEdit) {
          const res = await getIncome(id);
          const data = res.data ?? res;

          console.log("Loaded income:", data);

          setForm({
            CustomerName: data.customer?.Name ?? data.Customer?.Name ?? "",
            CustomerEmail: data.customer?.Email ?? data.Customer?.Email ?? "",
            CustomerPhone: data.customer?.MobileNumber ?? data.Customer?.MobileNumber ?? "",
            CategoryId: data.CategoryId ? String(data.CategoryId) : "",
            ServiceId: data.ServiceId ? String(data.ServiceId) : "",
            Amount: data.Amount ?? "",
            PaymentDateTime: data.PaymentDateTime?.slice(0, 16) ?? "",
            Description: data.Description ?? "",
            Notes: data.Notes ?? "",
            PaymentMethod: data.PaymentMethod ?? "",
          });
        } else {
          const now = new Date();
          const iso = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
            .toISOString()
            .slice(0, 16);
          setForm((f) => ({ ...f, PaymentDateTime: iso }));
        }
      } catch (err) {
        console.error("Error loading form data:", err);
      }
    })();
  }, [id, isEdit]);


  const on = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const save = async () => {
    try {
      const payload = {
        ...form,
        CategoryId: form.CategoryId ? Number(form.CategoryId) : null,
        ServiceId: form.ServiceId ? Number(form.ServiceId) : null,
        Amount: Number(form.Amount || 0),
      };
      if (isEdit) await updateIncome(id, payload);
      else await createIncome(payload);
      nav("/dashboard/income");
    } catch (err) {
      console.error("Error saving income:", err);
      alert("Failed to save income. Please try again.");
    }
  };

  return (
    <div className="p-6">
      <button
        onClick={() => nav(-1)}
        className="mb-6 inline-flex h-8 w-8 items-center justify-center rounded-xl bg-[#c98383]/30 text-[#a96464]"
        aria-label="Back"
      >
        ‹
      </button>

      <h1 className="text-[28px] font-semibold text-[#222] mb-8">
        {isEdit ? "Edit Income" : "Add New Income/Sales"}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Customer Name */}
        <div>
          <label className="block text-sm text-[#333] mb-2">Customer Name</label>
          <input
            value={form.CustomerName}
            onChange={on("CustomerName")}
            placeholder="Enter name"
            className="w-full h-[48px] px-4 rounded-xl border border-[#e8e2e2] bg-white focus:outline-none"
          />
        </div>

        {/* Income Amount */}
        <div>
          <label className="block text-sm text-[#333] mb-2">Income Amount</label>
          <input
            value={form.Amount}
            onChange={on("Amount")}
            placeholder="e.g. £87.00"
            className="w-full h-[48px] px-4 rounded-xl border border-[#e8e2e2] bg-white focus:outline-none"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm text-[#333] mb-2">Select Category</label>
          <select
            value={form.CategoryId}
            onChange={on("CategoryId")}
            className="w-full h-[48px] px-4 rounded-xl border border-[#e8e2e2] bg-white focus:outline-none"
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
          <label className="block text-sm text-[#333] mb-2">Select Services</label>
          <select
            value={form.ServiceId}
            onChange={on("ServiceId")}
            className="w-full h-[48px] px-4 rounded-xl border border-[#e8e2e2] bg-white focus:outline-none"
          >
            <option value="">Select…</option>
            {services.map((s) => (
              <option key={s.Id} value={String(s.Id)}>
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
            placeholder="Enter description here"
            className="w-full min-h-[140px] px-4 py-3 rounded-xl border border-[#e8e2e2] bg-white focus:outline-none"
          />
        </div>

        <div className="md:col-span-2 flex justify-end">
          <button
            onClick={save}
            className="h-[48px] rounded-2xl bg-[#c98383] px-8 text-white font-semibold hover:opacity-90"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
