// src/pages/promo-codes/PromoCodeUsagePage.jsx
import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeft, ChevronDown, ChevronUp } from "lucide-react";
import http from "@/api/http";

const roseBg = "bg-[#F6EAEA]";
const roseCard = "bg-white rounded-2xl shadow-sm border border-[#F0E6E6]";
const textDark = "text-[#2F2F2F]";

export default function PromoCodeUsagePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [promo, setPromo] = useState(null);
  const [allUsages, setAllUsages] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  // Accordion
  const [openCustomerId, setOpenCustomerId] = useState(null);

  const load = async (pg = 1) => {
    try {
      setLoading(true);

      const res = await http.get(`/api/promo-codes/${id}/usages`, {
        params: { page: pg, per_page: perPage },
      });

      setPromo(res.data.promo || null);
      setAllUsages(res.data.usages || []);
    } catch (err) {
      toast.error("Failed to load promo usage.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(page);
  }, [page]);

  useEffect(() => {
    setPage(1);
    load(1);
  }, [perPage]);

  // Group usage by customer
  const groupedByCustomer = useMemo(() => {
    const groups = {};
    allUsages.forEach((u) => {
      const id = u.customer?.Id ?? "unknown";
      if (!groups[id]) groups[id] = [];
      groups[id].push(u);
    });
    return groups;
  }, [allUsages]);

  if (loading && !promo) {
    return <div className="p-10 text-center text-gray-600">Loading…</div>;
  }

  if (!promo) {
    return <div className="p-10 text-center text-red-500">Promo code not found.</div>;
  }

  return (
    <div className={`min-h-screen ${roseBg} px-6 py-6`}>
      <div className="max-w-6xl mx-auto">

        {/* HEADER */}
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg bg-[#C88D8D] text-white hover:bg-[#B37878]"
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-2xl font-semibold" style={{ color: textDark }}>
            Promo Code Usage
          </h1>
        </div>

        {/* PROMO DETAILS */}
        <div className={`${roseCard} p-6 mb-6`}>
          <h2 className="text-xl font-semibold text-[#2F2F2F]">
            {promo.title}
          </h2>

          <p className="text-gray-700 mt-1">
            Code: <strong>{promo.code}</strong>
          </p>

          <p className="text-gray-700 mt-1">
            Discount:{" "}
            {promo.discount_type === "percent"
              ? `${promo.discount_value}%`
              : `£${promo.discount_value}`}
          </p>

          <p className="text-gray-700 mt-1">
            Validity: {promo.start_date ?? "-"} → {promo.end_date ?? "-"}
          </p>
        </div>

        {/* CONTROLS */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-700">
            Show
            <select
              value={perPage}
              onChange={(e) => setPerPage(Number(e.target.value))}
              className="rounded-md bg-white px-2 py-1 shadow-sm text-sm"
            >
              {[10, 25, 50].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
            entries
          </div>

          <div className="text-sm text-gray-600">
            {Object.keys(groupedByCustomer).length} customers used this promo
          </div>
        </div>

        {/* ACCORDIONS */}
        <div className="space-y-4">
          {Object.entries(groupedByCustomer).map(([customerId, rows]) => {
            const customerName = rows[0].customer?.Name ?? "Unknown";
            const discountUsed = rows.reduce(
              (sum, r) => sum + Number(r.used_amount ?? 0),
              0
            );

            const isOpen = openCustomerId === customerId;

            return (
              <div key={customerId} className={`${roseCard} overflow-hidden`}>
                {/* Accordion Header */}
                <button
                  type="button"
                  onClick={() =>
                    setOpenCustomerId(isOpen ? null : customerId)
                  }
                  className="w-full flex items-center justify-between px-5 py-4"
                >
                  <div className="flex flex-col text-left">
                    <span className="text-sm font-semibold text-[#2F2F2F]">
                      {customerName}
                    </span>
                    <span className="text-xs text-gray-600 mt-1">
                      Total Used: £{discountUsed.toFixed(2)}
                    </span>
                  </div>

                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  )}
                </button>

                {/* Accordion Body */}
                {isOpen && (
                  <div className="border-t border-[#F0E6E6]">
                    <table className="min-w-full text-sm">
                      <thead className="bg-[#faf5f5]">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs text-gray-700">
                            Date
                          </th>
                          <th className="px-4 py-2 text-left text-xs text-gray-700">
                            Appointment
                          </th>
                          <th className="px-4 py-2 text-left text-xs text-gray-700">
                            Used Amount
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {rows.map((u) => (
                          <tr
                            key={u.id}
                            className="border-t border-[#F0E6E6] hover:bg-[#fdf8f8]"
                          >
                            <td className="px-4 py-2">
                              {u.created_at.split("T")[0]}
                            </td>
                            <td className="px-4 py-2">
                              #{u.appointment_id}
                            </td>
                            <td className="px-4 py-2">
                              £{Number(u.used_amount).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* PAGINATION */}
        <div className="flex items-center justify-between mt-6">
          <button
            className="p-2 rounded-md bg-white border hover:bg-gray-50 disabled:opacity-40 text-sm"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
          >
            Previous
          </button>

          <button
            className="p-2 rounded-md bg-white border hover:bg-gray-50 disabled:opacity-40 text-sm"
            disabled={allUsages.length < perPage}
            onClick={() => setPage(page + 1)}
          >
            Next
          </button>
        </div>

      </div>
    </div>
  );
}
