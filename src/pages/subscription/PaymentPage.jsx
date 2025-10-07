import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getPlanById, createStripeSession, createPaypalOrder } from "../../api/subscriptionApi";

export default function PaymentPage() {
  const [searchParams] = useSearchParams();
  const planId = searchParams.get("plan");
  const userId = searchParams.get("user");
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (planId) {
      getPlanById(planId)
        .then(setPlan)
        .catch(() => {});
    }
  }, [planId]);

  const payWithStripe = async () => {
    if (!plan || !userId) return;
    setLoading(true);
    try {
      const res = await createStripeSession({ plan_id: plan.id, user_id: userId });
      const redirectUrl = res?.checkoutUrl;

      if (redirectUrl) {
        window.location.href = redirectUrl;
      } else {
        console.error("Stripe checkout URL missing:", res);
        alert("Unable to start Stripe checkout.");
      }
    } catch (err) {
      console.error(err);
      alert("Stripe payment failed.");
    } finally {
      setLoading(false);
    }
  };

  const payWithPaypal = async () => {
    if (!plan || !userId) return;
    setLoading(true);
    try {
      const res = await createPaypalOrder({ plan_id: plan.id, user_id: userId });
      const approvalUrl = res?.approvalUrl;

      if (approvalUrl) {
        window.location.href = approvalUrl;
      } else {
        console.error("PayPal approval URL missing:", res);
        alert("Unable to start PayPal checkout.");
      }
    } catch (err) {
      console.error(err);
      alert("PayPal payment failed.");
    } finally {
      setLoading(false);
    }
  };

  if (!plan) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center text-gray-500 text-sm">
        Loading plan details...
      </div>
    );
  }

  return (
    <div className="bg-white text-[#1b1b1b] pt-[90px]">
      {/* ─── Hero Section ───────────────────────────── */}
      <section className="relative h-[360px] w-full overflow-hidden">
        <img
          src="/images/hero-2.png"
          alt="Subscription banner"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative flex h-full flex-col items-center justify-center text-white">
          <h1 className="text-[36px] font-semibold tracking-tight">Subscription</h1>
        </div>
      </section>

      {/* ─── Breadcrumb ───────────────────────────── */}
      <div className="w-full bg-[#c98383]/20 py-3">
        <div className="max-w-[960px] mx-auto px-4 text-sm">
          <span className="text-[#c98383] font-medium">Subscription</span>
          <span className="text-[#555] mx-2">›</span>
          <span className="text-[#1b1b1b] font-medium">Payment</span>
        </div>
      </div>

      {/* ─── Payment Section ───────────────────── */}
      <section className="max-w-[640px] mx-auto px-4 py-16 text-center">
        <p className="text-[15px] text-[#b97979] font-medium mb-2">Subscription</p>
        <h2 className="text-[26px] font-semibold text-[#1b1b1b]">
          Complete Your Subscription
        </h2>

        <div className="mt-10 rounded-xl border border-[#eee] text-left shadow-sm">
          {/* Header */}
          <div className="flex justify-between items-center px-6 py-3 border-b border-[#eee]">
            <p className="text-[15px] font-semibold text-[#1b1b1b]">
              Subscription Summary
            </p>
            <span className="text-[13px] bg-[#f7eaea] text-[#b97979] px-2 py-[2px] rounded">
              {plan.name}
            </span>
          </div>

          {/* Body */}
          <div className="px-6 py-6 space-y-4">
            <div className="flex justify-between text-[15px]">
              <span className="text-[#555]">Plan Price</span>
              <span className="text-[#1b1b1b] font-medium">
                £ {plan.price_minor / 100} per month
              </span>
            </div>

            <div className="flex justify-between text-[15px] border-t border-[#eee] pt-3">
              <span className="text-[#555] font-medium">Total Amount</span>
              <span className="text-[#b97979] font-semibold">
                £ {plan.price_minor / 100} per month
              </span>
            </div>

            <div className="mt-3 text-[14px] text-[#555]">
              <p className="mb-1 font-medium">Included Features:</p>
              <ul className="list-disc pl-5 space-y-1">
                {plan.features?.length ? (
                  plan.features.map((f, i) => <li key={i}>{f}</li>)
                ) : (
                  <>
                    <li>Manual Income Tracking</li>
                    <li>Manual Expense Tracking</li>
                  </>
                )}
              </ul>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-[#eee] px-6 py-5">
            <p className="text-[15px] mb-4 font-medium text-[#1b1b1b]">
              Choose Payment Method
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={payWithStripe}
                disabled={loading}
                className="flex items-center justify-center gap-2 w-full rounded-md bg-[#635bff] py-3 text-white font-medium text-[15px] transition-all hover:bg-[#5146e1]"
              >
                <img
                  src="/images/icons/stripe-btn.png"
                  alt="Pay with Stripe"
                  className="h-[20px] w-[20px]"
                />
                Pay with Stripe
              </button>

              <button
                onClick={payWithPaypal}
                disabled={loading}
                className="flex items-center justify-center gap-2 w-full rounded-md bg-[#ffc439] py-3 text-[#111] font-medium text-[15px] transition-all hover:bg-[#e8b627]"
              >
                <img
                  src="/images/icons/paypal-btn.png"
                  alt="Pay with PayPal"
                  className="h-[20px] w-[20px]"
                />
                Pay with PayPal
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
