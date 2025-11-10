import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  getPlans,
  getMySubscription,
  upgradeSubscription,
  cancelSubscription,
} from "@/api/businessadminsubscription";
import PaymentMethodModal from "@/components/subscription/BusinessAdminPaymentMethodModal";

export default function BusinessSubscriptionPage() {
  const [plans, setPlans] = useState([]);
  const [activeSub, setActiveSub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [plansList, activeSubData] = await Promise.all([
          getPlans(),
          getMySubscription(),
        ]);
        setPlans(plansList || []);
        setActiveSub(activeSubData || null);
      } catch (err) {
        console.error("Subscription fetch error:", err);
        toast.error("Failed to load subscriptions");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleUpgrade = (plan) => {
    setSelectedPlan(plan);
    setPaymentModalOpen(true);
  };

  const handleUpgradePlan = async (provider) => {
    try {
      toast.loading("Redirecting to checkout...");
      const user = JSON.parse(localStorage.getItem("user"));
      const res = await upgradeSubscription(selectedPlan.id, user.id, provider);
      if (provider === "stripe") window.location.href = res.checkoutUrl;
      if (provider === "paypal") window.location.href = res.approvalUrl;
    } catch (err) {
      console.error(err);
      toast.error("Checkout failed.");
    } finally {
      toast.dismiss();
    }
  };

  const confirmCancelSubscription = async () => {
    try {
      setCancelling(true);
      await cancelSubscription();
      toast.success("Subscription cancelled successfully.");
      setConfirmCancel(false);
      const activeSubData = await getMySubscription();
      setActiveSub(activeSubData || null);
    } catch (err) {
      console.error(err);
      toast.error("Failed to cancel subscription.");
    } finally {
      setCancelling(false);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-64 text-gray-500">
        Loading subscription plans...
      </div>
    );

  return (
    <div className="min-h-screen bg-[#fdf9f9] px-4 md:px-8 py-10">
      {/* Header */}
      <div className="flex items-center gap-3 mb-10">
        <div className="bg-[#eacbcb] p-3 rounded-2xl shadow-sm">
          <i className="bi bi-box2-heart text-[#a76262] text-xl"></i>
        </div>
        <h1 className="text-[28px] font-semibold text-[#2a1b1b]">Subscription</h1>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {plans.map((plan) => {
          const isActive = activeSub?.plan?.id === plan.id;
          return (
            <div
              key={plan.id}
              className={`relative rounded-2xl p-8 transition-all duration-300 shadow-sm border ${
                isActive
                  ? "bg-[#b77c7c] border-[#b77c7c] text-white"
                  : "bg-[#fdecec] border-[#f6d4d4] text-[#2a1b1b]"
              }`}
            >
              {/* Active Badge */}
              {isActive && (
                <span className="absolute top-4 left-5 bg-white/25 text-white text-sm font-medium py-1 px-3 rounded-lg shadow-sm">
                  Active
                </span>
              )}

              {/* Plan Title + Price */}
              <div className="mb-5">
                <h3
                  className={`text-xl font-semibold mb-1 ${
                    isActive ? "text-white" : "text-[#2a1b1b]"
                  }`}
                >
                  {plan.name}
                </h3>
                <p
                  className={`text-[22px] font-bold ${
                    isActive ? "text-white" : "text-[#2a1b1b]"
                  }`}
                >
                  £ {plan.price}
                  <span className="text-[14px] font-normal"> /month</span>
                </p>
              </div>

              {/* Features */}
              <div className="mb-7">
                <p
                  className={`text-sm font-medium mb-2 ${
                    isActive ? "text-white/80" : "text-[#4a3c3c]"
                  }`}
                >
                  Plan includes :
                </p>
                <ul
                  className={`space-y-1 text-[14px] ${
                    isActive ? "text-white" : "text-[#4a3c3c]"
                  }`}
                >
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <i className="bi bi-check2" /> {feature}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Buttons */}
              {isActive ? (
                <button
                  onMouseEnter={(e) =>
                    (e.currentTarget.textContent = "Cancel Subscription")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.textContent = "Current Plan")
                  }
                  onClick={() => setConfirmCancel(true)}
                  className="w-full bg-white text-[#b77c7c] py-2.5 rounded-md font-medium hover:bg-[#f5eaea] transition-all"
                >
                  Current Plan
                </button>
              ) : (
                <button
                  onClick={() => handleUpgrade(plan)}
                  className="w-full bg-[#b77c7c] hover:bg-[#a66c6c] text-white py-2.5 rounded-md font-medium transition-all"
                >
                  Upgrade Plan
                </button>
              )}
            </div>
          );
        })}
      </div>

      {!plans.length && (
        <p className="text-center text-gray-500 mt-20 text-sm">
          No subscription plans available yet.
        </p>
      )}

      {/* Payment Modal */}
      <PaymentMethodModal
        open={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        plan={selectedPlan}
        onStripe={() => handleUpgradePlan("stripe")}
        onPayPal={() => handleUpgradePlan("paypal")}
      />

      {/* Cancel Confirm Modal */}
      {confirmCancel && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={() => !cancelling && setConfirmCancel(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f4e3e3]">
                <i className="bi bi-x-circle text-[#b77c7c] text-lg" />
              </div>
              <div className="flex-1">
                <h3 className="text-[17px] font-semibold text-[#222]">
                  Cancel your subscription?
                </h3>
                <p className="mt-1 text-sm text-gray-600 leading-relaxed">
                  You’ll lose access to premium features immediately after
                  cancelling. This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setConfirmCancel(false)}
                disabled={cancelling}
                className="rounded-lg border border-[#eae2e2] px-4 py-2 text-sm text-[#333] hover:bg-[#faf7f7] disabled:opacity-60"
              >
                Keep Plan
              </button>
              <button
                onClick={confirmCancelSubscription}
                disabled={cancelling}
                className={`rounded-lg px-4 py-2 text-sm text-white ${
                  cancelling
                    ? "bg-[#b77c7c]/60 cursor-not-allowed"
                    : "bg-[#b77c7c] hover:bg-[#a66c6c]"
                }`}
              >
                {cancelling ? "Cancelling…" : "Confirm Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}

      <p className="text-center text-gray-400 text-sm mt-16">
        Copyright © 2024 VRA
      </p>
    </div>
  );
}
