import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  ResponsiveContainer,
} from "recharts";
import http from "@/api/http";
import { CalendarDays } from "lucide-react";

/* ==============================================================
   🎨 Design Goals:
   - Match the appt.live reference design exactly
   - Soft pink background (#faf7f7)
   - White rounded cards with subtle rose borders/shadows
   - Consistent spacing, font sizes, and responsive layout
   ============================================================== */

export default function BusinessReports() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({});
  const [filters, setFilters] = useState({ from: "", to: "" });

  useEffect(() => {
    fetchReports();
  }, [filters]);

  async function fetchReports() {
    try {
      setLoading(true);
      const res = await http.get("/api/business/reports/summary", {
        params: filters,
      });
      setData(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const Card = ({ title, value }) => (
    <div className="bg-white rounded-2xl shadow-sm border border-rose-100/40 p-6 text-center hover:shadow-md transition">
      <h6 className="text-gray-500 text-sm font-medium mb-1">{title}</h6>
      <h2 className="text-3xl font-bold text-gray-900 tracking-tight">{value}</h2>
    </div>
  );

  if (loading)
    return (
      <div className="flex justify-center items-center h-[70vh] text-gray-500 text-sm">
        <CalendarDays className="animate-spin mr-2 text-rose-400" />
        Loading reports...
      </div>
    );

  return (
    <div className="bg-[#faf7f7] min-h-screen p-6 md:p-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
            <CalendarDays size={18} />
          </div>
          <h1 className="text-2xl font-semibold text-gray-800">Reports</h1>
        </div>

        <div className="flex gap-3">
          <div className="flex items-center bg-white border border-gray-200 rounded-xl px-3 py-1.5 shadow-sm">
            <input
              type="date"
              className="outline-none text-sm text-gray-700"
              value={filters.from}
              onChange={(e) =>
                setFilters({ ...filters, from: e.target.value })
              }
            />
          </div>
          <div className="flex items-center bg-white border border-gray-200 rounded-xl px-3 py-1.5 shadow-sm">
            <input
              type="date"
              className="outline-none text-sm text-gray-700"
              value={filters.to}
              onChange={(e) => setFilters({ ...filters, to: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card
          title="Total Revenue"
          value={`£${Number(data.total_revenue || 0).toLocaleString()}`}
        />
        <Card
          title="Total Sale"
          value={`£${Number(data.total_sales || 0).toLocaleString()}`}
        />
        <Card title="Total Appointments" value={data.total_appointments ?? 0} />
        <Card title="Total Customer" value={data.total_customers ?? 0} />
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Total Sales (Line Chart) */}
        <div className="bg-white rounded-2xl p-6 border border-rose-100/40 shadow-sm">
          <h6 className="font-semibold text-gray-700 mb-4">Total Sales</h6>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={data.sales_chart || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0e6e6" />
              <XAxis
                dataKey="date"
                tick={{ fill: "#8b8b8b", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#8b8b8b", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #f4dcdc",
                  borderRadius: "10px",
                  fontSize: "12px",
                }}
              />
              <Line
                type="monotone"
                dataKey="total"
                stroke="#d26c6c"
                strokeWidth={3}
                dot={{ r: 4, fill: "#d26c6c", stroke: "#fff", strokeWidth: 2 }}
                activeDot={{ r: 6, fill: "#d26c6c" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Total Expenses (Bar Chart) */}
        <div className="bg-white rounded-2xl p-6 border border-rose-100/40 shadow-sm">
          <h6 className="font-semibold text-gray-700 mb-4">Total Expenses</h6>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.expenses_chart || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0e6e6" />
              <XAxis
                dataKey="category"
                tick={{ fill: "#8b8b8b", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#8b8b8b", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #f4dcdc",
                  borderRadius: "10px",
                  fontSize: "12px",
                }}
              />
              <Bar dataKey="total" fill="#d26c6c" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Sale by Service (Bar Chart) */}
      <div className="bg-white rounded-2xl p-6 border border-rose-100/40 shadow-sm">
        <h6 className="font-semibold text-gray-700 mb-4">Sale by Service</h6>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data.service_sales || []}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0e6e6" />
            <XAxis
              dataKey="service_name"
              tick={{ fill: "#8b8b8b", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "#8b8b8b", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #f4dcdc",
                borderRadius: "10px",
                fontSize: "12px",
              }}
            />
            <Bar dataKey="total" fill="#d26c6c" radius={[10, 10, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-gray-400 pt-4">
        Copyright © {new Date().getFullYear()} VRA
      </div>
    </div>
  );
}
