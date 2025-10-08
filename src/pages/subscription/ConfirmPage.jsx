import { useEffect } from "react";
import { Link } from "react-router-dom";

export default function ConfirmPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-white min-h-screen pt-[100px] text-center text-[#1b1b1b]">
      {/* ─── Hero Section ─────────────────────── */}
      <section className="relative h-[420px] w-full overflow-hidden">
        <img
          src="/images/hero-3.png"
          alt="Subscription hero"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative flex h-full flex-col items-center justify-center text-white">
          <h1 className="text-[36px] font-semibold tracking-tight">Subscription</h1>
        </div>
      </section>

      {/* ─── Breadcrumbs Bar ───────────────────── */}
      <div className="bg-[#b97979] text-white py-3">
        <div className="max-w-[1280px] mx-auto px-6 text-[14px] flex flex-wrap items-center gap-1">
          <Link to="/subscription" className="hover:underline">
            Subscription
          </Link>
          <span>›</span>
          <span className="opacity-90">Payment</span>
          <span>›</span>
          <span className="font-semibold">Confirm</span>
        </div>
      </div>

      {/* ─── Confirmation Card ─────────────────── */}
      <section className="flex justify-center mt-20 mb-24 px-4">
        <div className="w-full max-w-[620px] bg-white border border-[#f3f3f3] rounded-2xl shadow-[0_6px_24px_rgba(0,0,0,0.06)] p-10 text-center">
          <div className="flex justify-center mb-5">
            <div className="h-[60px] w-[60px] bg-[#b97979]/15 rounded-full flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-[28px] w-[28px] text-[#b97979]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>

          <h2 className="text-[18px] font-semibold mb-2">
            You’ve successfully subscribed to your plan!
          </h2>
          <p className="text-[14px] text-[#777] leading-relaxed max-w-[460px] mx-auto">
            Your plan is now active. Manage your subscription anytime from your
            dashboard.
          </p>

          <div className="mt-8 flex justify-center">
            <Link
              to="/"
              className="rounded-full bg-[#c98383] text-white px-6 py-2.5 text-[14px] font-medium transition-all hover:bg-[#b97474] active:scale-[0.98]"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      </section>
     
    </div>
  );
}
