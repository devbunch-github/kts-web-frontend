import { useEffect, useState } from "react";
import { BarChart3 } from "lucide-react";
import {
  fetchAccountantDashboard,
  fetchBusinessSummary,
} from "../../api/accountantdashboard";

export default function AccountantDashboard() {
  const [loading, setLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(true);

  const [stats, setStats] = useState({
    tax: 0,
    profit: 0,
    income: 0,
    expense: 0,
  });

  const [lists, setLists] = useState({
    income_list: [],
    expense_list: [],
    acct_data: {},
  });

  const [revoked, setRevoked] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  /* -------------------------------
     ✅ Fetch Summary Cards
  --------------------------------*/
  useEffect(() => {
    const loadSummary = async () => {
      try {
        setSummaryLoading(true);
        const data = await fetchBusinessSummary();

        setStats({
          tax: data.tax || 0,
          profit: data.profit || 0,
          income: data.income_total || 0,
          expense: data.expense_total || 0,
        });
      } catch (err) {
        console.error("Failed to load summary cards:", err);
      } finally {
        setSummaryLoading(false);
      }
    };
    loadSummary();
  }, []);

  /* -------------------------------
     ✅ Fetch Full Dashboard Lists
  --------------------------------*/
  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const data = await fetchAccountantDashboard();
        const acc = data.acct_data || {};

        // Sync accountant info
        if (Object.keys(acc).length > 0) {
          const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
          const updatedUser = { ...storedUser, ...acc };
          localStorage.setItem("user", JSON.stringify(updatedUser));
        }

        const localUser = JSON.parse(localStorage.getItem("user") || "{}");
        const isRevoked =
          acc?.is_active === 0 ||
          localUser?.is_active === 0 ||
          acc?.is_active == 0 ||
          localUser?.is_active == 0;

        if (isRevoked) {
          setRevoked(true);
          setModalOpen(true);
        }

        setLists({
          income_list: data.income_list || [],
          expense_list: data.expense_list || [],
          acct_data: acc,
        });
      } catch (err) {
        console.error("Failed to load accountant dashboard:", err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, []);

  /* -------------------------------
     ✅ Loading States
  --------------------------------*/
  if (loading || summaryLoading) {
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <p className="text-gray-500 text-sm">Loading dashboard...</p>
      </div>
    );
  }

  /* -------------------------------
     🔒 Access Revoked
  --------------------------------*/
  if (revoked && !modalOpen) {
    return (
      <div className="min-h-screen bg-[#fffaf6] flex flex-col items-center justify-center font-[Poppins,sans-serif] text-center px-4">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">
          Your access has been revoked by the business owner.
        </h2>
        <p className="text-gray-600 max-w-md mb-1">
          You no longer have permission to view or manage any business data.
        </p>
        <p className="text-gray-600 max-w-md">
          Please contact the business owner if you believe this is a mistake or
          need your access restored.
        </p>
      </div>
    );
  }

  /* -------------------------------
     ✅ Dashboard View
  --------------------------------*/
  return (
    <div className="relative min-h-screen bg-[#fffaf6] p-6 font-[Poppins,sans-serif] overflow-hidden">
      {revoked && (
        <div className="absolute inset-0 bg-black bg-opacity-40 backdrop-blur-sm z-10"></div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-[#f28c38]" /> Dashboard
        </h2>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <SummaryCard label="Tax & NI" value={stats.tax} />
        <SummaryCard label="Current Profit" value={stats.profit} />
        <SummaryCard label="Current Income" value={stats.income} />
        <SummaryCard label="Current Expenses" value={stats.expense} />
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DataCard
          title="Income"
          columns={["Date", "Category", "Service", "Income Amount"]}
          rows={lists.income_list.map((row) => [
            formatDate(row.PaymentDateTime),
            row.CategoryName || row.CategoryId || "-",
            row.ServiceName || row.Description || "-",
            `£ ${Number(row.Amount).toFixed(2)}`,
          ])}
        />
        <DataCard
          title="Expense"
          columns={["Date", "Supplier", "Expense Amount"]}
          rows={lists.expense_list.map((row) => [
            formatDate(row.PaidDateTime),
            row.Supplier || "-",
            `£ ${Number(row.Amount).toFixed(2)}`,
          ])}
        />
      </div>

      {/* Access Revoked Modal */}
      {modalOpen && revoked && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              Your access has been revoked by the business owner.
            </h2>
            <p className="text-gray-600 text-sm mb-1">
              You no longer have permission to view or manage any business data.
            </p>
            <p className="text-gray-600 text-sm mb-6">
              Please contact the business owner if you believe this is a mistake
              or need your access restored.
            </p>
            <button
              onClick={() => setModalOpen(false)}
              className="px-6 py-2 rounded-md bg-[#d57a7a] text-white hover:bg-[#c06c6c] transition font-medium"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------
   💠 Components
--------------------------------*/
function SummaryCard({ label, value }) {
  return (
    <div className="bg-white rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.05)] p-6 text-center">
      <p className="text-gray-700 font-medium mb-2">{label}</p>
      <h3 className="text-2xl sm:text-3xl font-semibold text-gray-900">
        £ {Number(value).toLocaleString("en-GB", { minimumFractionDigits: 2 })}
      </h3>
    </div>
  );
}

function DataCard({ title, columns, rows }) {
  return (
    <div className="bg-white rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.05)] p-6">
      <h4 className="text-lg font-semibold text-gray-800 mb-4">{title}</h4>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left border-collapse">
          <thead>
            <tr className="text-gray-600 border-b">
              {columns.map((col, i) => (
                <th key={i} className="py-2">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="py-4 text-center text-gray-400"
                >
                  No data available
                </td>
              </tr>
            ) : (
              rows.map((row, i) => (
                <tr key={i} className="border-b hover:bg-gray-50">
                  {row.map((cell, j) => (
                    <td
                      key={j}
                      className={`py-2 ${
                        j === row.length - 1 ? "text-right" : ""
                      }`}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function formatDate(dateStr) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}
