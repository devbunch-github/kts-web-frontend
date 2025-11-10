import { X } from "lucide-react";

export default function PaymentMethodModal({
  open,
  onClose,
  plan,
  onStripe,
  onPayPal,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-3 sm:px-0">
      <div className="bg-[#fffaf9] rounded-2xl shadow-xl w-full max-w-2xl border border-[#f2d9d9] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-[#f2d9d9] bg-[#fdf2f2] px-6 py-4">
          <h3 className="text-[20px] font-semibold text-[#3a1f1f]">
            Complete Your Subscription
          </h3>
          <button
            onClick={onClose}
            className="rounded-full p-1 hover:bg-[#f6e4e4] transition"
          >
            <X size={20} className="text-[#a66c6c]" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <div className="rounded-2xl border border-[#f0d5d5] bg-white shadow-sm overflow-hidden">
            {/* Summary Header */}
            <div className="border-b border-[#f0d5d5] bg-[#fdecec] px-5 py-3 flex justify-between items-center">
              <span className="text-[15px] font-semibold text-[#3a1f1f]">
                Subscription Summary
              </span>
              <span className="text-[#b77c7c] font-medium text-[14px]">
                {plan?.name}
              </span>
            </div>

            {/* Plan Price */}
            <div className="flex justify-between items-center px-5 py-3 border-b border-[#f0d5d5] text-[#3a1f1f]">
              <span className="text-[15px]">Plan Price</span>
              <span className="font-medium text-[15px]">
                £ {plan?.price} <span className="text-sm">/month</span>
              </span>
            </div>

            {/* Included Features */}
            <div className="px-5 py-4 border-b border-[#f0d5d5] bg-[#fffaf9]">
              <p className="font-medium text-[#3a1f1f] mb-2 text-[15px]">
                Included Features:
              </p>
              <ul className="list-disc list-inside text-[#5b4b4b] text-sm space-y-0.5 pl-1">
                {plan?.features?.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            </div>

            {/* Payment Method */}
            <div className="px-5 py-4 bg-[#fdecec]">
              <p className="font-medium mb-2 text-[#3a1f1f] text-[15px]">
                Choose Payment Method
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={onStripe}
                  className="flex-1 bg-[#635bff] hover:bg-[#4a42d6] text-white font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all shadow-sm"
                >
                  <img
                    src="/images/icons/stripe-btn.png"
                    alt="Stripe"
                    className="w-5 h-5"
                  />
                  <span>Pay with Stripe</span>
                </button>
                <button
                  onClick={onPayPal}
                  className="flex-1 bg-[#ffc439] hover:bg-[#f5b500] text-[#2a1b1b] font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all shadow-sm"
                >
                  <img
                    src="/images/icons/paypal-btn.png"
                    alt="PayPal"
                    className="w-5 h-5"
                  />
                  <span>Pay with PayPal</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
