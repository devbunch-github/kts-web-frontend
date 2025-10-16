import React, { useEffect, useState } from "react";
import AdminHeader from "../../components/layout/SuperAdminHeader";
import AdminSidebar from "../../components/layout/SuperAdminSidebar";
import AdminFooter from "../../components/layout/SuperAdminFooter";
import { getSmsPurchaseBalance } from "../../api/publicApi";

const SmsPurchaseBalancePage = () => {
  const [balanceData, setBalanceData] = useState({
    total_balance: 1600,
    total_sms: 1600,
    used_sms: 400,
  });

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getSmsPurchaseBalance();
        if (res.success) {
          setBalanceData(res.data);
        }
      } catch (err) {
        console.error("Error fetching SMS balance:", err);
      }
    };
    fetchData();
  }, []);

  const remainingSms = balanceData.total_sms - balanceData.used_sms;

  return (
    <div className="min-h-screen bg-[#f9f5f4] flex flex-col font-[Inter]">
      <AdminHeader />

      <div className="flex flex-1 w-full max-w-[1400px] mx-auto">
        <AdminSidebar />

        <main className="flex-1 p-6">
          {/* Heading */}
          <div className="flex items-center gap-2 mb-10">
            <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-rose-100">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#a8626b"
                strokeWidth="1.5"
              >
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-gray-800">
              SMS Purchase Balance
            </h1>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-8">
            {/* Balance Card */}
            <div className="bg-white rounded-xl shadow-sm py-16 text-center border border-gray-100">
              <div className="text-4xl font-bold text-gray-900 mb-2">
                £{balanceData.total_balance.toFixed(2)}
              </div>
              <div className="text-gray-600 text-sm font-medium">
                SMS Purchase Balance
              </div>
            </div>

            {/* Sent SMS Card */}
            <div className="bg-white rounded-xl shadow-sm py-16 text-center border border-gray-100">
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {balanceData.used_sms}/{balanceData.total_sms}
              </div>
              <div className="text-gray-600 text-sm font-medium">Sent SMS</div>
            </div>
          </div>
        </main>
      </div>

      <AdminFooter />
    </div>
  );
};

export default SmsPurchaseBalancePage;
