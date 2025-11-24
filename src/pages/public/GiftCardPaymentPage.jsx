// src/pages/public/GiftCardPaymentPage.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { CreditCard } from "lucide-react";

import { listBeauticians } from "../../api/beautician";
import { getBusinessSetting } from "../../api/settings";
import { getPublicGiftCard } from "../../api/giftCards";

import {
  createGiftCardStripeCheckout,
  createGiftCardPayPalOrder,
} from "../../api/publicApi";

import { useAuth } from "../../context/AuthContext";

export default function GiftCardPaymentPage() {
  const { subdomain, id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const query = new URLSearchParams(location.search);
  const passedAccountId = query.get("account_id");

  const [beautician, setBeautician] = useState(null);
  const [businessSettings, setBusinessSettings] = useState({});
  const [giftCard, setGiftCard] = useState(null);
  const [method, setMethod] = useState("card");

  const [loading, setLoading] = useState(true);
  const [accountId, setAccountId] = useState(null);
  const user = JSON.parse(localStorage.getItem("user"));
  const customerId = user?.id;


  /** -----------------------------------------------------
   * LOAD BEAUTICIAN
   * ----------------------------------------------------- */
  useEffect(() => {
    async function loadBeautician() {
      try {
        const res = await listBeauticians({ subdomain });
        const b = res.data?.[0];
        if (b) {
          setBeautician(b);
          setAccountId(Number(passedAccountId) || b.account_id);
        }
      } catch (err) {
        console.error("Beautician load error", err);
      }
    }
    loadBeautician();
  }, [subdomain, passedAccountId]);

  /** -----------------------------------------------------
   * LOAD BUSINESS SETTINGS
   * ----------------------------------------------------- */
  useEffect(() => {
    if (!accountId) return;

    async function loadSettings() {
      try {
        const s = await getBusinessSetting("site", accountId);
        setBusinessSettings(s || {});
      } catch (err) {
        console.error("Settings load error", err);
      }
    }
    loadSettings();
  }, [accountId]);

  /** -----------------------------------------------------
   * LOAD GIFT CARD
   * ----------------------------------------------------- */
  useEffect(() => {
    if (!accountId) return;

    async function loadCard() {
      try {
        const card = await getPublicGiftCard(id, accountId);
        setGiftCard(card);
      } catch (err) {
        console.error("Gift card load error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadCard();
  }, [id, accountId]);

  /** -----------------------------------------------------
   * FINAL AMOUNT (based on your JSON)
   * ----------------------------------------------------- */
  const finalAmount = Number(giftCard?.discount_amount || 0);

  /** -----------------------------------------------------
   * CONFIRM PAYMENT
   * ----------------------------------------------------- */
  const handleConfirm = async () => {
    if (!isAuthenticated) {
      alert("Please login first.");
      return;
    }

    try {
      const payload = {
        gift_card_id: id,
        account_id: accountId,
        customer_id: customerId,
        amount: finalAmount,
        subdomain,
      };

      if (method === "card") {
        const res = await createGiftCardStripeCheckout(payload);
        if (res?.url) window.location.href = res.url;
        return;
      }

      if (method === "paypal") {
        const res = await createGiftCardPayPalOrder(payload);
        if (res?.approval_url) window.location.href = res.approval_url;
        return;
      }
    } catch (err) {
      alert("Payment failed. Try again.");
      console.error(err);
    }
  };

  /** -----------------------------------------------------
   * HEADER IMAGES
   * ----------------------------------------------------- */
  const finalLogo =
    businessSettings?.logo_url ||
    beautician?.logo_url ||
    "/images/dummy/dummy.png";

  const finalCover =
    businessSettings?.cover_url ||
    beautician?.cover_url ||
    "/images/dummy/dummy.png";

  /** -----------------------------------------------------
   * LOADING / ERROR
   * ----------------------------------------------------- */
  if (loading) {
    return (
      <div className="w-full h-screen flex justify-center items-center text-gray-600">
        Loading gift card...
      </div>
    );
  }

  if (!giftCard) {
    return (
      <div className="p-10 text-center text-red-500">Gift Card not found.</div>
    );
  }

  /** -----------------------------------------------------
   * UI
   * ----------------------------------------------------- */
  return (
    <div className="w-full min-h-screen bg-[#FAFAFA]">
      {/* HEADER */}
      <header className="w-full bg-white shadow-sm fixed top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center py-6 px-8">
          <div className="h-10 max-w-[180px] flex items-center">
            <img
              src={finalLogo}
              alt="Logo"
              className="h-full w-full object-contain"
            />
          </div>

          <div className="flex gap-6 text-sm text-[#E86C28] font-medium">
            <span>📞 Phone</span>
            <span>✉️ Email</span>
            <span>📸 Instagram</span>
          </div>
        </div>
      </header>

      {/* COVER */}
      <div className="w-full h-[350px] mt-[80px] overflow-hidden relative">
        <img
          src={finalCover}
          className="w-full h-full object-cover brightness-[0.7]"
          alt=""
        />
        <h1 className="absolute inset-0 flex items-center justify-center text-white text-4xl font-semibold drop-shadow-lg">
          Gift Card Checkout
        </h1>
      </div>

      {/* PAYMENT CONTENT */}
      <div className="max-w-7xl mx-auto grid grid-cols-12 gap-10 px-6 py-14">

        {/* LEFT SIDE – Payment Methods */}
        <div className="col-span-12 lg:col-span-7">
          <div className="bg-white rounded-2xl p-8 shadow">

            {/* CARD OPTION */}
            <button
              onClick={() => setMethod("card")}
              className={`flex items-center justify-between w-full px-5 py-4 rounded-xl border mb-4 transition ${
                method === "card"
                  ? "border-[#E86C28] bg-[#fff6f1]"
                  : "border-gray-200 hover:border-[#E86C28]/60"
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  checked={method === "card"}
                  onChange={() => setMethod("card")}
                  className="accent-[#E86C28]"
                />
                <span className="text-sm font-medium">Credit / Debit Card</span>
              </div>
              <CreditCard className="w-5 h-5 text-[#E86C28]" />
            </button>

            {/* PAYPAL OPTION */}
            <button
              onClick={() => setMethod("paypal")}
              className={`flex items-center justify-between w-full px-5 py-4 rounded-xl border transition ${
                method === "paypal"
                  ? "border-[#E86C28] bg-[#fff6f1]"
                  : "border-gray-200 hover:border-[#E86C28]/60"
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  checked={method === "paypal"}
                  onChange={() => setMethod("paypal")}
                  className="accent-[#E86C28]"
                />
                <span className="text-sm font-medium">PayPal</span>
              </div>
              <img src="/images/icons/paypal-btn.png" className="h-6" alt="" />
            </button>
          </div>
        </div>

        {/* RIGHT SIDE – Summary */}
        <div className="col-span-12 lg:col-span-5">
          <div className="bg-white shadow rounded-2xl p-6">
            <div className="flex gap-4">
              <img
                src={giftCard.image_url || "/images/dummy/dummy.png"}
                className="w-20 h-20 rounded-lg object-cover"
                alt="Gift Card"
              />

              <div>
                <h3 className="font-semibold">{giftCard.title}</h3>
                <p className="text-xs text-gray-600">
                  {giftCard.service || "All Services"}
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  Valid for days {/* You can replace with actual validity */}
                </p>
              </div>
            </div>

            <div className="border-t mt-4 pt-4 text-sm">
              <div className="flex justify-between">
                <span>Total:</span>
                <span className="font-semibold">£{finalAmount.toFixed(2)}</span>
              </div>
            </div>

            <button
              className="w-full bg-[#E86C28] text-white mt-6 py-3 rounded-full hover:bg-[#cf5f20] transition"
              onClick={handleConfirm}
            >
              Confirm Payment
            </button>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="py-10 text-center text-gray-600 text-sm">
        © 2025 All Rights Reserved by{" "}
        <span className="text-[#E86C28]">
          {beautician?.business_name || beautician?.name}
        </span>
      </footer>
    </div>
  );
}
