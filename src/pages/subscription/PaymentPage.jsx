import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { useSearchParams } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import axios from "../../api/http";
import { useState } from "react";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export default function PaymentPage() {
  const [search] = useSearchParams();
  const planId = Number(search.get("plan"));
  const userId = Number(search.get("user")); // user passed in URL or context
  const [loading, setLoading] = useState(false);

  const payWithStripe = async () => {
    try {
      setLoading(true);
      const { data } = await axios.post("/api/subscription/stripe", {
        plan_id: planId,
        user_id: userId,
      });

      // ✅ Stripe deprecated redirectToCheckout; use returned checkout URL
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        alert("Unable to start Stripe checkout. Please try again.");
      }
    } catch (err) {
      console.error(err);
      alert("Stripe checkout failed.");
    } finally {
      setLoading(false);
    }
  };


  const payWithPayPal = async () => {
    try {
      setLoading(true);
      const { data } = await axios.post("/api/subscription/paypal", {
        plan_id: planId,
        user_id: userId,
      });
      window.location.href = data.approvalUrl;
    } catch (err) {
      console.error(err);
      alert("PayPal checkout failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <section className="container-7xl section-pad">
        <div className="mx-auto w-full max-w-lg space-y-6">
          <h2 className="text-2xl font-semibold text-center mb-4">
            Complete Your Subscription
          </h2>
          <button
            onClick={payWithStripe}
            disabled={loading}
            className="w-full rounded-lg bg-blue-500 px-6 py-3 text-white font-semibold hover:bg-blue-600 disabled:opacity-50"
          >
            Pay with Stripe
          </button>

          <button
            onClick={payWithPayPal}
            disabled={loading}
            className="w-full rounded-lg bg-yellow-400 px-6 py-3 font-semibold hover:bg-yellow-500 disabled:opacity-50"
          >
            Pay with PayPal
          </button>
        </div>
      </section>
      <Footer />
    </div>
  );
}
