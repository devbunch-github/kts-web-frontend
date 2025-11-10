import { useNavigate } from "react-router-dom";

export default function SubscriptionExpired() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8f3f3] px-4">
      <div className="bg-white rounded-2xl shadow-md max-w-xl w-full text-center p-10 border border-[#f0dcdc]">
        <h1 className="text-2xl md:text-3xl font-semibold text-[#2a1b1b] mb-3">
          Subscription Expired
        </h1>
        <p className="text-gray-600 text-[15px] md:text-[16px] leading-relaxed mb-8">
          Your subscription has expired. Kindly renew your plan to maintain
          uninterrupted access to our services.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate("/dashboard")}
            className="border border-[#c58a8a] text-[#b77c7c] hover:bg-[#f9ecec] font-medium px-8 py-2.5 rounded-lg transition-all"
          >
            Maybe Later
          </button>
          <button
            onClick={() => navigate("/dashboard/subscription")}
            className="bg-[#b77c7c] hover:bg-[#a66c6c] text-white font-medium px-8 py-2.5 rounded-lg transition-all"
          >
            Renew Now
          </button>
        </div>
      </div>

      <p className="mt-10 text-center text-xs text-gray-400">
        Copyright © 2024 VRA
      </p>
    </div>
  );
}
