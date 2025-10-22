import { useEffect, useState } from "react";
import { getSmsPackages } from "../../api/sms";

export default function SmsPackages() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getSmsPackages();
        if (res?.success && Array.isArray(res.data)) {
          setPackages(res.data);
        } else {
          setMessage({ text: "No packages found.", type: "error" });
        }
      } catch (err) {
        console.error(err);
        setMessage({ text: "Failed to load SMS Packages.", type: "error" });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleChoosePlan = (pkg) => {
    setMessage({ text: `You selected ${pkg.name} plan.`, type: "success" });
    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <div className="min-h-screen bg-[#faf7f7]">
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-10">
        {/* Header */}
        <div className="flex items-center gap-2 mb-10">
          <div className="bg-rose-100 text-rose-500 p-2 rounded-lg">
            <i className="bi bi-chat-dots text-lg"></i>
          </div>
          <h2 className="text-[22px] font-semibold text-gray-800">SMS Packages</h2>
        </div>

        {/* Message */}
        {message && (
          <div
            className={`mb-5 p-3 rounded-md text-sm font-medium border text-center ${
              message.type === "success"
                ? "bg-green-50 text-green-700 border-green-200"
                : "bg-red-50 text-red-700 border-red-200"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 text-center p-8 flex flex-col justify-between"
              >
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">{pkg.name}</h3>
                  <div className="text-3xl font-bold text-gray-900 mb-1">
                    £{parseFloat(pkg.price).toFixed(2)}
                  </div>
                  <p className="text-gray-500 text-sm mb-5">
                    {pkg.total_sms} SMS/month
                  </p>
                  <p className="text-gray-500 text-sm leading-relaxed mb-8">
                    {pkg.description ||
                      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."}
                  </p>
                </div>

                <button
                  onClick={() => handleChoosePlan(pkg)}
                  className="bg-[#e88a8a] hover:bg-[#d46b6b] text-white px-6 py-2.5 rounded-md font-medium transition-all duration-200 w-fit mx-auto"
                >
                  Choose Plan
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
