import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  createAppointment,
  getAppointment,
  updateAppointment,
  listCustomers,
  listServices,
  listEmployees,
} from "../../api/appointment";
import { ChevronLeft } from "lucide-react";
import Spinner from "../../components/Spinner";

export default function AppointmentForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  // 🔹 Form state
  const [form, setForm] = useState({
    CustomerId: "",
    ServiceId: "",
    EmployeeId: "",
    Cost: "",
    Deposit: "",
    StartDateTime: "",
    Tip: "",
    RefundAmount: "",
    Status: "Unpaid",
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [services, setServices] = useState([]);
  const [employees, setEmployees] = useState([]);

  const STATUS_CODE_TO_LABEL = { 0: "Unpaid", 1: "Paid", 2: "Cancelled" };
  const STATUS_LABEL_TO_CODE = { Unpaid: 0, Paid: 1, Cancelled: 2 };

  const fetchDependencies = async () => {
    try {
      setLoading(true);
      const [custRes, servRes, empRes] = await Promise.all([
        listCustomers(),
        listServices(),
        listEmployees(),
      ]);
      setCustomers(custRes?.data ?? custRes ?? []);
      setServices(servRes?.data ?? servRes ?? []);
      setEmployees(empRes?.data ?? empRes ?? []);
    } catch (err) {
      console.error("Failed to load dependencies", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAppointment = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await getAppointment(id);
      const data = res?.data ?? res;
      setForm({
        CustomerId: data.CustomerId ?? "",
        ServiceId: data.ServiceId ?? "",
        EmployeeId: data.EmployeeId ?? "",
        Cost: data.Cost ?? "",
        Deposit: data.Deposit ?? "",
        StartDateTime: data.StartDateTime
          ? new Date(data.StartDateTime).toISOString().slice(0, 16)
          : "",
        Tip: data.Tip ?? "",
        RefundAmount: data.RefundAmount ?? "",
        Status: STATUS_CODE_TO_LABEL[Number(data.Status)] ?? "Unpaid",
      });
    } catch (err) {
      console.error("Failed to load appointment", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDependencies();
    fetchAppointment();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const payload = {
        ...form,
        Status: STATUS_LABEL_TO_CODE[form.Status] ?? 0,
      };
      if (isEdit) {
        await updateAppointment(id, payload);
      } else {
        await createAppointment(payload);
      }
      navigate("/dashboard/appointments");
    } catch (err) {
      console.error("Save failed", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="min-h-screen bg-[#FBF6F6] px-10 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-10">
        <button
          onClick={() => navigate("/dashboard/appointments")}
          className="flex items-center justify-center w-9 h-9 rounded-xl bg-rose-100 hover:bg-rose-200 transition"
        >
          <ChevronLeft className="text-rose-700" size={18} />
        </button>
        <h1 className="text-2xl font-semibold text-gray-800">
          {isEdit ? "Edit Appointment" : "Add New Appointment"}
        </h1>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-10 rounded-2xl shadow-sm max-w-[900px]"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-14 gap-y-7">
          {/* Customer */}
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-2">
              Customer Name
            </label>
            <select
              name="CustomerId"
              value={form.CustomerId}
              onChange={handleChange}
              required
              className="w-full h-[48px] border border-gray-200 rounded-md px-4 text-sm placeholder-gray-400 focus:ring-2 focus:ring-rose-100 focus:border-rose-300"
            >
              <option value="">Select Customer</option>
              {customers.map((c) => (
                <option key={c.Id} value={c.Id}>
                  {c.Name}
                </option>
              ))}
            </select>
          </div>

          {/* Service */}
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-2">
              Service
            </label>
            <select
              name="ServiceId"
              value={form.ServiceId}
              onChange={handleChange}
              required
              className="w-full h-[48px] border border-gray-200 rounded-md px-4 text-sm placeholder-gray-400 focus:ring-2 focus:ring-rose-100 focus:border-rose-300"
            >
              <option value="">Select Service</option>
              {services.map((s) => (
                <option key={s.Id} value={s.Id}>
                  {s.Name}
                </option>
              ))}
            </select>
          </div>

          {/* Employee */}
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-2">
              Employee
            </label>
            <select
              name="EmployeeId"
              value={form.EmployeeId}
              onChange={handleChange}
              required
              className="w-full h-[48px] border border-gray-200 rounded-md px-4 text-sm placeholder-gray-400 focus:ring-2 focus:ring-rose-100 focus:border-rose-300"
            >
              <option value="">Select Employee</option>
              {employees.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name || e.title}
                </option>
              ))}
            </select>
          </div>

          {/* Cost */}
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-2">
              Amount
            </label>
            <input
              type="number"
              name="Cost"
              value={form.Cost}
              onChange={handleChange}
              placeholder="e.g. £87.00"
              required
              className="w-full h-[48px] border border-gray-200 rounded-md px-4 text-sm placeholder-gray-400 focus:ring-2 focus:ring-rose-100 focus:border-rose-300"
            />
          </div>

          {/* Deposit */}
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-2">
              Deposit
            </label>
            <input
              type="number"
              name="Deposit"
              value={form.Deposit}
              onChange={handleChange}
              placeholder="e.g. £25"
              className="w-full h-[48px] border border-gray-200 rounded-md px-4 text-sm placeholder-gray-400 focus:ring-2 focus:ring-rose-100 focus:border-rose-300"
            />
          </div>

          {/* Appointment Date & Time */}
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-2">
              Appointment Date & Time
            </label>
            <input
              type="datetime-local"
              name="StartDateTime"
              value={form.StartDateTime}
              onChange={handleChange}
              required
              className="w-full h-[48px] border border-gray-200 rounded-md px-4 text-sm placeholder-gray-400 focus:ring-2 focus:ring-rose-100 focus:border-rose-300"
            />
          </div>

          {/* Tip */}
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-2">
              Tip Amount
            </label>
            <input
              type="number"
              name="Tip"
              value={form.Tip}
              onChange={handleChange}
              placeholder="e.g. £10.00"
              className="w-full h-[48px] border border-gray-200 rounded-md px-4 text-sm placeholder-gray-400 focus:ring-2 focus:ring-rose-100 focus:border-rose-300"
            />
          </div>

          {/* Refund */}
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-2">
              Refund Amount
            </label>
            <input
              type="number"
              name="RefundAmount"
              value={form.RefundAmount}
              onChange={handleChange}
              placeholder="e.g. £40.00"
              className="w-full h-[48px] border border-gray-200 rounded-md px-4 text-sm placeholder-gray-400 focus:ring-2 focus:ring-rose-100 focus:border-rose-300"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-2">
              Status
            </label>
            <select
              name="Status"
              value={form.Status}
              onChange={handleChange}
              className="w-full h-[48px] border border-gray-200 rounded-md px-4 text-sm placeholder-gray-400 focus:ring-2 focus:ring-rose-100 focus:border-rose-300"
            >
              <option>Unpaid</option>
              <option>Paid</option>
              <option>Cancelled</option>
            </select>
          </div>
        </div>

        {/* Submit */}
        <div className="col-span-2 mt-10">
          <button
            type="submit"
            disabled={saving}
            className={`px-10 py-2.5 text-white rounded-md font-medium transition ${
              saving
                ? "bg-rose-300 cursor-not-allowed"
                : "bg-[#C47B7B] hover:bg-[#b06c6c]"
            }`}
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}
