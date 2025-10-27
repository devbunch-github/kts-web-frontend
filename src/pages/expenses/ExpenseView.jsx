import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getExpense } from "../../api/expense";
import Spinner from "../../components/Spinner";

export default function ExpenseView() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [showReceipt, setShowReceipt] = useState(false);

  useEffect(() => {
    (async () => {
      const res = await getExpense(id);
      setData(res?.data ?? res);
    })();
  }, [id]);

  if (!data)
    return (
      <div className="py-20 text-center text-gray-600">
        <span className="inline-flex items-center gap-2">
          <Spinner className="h-5 w-5" /> Loading expense…
        </span>
      </div>
    );

  const fileUrl = data.receipt_url
    ? data.receipt_url
    : data.receipt_id
    ? `/api/files/${data.receipt_id}`
    : null;

  return (
    <div className="p-6 md:p-8 min-h-screen bg-[#faf8f8]">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={() => navigate("/dashboard/expense")}
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white border border-[#f0dede] text-[#a96464] hover:bg-[#fff7f7]"
        >
          ‹
        </button>
        <h1 className="text-[26px] font-semibold text-[#222]">View Expense</h1>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl shadow-sm p-5 md:p-8 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-white" style={{ backgroundColor: "#C08080" }}>
              <th className="px-5 py-3 text-left rounded-l-xl font-medium">
                Date
              </th>
              <th className="px-5 py-3 text-left font-medium">Supplier</th>
              <th className="px-5 py-3 text-left font-medium">Amount</th>
              <th className="px-5 py-3 text-left font-medium">File</th>
              <th className="px-5 py-3 text-left rounded-r-xl font-medium">
                Note
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-[#f2eeee]">
              <td className="px-5 py-4 text-[#333]">
                {data.paid_date_time
                  ? new Date(data.paid_date_time).toLocaleDateString()
                  : "-"}
              </td>
              <td className="px-5 py-4 text-[#333]">{data.supplier || "-"}</td>
              <td className="px-5 py-4 text-[#333] font-medium">
                £{Number(data.amount || 0).toFixed(2)}
              </td>
              <td className="px-5 py-4">
                {fileUrl ? (
                  <button
                    onClick={() => setShowReceipt(true)}
                    className="text-[#C08080] underline hover:text-[#a96464]"
                  >
                    {data.file_name || "View File"}
                  </button>
                ) : (
                  "-"
                )}
              </td>
              <td className="px-5 py-4 text-[#333] max-w-[400px] leading-relaxed">
                {data.notes || "-"}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Modal for File Preview */}
      {showReceipt && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
          onClick={() => setShowReceipt(false)}
        >
          <div
            className="relative bg-white rounded-2xl shadow-xl max-w-3xl w-full max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setShowReceipt(false)}
              className="absolute top-3 right-3 h-8 w-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600"
            >
              ✕
            </button>

            {/* File Display */}
            {fileUrl ? (
              <iframe
                src={fileUrl}
                title="Receipt Preview"
                className="flex-1 w-full rounded-b-2xl border-none mt-10"
              ></iframe>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-600">
                No file available.
              </div>
            )}

            {/* Download Button */}
            {fileUrl && (
              <a
                href={fileUrl}
                download
                target="_blank"
                rel="noreferrer"
                className="text-center py-3 mt-4 rounded-b-2xl text-white font-medium hover:opacity-95 transition"
                style={{ backgroundColor: "#C08080" }}
              >
                Download File
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
