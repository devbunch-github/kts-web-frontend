import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getExpense } from "../../api/expense";
import Spinner from "../../components/Spinner";

export default function ExpenseView() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [activeFile, setActiveFile] = useState(null);

  useEffect(() => {
    (async () => {
      const res = await getExpense(id);
      const expense = res?.data ?? res;
      setData(expense);
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

  const files = Array.isArray(data.files) ? data.files : [];

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
              <th className="px-5 py-3 text-left font-medium">Files</th>
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

              {/* File Thumbnails */}
              <td className="px-5 py-4">
                {files.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {files.map((f) => (
                      <button
                        key={f.id}
                        onClick={() => setActiveFile(f)}
                        className="group relative border border-[#f0dede] rounded-lg overflow-hidden w-14 h-14 hover:scale-105 transition"
                      >
                        {f.url && f.url.match(/\.pdf$/i) ? (
                          <div className="flex items-center justify-center h-full w-full bg-[#faf8f8] text-[#c98383]">
                            <i className="bi bi-file-earmark-pdf text-lg"></i>
                          </div>
                        ) : (
                          <img
                            src={f.url}
                            alt={f.name}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </button>
                    ))}
                  </div>
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
      {activeFile && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
          onClick={() => setActiveFile(null)}
        >
          <div
            className="relative bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setActiveFile(null)}
              className="absolute top-3 right-3 h-8 w-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 z-50"
            >
              ✕
            </button>

            {/* File Display */}
            <div className="flex-1 overflow-auto flex items-center justify-center bg-[#faf8f8]">
              {activeFile.url && activeFile.url.match(/\.pdf$/i) ? (
                <iframe
                  src={activeFile.url}
                  title="Receipt Preview"
                  className="w-full h-[85vh] border-none"
                ></iframe>
              ) : (
                <img
                  src={activeFile.url}
                  alt={activeFile.name}
                  className="max-h-[85vh] object-contain"
                />
              )}
            </div>

            {/* Footer Buttons */}
            <div className="bg-white border-t border-gray-200 p-3 flex justify-between items-center">
              <span className="text-sm text-gray-600 truncate pr-4">
                {activeFile.name}
              </span>
              <a
                href={activeFile.url}
                download
                target="_blank"
                rel="noreferrer"
                className="bg-[#C08080] text-white px-5 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition"
              >
                Download
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
