import { useEffect, useState } from "react";
import { fetchClientGiftCards } from "@/api/client";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";

export default function ClientPurchasedGiftCards() {
  const [cards, setCards] = useState([]);
  const [filtered, setFiltered] = useState([]);

  // pagination
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  // search
  const [search, setSearch] = useState("");

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const res = await fetchClientGiftCards();
    const data = res.data || [];
    setCards(data);
    setFiltered(data);
  };

  // Filter by search
  useEffect(() => {
    let f = cards;

    if (search.trim() !== "") {
      f = cards.filter((c) =>
        c.title.toLowerCase().includes(search.toLowerCase())
      );
    }

    setFiltered(f);
    setPage(1);
  }, [search, cards]);

  // Pagination
  const lastPage = Math.ceil(filtered.length / perPage) || 1;
  const startIdx = (page - 1) * perPage;
  const currentRows = filtered.slice(startIdx, startIdx + perPage);

  return (
    <div className="min-h-screen bg-[#fffaf6]">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-white shadow">
          <span className="h-2 w-2 bg-[#f28c38] rounded-full"></span>
        </span>
        Purchased Gift Cards
      </h1>

      {/* Card */}
      <div className="bg-white rounded-2xl shadow-md border p-6">

        {/* Top Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Show Entries */}
          <div className="flex items-center gap-2 text-sm">
            <span>Show</span>
            <select
              value={perPage}
              onChange={(e) => setPerPage(Number(e.target.value))}
              className="border border-gray-300 rounded-lg px-2 py-1"
            >
              {[10, 25, 50].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
            <span>Entries</span>
          </div>

          {/* Search */}
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm"
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Table */}
        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="py-3 px-4 text-left font-medium text-gray-700">Title</th>
                <th className="py-3 px-4 text-left font-medium text-gray-700">Date</th>
                <th className="py-3 px-4 text-left font-medium text-gray-700">Total Amount</th>
                <th className="py-3 px-4 text-left font-medium text-gray-700">Redeemed</th>
                <th className="py-3 px-4 text-left font-medium text-gray-700">Remaining Balance</th>
              </tr>
            </thead>

            <tbody>
              {currentRows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-gray-500">
                    No purchased gift cards found.
                  </td>
                </tr>
              ) : (
                currentRows.map((g) => (
                  <tr key={g.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3">{g.title}</td>
                    <td className="px-4 py-3">{g.date}</td>
                    <td className="px-4 py-3">£{g.total_amount}</td>
                    <td className="px-4 py-3">£{g.redeemed}</td>
                    <td className="px-4 py-3">£{g.remaining}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filtered.length > 0 && (
          <div className="mt-6 flex items-center justify-end gap-3">
            <button
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="p-2 border rounded-lg disabled:opacity-40"
            >
              <ChevronLeft size={18} />
            </button>

            <span className="text-sm font-medium">{page}</span>

            <button
              disabled={page >= lastPage}
              onClick={() => setPage(page + 1)}
              className="p-2 border rounded-lg disabled:opacity-40"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
