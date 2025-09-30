import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { createCheckout } from "../../api/publicApi";
import { useAuth } from "../../context/AuthContext"; // ✅ fixed import

export default function PaymentPage() {
  const [search] = useSearchParams();
  const planId = Number(search.get("plan"));
  const nav = useNavigate();
  const { user } = useAuth(); // ✅ get logged-in user

  const [method, setMethod] = useState("card");
  const [clientSecret, setCS] = useState("");

  const startCheckout = async () => {
    try {
      const res = await createCheckout({
        plan_id: planId,
        email: user?.email || "", // ✅ send logged in user email
        method,
      });
      setCS(res.client_secret);
    } catch (err) {
      console.error("Checkout start failed:", err);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero */}
      <section
        className="relative h-[220px] bg-cover bg-center"
        style={{ backgroundImage: "url(/images/hero-3.jpg)" }}
      >
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 container-7xl flex h-full items-end px-4 pb-8">
          <h1 className="text-3xl font-semibold text-white">Subscription</h1>
        </div>
      </section>

      {/* Payment options */}
      <section className="container-7xl section-pad">
        <div className="rounded-2xl border bg-white p-10 shadow-[var(--card-shadow)]">
          <div className="mx-auto w-full max-w-md">
            {/* Card */}
            <div className="rounded-xl border bg-white p-4 shadow-sm">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={method === "card"}
                  onChange={() => setMethod("card")}
                />
                <div className="font-medium">Credit/ Debit Card</div>
              </label>
              <div className="mt-3 grid gap-2 text-sm text-neutral-700">
                <div className="rounded-lg border px-3 py-2">
                  Mastercard •••• 2345
                </div>
                <div className="rounded-lg border px-3 py-2">
                  VISA •••• 3456
                </div>
                <button
                  type="button"
                  onClick={startCheckout}
                  className="text-rose-500 text-sm underline decoration-dotted text-left"
                >
                  + Add Card
                </button>
                {clientSecret && (
                  <div className="text-xs text-neutral-500">
                    Stripe intent: {clientSecret}
                  </div>
                )}
              </div>
            </div>

            {/* Paypal */}
            <div className="mt-3 rounded-xl border bg-white p-4 shadow-sm">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={method === "paypal"}
                  onChange={() => setMethod("paypal")}
                />
                <div className="font-medium">Paypal</div>
              </label>
            </div>
          </div>
        </div>

        {/* Pay button */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={() => nav(`/subscription/confirm?plan=${planId}`)}
            className="rounded-lg bg-rose-400 px-8 py-2 text-white hover:bg-rose-500"
          >
            Pay
          </button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
