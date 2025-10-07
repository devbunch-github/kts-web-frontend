import { useEffect, useState } from "react";
import axios from "axios";

export default function PlansPage() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/plans`);
        setPlans(res.data.data || res.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load plans. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  return (
    <div className="bg-white text-[#1b1b1b] pt-[90px]">
      {/* ─── Hero Section ───────────────────────────── */}
      <section className="relative h-[420px] w-full overflow-hidden">
        <img
          src="/images/hero-3.png"
          alt="Subscription banner"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative flex h-full flex-col items-center justify-center text-white">
          <h1 className="text-[36px] font-semibold tracking-tight">Subscription</h1>
        </div>
      </section>

      {/* ─── Plans & Pricing Section ───────────────────── */}
      <section className="mx-auto max-w-[1150px] px-4 py-20 text-center">
        <p className="text-[15px] text-[#b97979] font-medium">Subscription</p>
        <h2 className="mt-1 text-[28px] font-semibold text-[#1b1b1b]">
          Plans & Pricing
        </h2>
        <p className="mt-3 text-[15px] text-[#6b6b6b]">
          Start with the plan that works for you. Upgrade anytime!
        </p>

        {loading && (
          <p className="mt-10 text-[#b97979]">Loading plans...</p>
        )}

        {error && (
          <p className="mt-10 text-[#c00]">{error}</p>
        )}

        {!loading && !error && (
          <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {plans.map((plan, index) => {
              const isPopular = index === 3 || plan.is_popular;
              return (
                <div
                  key={plan.id}
                  className={`relative rounded-2xl border transition-all duration-300 ${
                    isPopular
                      ? "border-[#c98383] bg-[#fff7f7] shadow-[0_8px_20px_rgba(0,0,0,0.08)] scale-[1.02]"
                      : "border-[#f0f0f0] bg-[#fffafa] hover:shadow-[0_6px_18px_rgba(0,0,0,0.07)]"
                  }`}
                >
                  {isPopular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#c98383] px-4 py-1 text-[13px] font-medium text-white shadow-sm">
                      Popular
                    </div>
                  )}
                  <div className="flex flex-col items-center justify-center px-8 py-10">
                    <h3 className="text-[18px] font-semibold text-[#1b1b1b] mb-1">
                      {plan.name}
                    </h3>
                    <p className="text-[26px] font-semibold text-[#1b1b1b]">
                      £ {(plan.price_minor / 100).toFixed(2)}
                    </p>
                    <p className="text-[13px] text-[#6b6b6b] mb-6">/ month</p>

                    <div className="w-full border-t border-[#e7e7e7] mb-6"></div>

                    <p className="text-[14px] font-medium text-[#1b1b1b] mb-3">
                      Plan includes:
                    </p>
                    <ul className="text-left text-[14px] text-[#555] space-y-2">
                      {Array.isArray(plan.features)
                        ? plan.features.map((f, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-[#b97979]">✓</span>
                              <span>{f}</span>
                            </li>
                          ))
                        : typeof plan.features === "string"
                        ? plan.features
                            .split(",")
                            .map((f, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <span className="text-[#b97979]">✓</span>
                                <span>{f.trim()}</span>
                              </li>
                            ))
                        : null}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
