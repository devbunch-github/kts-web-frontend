// src/pages/public/GiftCardPaymentCancelled.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { listBeauticians } from "../../api/beautician";

export default function GiftCardPaymentCancelled() {
  const { subdomain, purchaseId } = useParams();
  const navigate = useNavigate();

  const [beautician, setBeautician] = useState(null);

  useEffect(() => {
    async function load() {
      const res = await listBeauticians({ subdomain });
      setBeautician(res.data?.[0]);
    }
    load();
  }, [subdomain]);

  const finalLogo =
    beautician?.logo_url || "/images/dummy/dummy.png";

  const finalCover =
    beautician?.cover_url || "/images/dummy/dummy.png";

  return (
    <div className="w-full min-h-screen bg-[#FAFAFA]">
      {/* HEADER */}
      <header className="w-full bg-white shadow-sm fixed top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center py-6 px-8">
          <img
            src={finalLogo}
            className="h-10 object-contain"
            alt="Logo"
          />

          <div className="flex gap-6 text-sm text-[#E86C28] font-medium">
            <span>📞 Phone</span>
            <span>✉️ Email</span>
            <span>📸 Instagram</span>
          </div>
        </div>
      </header>

      {/* COVER */}
      <div className="w-full h-[300px] mt-[80px] overflow-hidden relative">
        <img
          src={finalCover}
          className="w-full h-full object-cover brightness-[0.6]"
          alt="Cover"
        />
        <h1 className="absolute inset-0 flex items-center justify-center text-white text-4xl font-semibold">
          Payment Cancelled
        </h1>
      </div>

      {/* MAIN BOX */}
      <div className="max-w-3xl mx-auto px-6">
        <div className="bg-white p-14 mt-[-70px] shadow-xl rounded-2xl text-center">

          <div className="w-14 h-14 mx-auto rounded-full bg-red-100 flex items-center justify-center">
            <span className="text-red-500 text-3xl font-bold">✕</span>
          </div>

          <h2 className="text-2xl font-semibold mt-6 text-gray-900">
            Your payment was cancelled
          </h2>

          <p className="text-gray-600 mt-3 leading-relaxed">
            Your gift card purchase was not completed.<br />
            If this was a mistake, you can try again.
          </p>

          <div className="mt-8 flex justify-center gap-4">
            <button
              onClick={() => navigate(`/${subdomain}`)}
              className="px-6 py-2.5 border border-gray-300 rounded-full hover:bg-gray-100 text-sm"
            >
              Back to Home
            </button>

            <button
              onClick={() =>
                navigate(`/${subdomain}/gift-card/${purchaseId}/payment`)
              }
              className="px-6 py-2.5 bg-[#E86C28] text-white rounded-full hover:bg-[#cf5f20] text-sm"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="py-10 text-center text-gray-600 text-sm">
        © 2025 All Rights Reserved by{" "}
        <span className="text-[#E86C28]">
          {beautician?.name || "Octane"}
        </span>
      </footer>
    </div>
  );
}
