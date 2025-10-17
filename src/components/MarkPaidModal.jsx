import React, { useState, useEffect } from "react";

export default function MarkPaidModal({ open, setOpen, onConfirm, selectedCount, selectedAppointments = [] }) {
  const [tipValues, setTipValues] = useState({});

  useEffect(() => {
    if (open) {
      const initialTips = {};
      selectedAppointments.forEach((a) => {
        initialTips[a.Id] = a.Tip || 0;
      });
      setTipValues(initialTips);
    }
  }, [open, selectedAppointments]);

  if (!open) return null;

  const handleTipChange = (id, value) => {
    setTipValues((prev) => ({ ...prev, [id]: value }));
  };

  const handleSave = () => {
    const formatted = selectedAppointments.map((a) => ({
      id: a.Id,
      tip: Number(tipValues[a.Id]) || 0,
    }));
    onConfirm(formatted);
    setOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center overflow-auto">
      <div className="bg-[#fff8f8] rounded-2xl w-[95%] max-w-5xl p-8 shadow-xl">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800">
            Customer Appointment
          </h2>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left bg-white rounded-xl shadow-sm">
            <thead className="border-b text-gray-700">
              <tr>
                <th className="px-6 py-3 font-medium">Customer Name</th>
                <th className="px-6 py-3 font-medium">Service Name</th>
                <th className="px-6 py-3 font-medium">Amount</th>
                <th className="px-6 py-3 font-medium">Tip Amount</th>
                <th className="px-6 py-3 font-medium">Pay Balance</th>
              </tr>
            </thead>
            <tbody>
              {selectedAppointments.map((appt) => (
                <tr key={appt.Id} className="border-b hover:bg-gray-50 transition">
                  <td className="px-6 py-3">{appt.customer?.Name || "—"}</td>
                  <td className="px-6 py-3">{appt.service?.Name || "—"}</td>
                  <td className="px-6 py-3">£ {appt.Cost ?? "0.00"}</td>
                  <td className="px-6 py-3">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={tipValues[appt.Id] || ""}
                      onChange={(e) => handleTipChange(appt.Id, e.target.value)}
                      className="w-24 border rounded-md px-2 py-1 text-sm text-gray-700 focus:ring-rose-500 focus:border-rose-500"
                    />
                  </td>
                  <td className="px-6 py-3 text-gray-700 font-medium">
                    £ 0.00
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex justify-end mt-8">
          <button
            onClick={handleSave}
            className="px-8 py-2.5 bg-rose-500 text-white font-medium rounded-md hover:bg-rose-600 transition"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
