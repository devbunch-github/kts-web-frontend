import { useEffect, useState } from "react";

export default function CustomerGiftCardList() {
  const [giftCards, setGiftCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    // ✅ Replace this mock data with API call later
    setTimeout(() => {
      setGiftCards([
        {
          id: 1,
          full_name: "Olivia",
          title: "Beauty Bliss Gift Card",
          date: "2025-03-04",
          amount: "£10",
        },
        {
          id: 2,
          full_name: "Freya",
          title: "Glow Up Gift Card",
          date: "2025-03-10",
          amount: "£50",
        },
      ]);
      setLoading(false);
    }, 400);
  }, []);

  const filtered = giftCards.filter(
    (g) =>
      g.full_name.toLowerCase().includes(search.toLowerCase()) ||
      g.title.toLowerCase().includes(search.toLowerCase())
  );

  const fmtDate = (d) => {
    const date = new Date(d);
    return `${String(date.getDate()).padStart(2, "0")}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}-${date.getFullYear()}`;
  };

  return (
    <div className="min-h-screen bg-[#f9f5f4] p-4 md:p-8">
      <div className="max-w-6xl mx-auto bg-white shadow-md rounded-xl p-6">
        {/* Header */}
        <div className="flex items-center gap-2 mb-6">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-rose-100">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#a8626b"
              strokeWidth="1.5"
            >
              <circle cx="12" cy="12" r="9" />
            </svg>
          </span>
          <h1 className="text-xl font-semibold text-gray-800">
            Customer Gift Card List
          </h1>
        </div>

        {/* Top Controls */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-3 mb-4">
          <div className="flex items-center gap-2 text-sm">
            Show
            <select className="border border-gray-300 rounded-md px-2 py-1 text-sm">
              {[10, 25, 50].map((n) => (
                <option key={n}>{n}</option>
              ))}
            </select>
            Entries
          </div>

          {/* Search */}
          <div className="relative w-full md:w-80">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search"
              className="w-full border border-gray-300 rounded-md pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-rose-300 outline-none"
            />
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2"
              width="18"
              height="18"
              stroke="#a8626b"
              strokeWidth="1.5"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-3-3" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-center py-10 text-gray-500 text-sm">
              Loading...
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-600 border-b border-gray-200">
                  <th className="py-3 text-left font-semibold">Full Name</th>
                  <th className="py-3 text-left font-semibold">Title</th>
                  <th className="py-3 text-left font-semibold">Date</th>
                  <th className="py-3 text-left font-semibold">Amount</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length > 0 ? (
                  filtered.map((g) => (
                    <tr
                      key={g.id}
                      className="border-b border-gray-100 hover:bg-rose-50/40 transition"
                    >
                      <td className="py-3 text-gray-800">{g.full_name}</td>
                      <td className="py-3 text-gray-700">{g.title}</td>
                      <td className="py-3 text-gray-700">{fmtDate(g.date)}</td>
                      <td className="py-3 text-gray-700">{g.amount}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={4}
                      className="py-6 text-center text-gray-500 italic"
                    >
                      No gift cards found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        <div className="flex justify-end items-center mt-4 text-sm text-gray-800">
          <button className="px-2 py-1 hover:text-rose-600">&lt;</button>
          <span className="mx-2">1</span>
          <button className="px-2 py-1 hover:text-rose-600">&gt;</button>
        </div>
      </div>
    </div>
  );
}
