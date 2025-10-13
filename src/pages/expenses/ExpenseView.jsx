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
    getExpense(id).then((res) => setData(res.data ?? res));
  }, [id]);

  if (!data)
    return (
      <div className="py-20 text-center text-gray-600">
        <span className="inline-flex items-center gap-2">
          <Spinner className="h-5 w-5" /> Loading expense…
        </span>
      </div>
    );

  return (
    <div className="bg-[#FBF6F6] min-h-screen rounded-2xl shadow p-8">
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={() => navigate("/dashboard/expense")}
          className="h-9 w-9 rounded-xl bg-white border border-rose-100 flex items-center justify-center text-gray-700 hover:bg-gray-50"
        >
          ‹
        </button>
        <h1 className="text-2xl font-semibold text-gray-900">View Expense</h1>
      </div>

      <div className="bg-white rounded-2xl shadow p-6">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ backgroundColor: "#C08080" }} className="text-white">
              <th className="px-5 py-3 text-left rounded-l-lg">Date</th>
              <th className="px-5 py-3 text-left">Supplier</th>
              <th className="px-5 py-3 text-left">Amount</th>
              <th className="px-5 py-3 text-left">File</th>
              <th className="px-5 py-3 text-left rounded-r-lg">Note</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="px-5 py-4">
                {new Date(data.paid_date_time).toLocaleDateString()}
              </td>
              <td className="px-5 py-4">{data.supplier}</td>
              <td className="px-5 py-4">£{data.amount}</td>
              <td className="px-5 py-4">
                {data.receipt_id ? (
                  <button
                    onClick={() => setShowReceipt(true)}
                    className="text-[#C08080] underline"
                  >
                    Example-file.png
                  </button>
                ) : (
                  "-"
                )}
              </td>
              <td className="px-5 py-4">{data.notes || "-"}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Receipt Modal */}
      {showReceipt && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
          <div className="bg-white rounded-xl max-w-3xl w-full p-6 relative">
            <button
              onClick={() => setShowReceipt(false)}
              className="absolute top-2 right-2 h-8 w-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
            >
              ✕
            </button>
            <iframe
              src={`/api/files/${data.receipt_id}`}
              title="Receipt Preview"
              className="w-full h-[70vh] border rounded-md"
            ></iframe>
            <div
              className="mt-4 py-3 text-center text-white rounded-md cursor-pointer"
              style={{ backgroundColor: "#C08080" }}
            >
              <a
                href={`/api/files/${data.receipt_id}`}
                download
                className="hover:underline"
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
