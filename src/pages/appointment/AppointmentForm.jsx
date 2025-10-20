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

  // 🔹 Status map helpers
  const STATUS_CODE_TO_LABEL = { 0: "Unpaid", 1: "Paid", 2: "Cancelled" };
  const STATUS_LABEL_TO_CODE = { Unpaid: 0, Paid: 1, Cancelled: 2 };

  /**
   * 🔹 Fetch all dependencies (customers, services, employees)
   */
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

  /**
   * 🔹 Fetch existing appointment for edit
   */
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

  /**
   * 🔹 Handle input change
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  /**
   * 🔹 Handle submit (create/update)
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);

      // convert label to numeric before sending
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
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">
          {isEdit ? "Edit Appointment" : "Add New Appointment"}
        </h2>
        <button
          onClick={() => navigate("/dashboard/appointments")}
          className="px-3 py-2 text-sm rounded-md bg-gray-100 hover:bg-gray-200"
        >
          ← Back
        </button>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {/* Customer */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Customer Name
          </label>
          <select
            name="CustomerId"
            value={form.CustomerId}
            onChange={handleChange}
            required
            className="w-full border rounded-md px-3 py-2 text-sm focus:ring-rose-500 focus:border-rose-500"
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
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Service
          </label>
          <select
            name="ServiceId"
            value={form.ServiceId}
            onChange={handleChange}
            required
            className="w-full border rounded-md px-3 py-2 text-sm focus:ring-rose-500 focus:border-rose-500"
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
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Employee
          </label>
          <select
            name="EmployeeId"
            value={form.EmployeeId}
            onChange={handleChange}
            required
            className="w-full border rounded-md px-3 py-2 text-sm focus:ring-rose-500 focus:border-rose-500"
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
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cost
          </label>
          <input
            type="number"
            name="Cost"
            value={form.Cost}
            onChange={handleChange}
            placeholder="e.g. 50.00"
            required
            className="w-full border rounded-md px-3 py-2 text-sm focus:ring-rose-500 focus:border-rose-500"
          />
        </div>

        {/* Deposit */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Deposit
          </label>
          <input
            type="number"
            name="Deposit"
            value={form.Deposit}
            onChange={handleChange}
            placeholder="e.g. 10.00"
            className="w-full border rounded-md px-3 py-2 text-sm focus:ring-rose-500 focus:border-rose-500"
          />
        </div>

        {/* Appointment Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Appointment Date & Time
          </label>
          <input
            type="datetime-local"
            name="StartDateTime"
            value={form.StartDateTime}
            onChange={handleChange}
            required
            className="w-full border rounded-md px-3 py-2 text-sm focus:ring-rose-500 focus:border-rose-500"
          />
        </div>

        {/* Tip */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tip Amount
          </label>
          <input
            type="number"
            name="Tip"
            value={form.Tip}
            onChange={handleChange}
            placeholder="e.g. 5.00"
            className="w-full border rounded-md px-3 py-2 text-sm focus:ring-rose-500 focus:border-rose-500"
          />
        </div>

        {/* Refund */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Refund Amount
          </label>
          <input
            type="number"
            name="RefundAmount"
            value={form.RefundAmount}
            onChange={handleChange}
            placeholder="e.g. 0.00"
            className="w-full border rounded-md px-3 py-2 text-sm focus:ring-rose-500 focus:border-rose-500"
          />
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            name="Status"
            value={form.Status}
            onChange={handleChange}
            className="w-full border rounded-md px-3 py-2 text-sm focus:ring-rose-500 focus:border-rose-500"
          >
            <option>Unpaid</option>
            <option>Paid</option>
            <option>Cancelled</option>
          </select>
        </div>

        {/* Submit */}
        <div className="col-span-2 flex justify-end mt-4">
          <button
            type="submit"
            disabled={saving}
            className={`px-6 py-2 text-white rounded-lg transition ${
              saving
                ? "bg-rose-300 cursor-not-allowed"
                : "bg-rose-600 hover:bg-rose-700"
            }`}
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}
