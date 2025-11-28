import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronDown, ChevronUp } from "lucide-react";
import toast from "react-hot-toast";
import http from "@/api/http";

const roseBg = "bg-[#F6EAEA]";
const roseCard = "bg-white rounded-2xl shadow-sm border border-[#F0E6E6]";
const textDark = "text-[#2F2F2F]";
const softBorder = "border border-[#F0E6E6]";

export default function GiftCardUsagePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [giftCard, setGiftCard] = useState(null);
  const [purchases, setPurchases] = useState([]);
  const [meta, setMeta] = useState({});
  const [perPage, setPerPage] = useState(10);
  const [page, setPage] = useState(1);

  const [openAccordion, setOpenAccordion] = useState(null);

  const fetchData = async (pg = 1) => {
    try {
      setLoading(true);
      const res = await http.get(`/api/gift-cards/${id}/usages`, {
        params: { page: pg, per_page: perPage },
      });

      setGiftCard(res.data.gift_card);
      setPurchases(res.data.purchases || []);
      setMeta(res.data.meta);
    } catch (err) {
      toast.error("Failed to load usage info.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(page);
  }, [page, perPage]);

  const toggleAccordion = (idx) => {
    setOpenAccordion(openAccordion === idx ? null : idx);
  };

  if (loading)
    return <div className="p-10 text-gray-600 text-center">Loading…</div>;

  return (
    <div className={`min-h-screen ${roseBg} px-6 py-6`}>
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg bg-[#C88D8D] text-white hover:bg-[#B37878]"
          >
            <ArrowLeft size={18} />
          </button>

          <h1 className="text-2xl font-semibold" style={{ color: textDark }}>
            Gift Card Usage
          </h1>
        </div>

        {/* Gift Card Info */}
        <div className={`${roseCard} p-6 mb-6`}>
          <h2 className="text-xl font-semibold">{giftCard.title}</h2>

          <p className="text-gray-600 mt-1">
            Code: <strong>{giftCard.code}</strong>
          </p>

          <p className="text-gray-600">
            Discount:{" "}
            {giftCard.discount_type === "percentage"
              ? `${giftCard.discount_amount}%`
              : `£${giftCard.discount_amount}`}
          </p>
        </div>

        {/* Table Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700">Show</span>
            <select
              value={perPage}
              onChange={(e) => {
                setPerPage(Number(e.target.value));
                setPage(1);
              }}
              className="rounded-md bg-white px-2 py-1 text-sm shadow-sm"
            >
              {[10, 25, 50].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
            <span className="text-sm text-gray-700">entries</span>
          </div>

          <div className="text-sm text-gray-600">
            Page {meta.current_page} of {meta.last_page}
          </div>
        </div>

        {/* Purchases */}
        {purchases.length === 0 ? (
          <div className={`${roseCard} p-6 text-center text-gray-500`}>
            No purchases found.
          </div>
        ) : (
          purchases.map((p, idx) => {
            const open = openAccordion === idx;

            return (
              <div
                key={p.Id}
                className={`${roseCard} p-5 mb-4 cursor-pointer`}
                onClick={() => toggleAccordion(idx)}
              >
                {/* Accordion Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-[#2F2F2F]">
                      {p.customer?.Name || "Unknown Customer"}
                    </h3>

                    <p className="text-sm text-gray-600">
                      Purchased: £{p.Amount} | Used: £{p.UsedAmount} | Remaining:{" "}
                      £{(p.Amount - p.UsedAmount).toFixed(2)}
                    </p>
                  </div>

                  {open ? (
                    <ChevronUp className="text-[#C88D8D]" />
                  ) : (
                    <ChevronDown className="text-[#C88D8D]" />
                  )}
                </div>

                {/* Accordion Body */}
                {open && (
                  <div className="mt-4 border-t border-[#F0E6E6] pt-4">
                    <h4 className="font-semibold text-sm mb-3 text-[#2F2F2F]">
                      Usage History
                    </h4>

                    {/* Usage Table */}
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm">
                        <thead className="bg-[#faf5f5]">
                          <tr>
                            <th className="px-4 py-2 text-left text-gray-700">
                              Date
                            </th>
                            <th className="px-4 py-2 text-left text-gray-700">
                              Appointment
                            </th>
                            <th className="px-4 py-2 text-left text-gray-700">
                              Used Amount
                            </th>
                          </tr>
                        </thead>

                        <tbody>
                          {p.usage_rows.length === 0 ? (
                            <tr>
                              <td
                                colSpan={3}
                                className="p-4 text-center text-gray-500"
                              >
                                No usage recorded
                              </td>
                            </tr>
                          ) : (
                            p.usage_rows.map((u) => (
                              <tr
                                key={u.id}
                                className="border-b border-[#F0E6E6] hover:bg-[#fdf8f8]"
                              >
                                <td className="px-4 py-2">
                                  {u.created_at?.split("T")[0]}
                                </td>
                                <td className="px-4 py-2">
                                  #{u.appointment?.Id} —{" "}
                                  {u.appointment?.StartDateTime?.split("T")[0]}
                                </td>
                                <td className="px-4 py-2">
                                  £{u.used_amount}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* Pagination */}
        <div className="flex items-center justify-between mt-6">
          <button
            className="p-2 rounded-md bg-white border hover:bg-gray-50 disabled:opacity-40"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={meta.current_page <= 1}
          >
            Previous
          </button>

          <button
            className="p-2 rounded-md bg-white border hover:bg-gray-50 disabled:opacity-40"
            onClick={() =>
              setPage((p) => Math.min(meta.last_page, p + 1))
            }
            disabled={meta.current_page >= meta.last_page}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
