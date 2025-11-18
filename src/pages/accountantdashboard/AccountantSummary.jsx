import { useState } from "react";
import { FileBarChart2, ChevronDown } from "lucide-react";
import toast from "react-hot-toast";
import {
  generateAccountantSummaryPDF,
  generateAccountantSummaryExcel,
} from "../../api/accountantdashboard";

export default function AccountantSummary() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  const handleGenerate = async (type) => {
    if (!startDate || !endDate) {
      toast.error("Please select both start and end dates.");
      return;
    }
    setLoading(true);
    try {
      const params = { start_date: startDate, end_date: endDate };
      const response =
        type === "pdf"
          ? await generateAccountantSummaryPDF(params)
          : await generateAccountantSummaryExcel(params);

      // Create file blob
      const blob = new Blob([response], {
        type:
          type === "pdf"
            ? "application/pdf"
            : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      // Trigger download
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `accountant_summary_${Date.now()}.${
        type === "pdf" ? "pdf" : "csv"
      }`;
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success(
        `Summary report (${type.toUpperCase()}) generated successfully`
      );
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate report");
    } finally {
      setLoading(false);
      setDropdownOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fffaf6] p-6 font-[Poppins,sans-serif]">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
          <FileBarChart2 className="w-6 h-6 text-[#f28c38]" />
          Summary
        </h2>
      </div>

      {/* Date Filters */}
      <div className="p-8 flex flex-col sm:flex-row items-center justify-equal gap-8 bg-white rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.05)]">
        <div className="flex flex-col w-full sm:w-1/2">
          <label className="text-sm font-medium text-gray-800 mb-1">
            Start Date
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border border-[#f28c38]/40 rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-[#f28c38] focus:outline-none"
          />
        </div>

        <div className="flex flex-col w-full sm:w-1/2">
          <label className="text-sm font-medium text-gray-800 mb-1">
            End Date
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border border-[#f28c38]/40 rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-[#f28c38] focus:outline-none"
          />
        </div>
      </div>

      {/* Generate Report */}
      <div className="p-8 flex flex-col sm:flex-row items-center justify-end gap-8">
        <div className="relative w-full sm:w-auto">
          <button
            onClick={toggleDropdown}
            disabled={loading}
            className="w-full sm:w-auto px-5 py-2 bg-[#f28c38] text-white rounded-md hover:bg-[#d97a2f] font-medium flex items-center justify-between transition"
          >
            {loading ? "Generating..." : "Generate Report"}
            <ChevronDown className="ml-2 w-4 h-4" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10">
              <button
                onClick={() => handleGenerate("pdf")}
                disabled={loading}
                className="block w-full text-left px-4 py-2 text-sm hover:bg-[#fdf4ee]"
              >
                Export as PDF
              </button>
              <button
                onClick={() => handleGenerate("excel")}
                disabled={loading}
                className="block w-full text-left px-4 py-2 text-sm hover:bg-[#fdf4ee]"
              >
                Export as CSV
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
