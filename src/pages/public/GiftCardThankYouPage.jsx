// src/pages/public/GiftCardThankYouPage.jsx
import { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { listBeauticians } from "../../api/beautician";
import { getBusinessSetting } from "../../api/settings";

export default function GiftCardThankYouPage() {
  const { subdomain } = useParams();
  const location = useLocation();

  const [beautician, setBeautician] = useState(null);
  const [businessSettings, setBusinessSettings] = useState({});
  const [accountId, setAccountId] = useState(null);
  const [loadingHeader, setLoadingHeader] = useState(true);

  // ---------------- LOAD BEAUTICIAN ----------------
  useEffect(() => {
    async function loadBeautician() {
      try {
        const res = await listBeauticians({ subdomain });
        const b = res.data?.[0];

        if (b) {
          setBeautician(b);
          setAccountId(b.account_id);
        }
      } catch (err) {
        console.error("Beautician load error (thank you page):", err);
      } finally {
        setLoadingHeader(false);
      }
    }

    loadBeautician();
  }, [subdomain]);

  // ---------------- LOAD BUSINESS SETTINGS ----------------
  useEffect(() => {
    if (!accountId) return;

    async function loadSettings() {
      try {
        const settings = await getBusinessSetting("site", accountId);
        setBusinessSettings(settings || {});
      } catch (err) {
        console.error("Business settings load error:", err);
      }
    }

    loadSettings();
  }, [accountId]);

  const finalLogo =
    businessSettings?.logo_url ||
    beautician?.logo_url ||
    "/images/dummy/dummy.png";

  const finalCover =
    businessSettings?.cover_url ||
    beautician?.cover_url ||
    "/images/dummy/dummy.png";

  // ---------------- GIFT CARD TITLE (OPTIONAL) ----------------
  const query = new URLSearchParams(location.search);
  const cardTitleFromQuery = query.get("title");

  const cardTitle = cardTitleFromQuery || "Gift Card";

  // ---------------- SKELETON HEADER ----------------
  const SkeletonHeader = () => (
    <div className="w-full h-[350px] bg-gray-200 animate-pulse mt-[80px]" />
  );

  return (
    <div className="w-full min-h-screen bg-[#FAFAFA]">
      {/* HEADER */}
      <header className="w-full bg-white shadow-sm fixed top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center py-6 px-8">
          <div className="h-10 max-w-[180px] flex items-center">
            {loadingHeader ? (
              <div className="w-32 h-full bg-gray-200 animate-pulse rounded" />
            ) : (
              <img
                src={finalLogo}
                alt="Logo"
                className="h-full w-full object-contain"
              />
            )}
          </div>

          <div className="flex gap-6 text-sm text-[#E86C28] font-medium">
            <span>📞 Phone</span>
            <span>✉️ Email</span>
            <span>📸 Instagram</span>
          </div>
        </div>
      </header>

      {/* COVER */}
      {loadingHeader ? (
        <SkeletonHeader />
      ) : (
        <div className="w-full h-[350px] mt-[80px] overflow-hidden relative">
          <img
            src={finalCover}
            alt="Cover"
            className="w-full h-full object-cover brightness-[0.75]"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <h1 className="text-white text-4xl md:text-5xl font-semibold drop-shadow-lg">
              Gift Card
            </h1>
          </div>
        </div>
      )}

      {/* CENTER CARD */}
      <div className="max-w-5xl mx-auto px-6">
        <div className="relative">
          <div className="bg-white rounded-[24px] border border-[#F2F2F2] shadow-[0_24px_80px_rgba(15,23,42,0.12)] px-10 py-14 md:px-16 md:py-16 text-center mt-[-70px] z-10">
            {/* Tick icon circle */}
            <div className="w-16 h-16 mx-auto rounded-full bg-[#FDE9DC] flex items-center justify-center mb-6">
              <span className="text-[#E86C28] text-3xl font-bold">✓</span>
            </div>

            {/* Title */}
            <h2 className="text-[22px] md:text-[24px] font-semibold text-[#111827] leading-snug mb-3">
              You’ve successfully purchased
              <br />
              <span className="text-[#111827]">
                {cardTitleFromQuery ? (
                  <span className="font-semibold">{cardTitle}</span>
                ) : (
                  <span className="font-semibold">Gift Card</span>
                )}
              </span>
            </h2>

            {/* Message */}
            <p className="text-[13px] md:text-sm text-gray-600 leading-relaxed">
              Thank you for choosing{" "}
              <span className="text-[#E86C28] font-medium">
                {beautician?.business_name || beautician?.name || "Octane"}
              </span>{" "}
              for your grooming needs.
              <br />
              We look forward to seeing you!
            </p>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="py-10 text-center text-gray-600 text-sm mt-6">
        © 2025 All Rights Reserved by{" "}
        <span className="text-[#E86C28]">
          {beautician?.business_name || beautician?.name || "Octane"}
        </span>
      </footer>
    </div>
  );
}
