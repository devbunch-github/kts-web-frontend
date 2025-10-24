import { useEffect, useState } from "react";
import { BarChart3 } from "lucide-react";
import { fetchAccountantDashboard } from "../../api/accountantdashboard";

export default function AccountantDashboard() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
    tax: 0,
    profit: 0,
    income: 0,
    expense: 0,
    income_list: [],
    expense_list: [],
    });

    // ✅ Fetch data from backend
    useEffect(() => {
    const loadDashboard = async () => {
        try {
        const res = await fetchAccountantDashboard();
        setStats({
            tax: res.data.tax,
            profit: res.data.profit,
            income: res.data.income_total,
            expense: res.data.expense_total,
            income_list: res.data.income_list,
            expense_list: res.data.expense_list,
        });
        } catch (err) {
        console.error("Failed to load accountant dashboard:", err);
        } finally {
        setLoading(false);
        }
    };
    loadDashboard();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[70vh]">
            <p className="text-gray-500 text-sm">Loading dashboard...</p>
            </div>
        );
    }

      return (
        <div className="min-h-screen bg-[#fffaf6] p-6 font-[Poppins,sans-serif]">
            {/* Header Row */}
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
                <BarChart3 className="w-6 h-6 text-[#f28c38]" /> Dashboard
                </h2>
            </div>

            {/* Stat Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <SummaryCard label="Tax & NI" value={stats.tax} />
                <SummaryCard label="Current Profit" value={stats.profit} />
                <SummaryCard label="Current Income" value={stats.income} />
                <SummaryCard label="Current Expenses" value={stats.expense} />
            </div>

            {/* Income & Expense Tables */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <DataCard
                title="Income"
                columns={["Date", "Category", "Service", "Income Amount"]}
                rows={stats.income_list.map((row) => [
                    formatDate(row.PaymentDateTime),
                    row.CategoryName || row.CategoryId || "-",
                    row.ServiceName || row.Description || "-",
                    `£ ${Number(row.Amount).toFixed(2)}`,
                ])}
                />
                <DataCard
                title="Expense"
                columns={["Date", "Supplier", "Expense Amount"]}
                rows={stats.expense_list.map((row) => [
                    formatDate(row.PaidDateTime),
                    row.Supplier || "-",
                    `£ ${Number(row.Amount).toFixed(2)}`,
                ])}
                />
            </div>
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
