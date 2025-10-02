import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { useSearchParams } from "react-router-dom";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import {
  createStripeIntent,
  createPayPalOrder,
  capturePayPalOrder,
  confirmPayment,
} from "../../api/publicApi";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export default function PaymentPage() {
  const [search] = useSearchParams();
  const planId = Number(search.get("plan"));
  const userId = Number(search.get("user_id"));

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <section
        className="relative h-[220px] bg-cover bg-center"
        style={{ backgroundImage: "url(/images/hero-3.jpg)" }}
      >
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 container-7xl flex h-full items-end px-4 pb-8">
          <h1 className="text-3xl font-semibold text-white">Subscription Payment</h1>
        </div>
      </section>

      <section className="container-7xl section-pad">
        <div className="mx-auto w-full max-w-lg space-y-6">
          {/* Stripe */}
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <h3 className="mb-3 text-lg font-medium">Pay with Credit / Debit Card</h3>
            <Elements stripe={stripePromise}>
              <StripeCheckout planId={planId} userId={userId} />
            </Elements>
          </div>

          {/* PayPal */}
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <h3 className="mb-3 text-lg font-medium">Pay with PayPal</h3>
            <PayPalCheckout planId={planId} userId={userId} />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function StripeCheckout({ planId, userId }) {
  const stripe = useStripe();
  const elements = useElements();

  const handleStripePay = async () => {
    try {
      const { client_secret } = await createStripeIntent({ plan_id: planId, user_id: userId });
      const result = await stripe.confirmCardPayment(client_secret, {
        payment_method: { card: elements.getElement(CardElement) },
      });

      if (result.error) {
        alert(result.error.message);
      } else if (result.paymentIntent?.status === "succeeded") {
        await confirmPayment({ payment_id: result.paymentIntent.id });
        window.location.href = `/subscription/set-password?user_id=${userId}`;
      }
    } catch (err) {
      console.error("Stripe payment failed", err);
      alert("Payment failed. Try again.");
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg border px-3 py-2">
        <CardElement />
      </div>
      <button
        onClick={handleStripePay}
        disabled={!stripe}
        className="w-full rounded-lg bg-rose-400 px-6 py-2 text-white hover:bg-rose-500"
      >
        Pay with Card
      </button>
    </div>
  );
}

function PayPalCheckout({ planId, userId }) {
  return (
    <PayPalScriptProvider options={{ "client-id": import.meta.env.VITE_PAYPAL_CLIENT_ID }}>
      <PayPalButtons
        style={{ layout: "vertical", color: "gold" }}
        createOrder={async () => {
          const { id } = await createPayPalOrder({ plan_id: planId, user_id: userId });
          return id;
        }}
        onApprove={async (data) => {
          await capturePayPalOrder({ order_id: data.orderID });
          window.location.href = `/subscription/set-password?user_id=${userId}`;
        }}
      />
    </PayPalScriptProvider>
  );
}
