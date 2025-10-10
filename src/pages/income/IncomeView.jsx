import { useEffect, useState } from "react";
import { getIncome } from "../../api/income";
import { useParams, useNavigate } from "react-router-dom";

export default function IncomeView() {
  const { id } = useParams();
  const nav = useNavigate();
  const [data, setData] = useState(null);

  useEffect(() => {
    (async () => {
      const res = await getIncome(id);
      setData(res.data ?? res);
    })();
  }, [id]);

  if (!data) return null;

  const date = data.PaymentDateTime ? new Date(data.PaymentDateTime).toLocaleDateString() : "—";
  const customer = data.Customer?.Name ?? data.customer?.Name ?? "—";
  const category = data.Category?.Name ?? data.category?.Name ?? "—";
  const service  = data.Service?.Name ?? data.service?.Name ?? "—";
  const amount   = Number(data.Amount || 0).toFixed(2);
  const note     = data.Notes ?? data.Description ?? "—";

  return (
    <div className="p-6">
      <button
        onClick={() => nav(-1)}
        className="mb-6 inline-flex h-8 w-8 items-center justify-center rounded-xl bg-[#c98383]/30 text-[#a96464]"
        aria-label="Back"
      >
        ‹
      </button>

      <h1 className="text-[28px] font-semibold text-[#222] mb-8">View Income</h1>

      <div className="rounded-2xl bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#c78e8e] text-white">
            <tr>
              <th className="px-6 py-4 text-left">Date</th>
              <th className="px-6 py-4 text-left">Customer Name</th>
              <th className="px-6 py-4 text-left">Category</th>
              <th className="px-6 py-4 text-left">Services</th>
              <th className="px-6 py-4 text-left">Amount</th>
              <th className="px-6 py-4 text-left">Note</th>
            </tr>
          </thead>
          <tbody>
            <tr className="align-top">
              <td className="px-6 py-6">{date}</td>
              <td className="px-6 py-6">{customer}</td>
              <td className="px-6 py-6">{category}</td>
              <td className="px-6 py-6 font-medium">{service}</td>
              <td className="px-6 py-6">£ {amount}</td>
              <td className="px-6 py-6 max-w-[420px]">{note}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
