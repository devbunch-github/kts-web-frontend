import { useEffect, useMemo, useState } from "react";
import http from "@/api/http";
import toast from "react-hot-toast";
import { ChevronUp } from "lucide-react";

const Section = ({ children }) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-rose-100/40">
    {children}
  </div>
);

export default function LoyaltyCardPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    is_enabled: false,
    min_purchase_amount: 10,
    tiers_per_card: 3,
    stamps_per_tier: 4,
    tiers: [
      { reward_type: "percentage", reward_value: 0 },
      { reward_type: "percentage", reward_value: 0 },
      { reward_type: "percentage", reward_value: 0 },
    ],
  });

  // Load existing data
  useEffect(() => {
    (async () => {
      try {
        const { data } = await http.get("/api/loyalty-card");
        if (data?.data) {
          const d = data.data;
          setForm({
            is_enabled: d.is_enabled ?? false,
            min_purchase_amount: d.min_purchase_amount ?? 10,
            tiers_per_card: d.tiers_per_card ?? 1,
            stamps_per_tier: d.stamps_per_tier ?? 3,
            tiers: d.tiers?.length
              ? d.tiers
              : Array.from({ length: d.tiers_per_card ?? 1 }).map(() => ({
                  reward_type: "percentage",
                  reward_value: 0,
                })),
          });
        }
      } catch (e) {
        console.error(e);
        toast.error("Failed to load loyalty card settings");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Update tier count dynamically
  const setTierCount = (count) => {
    setForm((f) => {
      const tiers = [...f.tiers];
      if (count > tiers.length) {
        while (tiers.length < count)
          tiers.push({ reward_type: "percentage", reward_value: 0 });
      } else if (count < tiers.length) {
        tiers.length = count;
      }
      return { ...f, tiers_per_card: count, tiers };
    });
  };

  // Save handler
  const onSave = async () => {
    setSaving(true);
    try {
      const payload = { ...form, tiers: form.tiers };
      await http.post("/api/loyalty-card", payload);
      toast.success("Saved");
    } catch (e) {
      console.error(e);
      toast.error(e?.response?.data?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const summary = useMemo(() => {
    return `Each £${Number(form.min_purchase_amount).toFixed(
      0
    )} spent = 1 stamp. User gets reward set for each tier.`;
  }, [form]);

  if (loading) return <div className="p-6">Loading…</div>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Loyalty Card</h1>

      {/* ---- Settings Section ---- */}
      <Section>
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">Loyalty Cards Enabled</div>

          {/* 🌸 Animated toggle identical to Loyalty Program */}
          <label className="relative inline-flex items-center cursor-pointer select-none">
            <input
              type="checkbox"
              checked={form.is_enabled}
              onChange={(e) =>
                setForm({ ...form, is_enabled: e.target.checked })
              }
              className="sr-only peer"
            />
            <div
              className="
                w-12 h-7
                bg-gray-300
                rounded-full
                peer-checked:bg-rose-400
                transition-colors
                duration-300
                relative
                shadow-inner
              "
            >
              <span
                className="
                  absolute
                  top-0.5
                  left-0.5
                  w-6
                  h-6
                  bg-white
                  rounded-full
                  shadow-md
                  transition-transform
                  duration-300
                  transform
                  peer-checked:translate-x-[20px]
                "
              ></span>
            </div>
          </label>
        </div>

        {/* ---- Numeric Inputs ---- */}
        <div className="grid md:grid-cols-2 gap-4 mt-6">
          {/* Min Purchase */}
          <div className="border rounded-xl p-4">
            <div className="text-xs text-gray-500">Min Purchase</div>
            <div className="flex items-center gap-3 mt-2">
              <button
                className="px-3 py-1.5 rounded-lg border"
                onClick={() =>
                  setForm((f) => ({
                    ...f,
                    min_purchase_amount: Math.max(
                      0,
                      Number(f.min_purchase_amount) - 1
                    ),
                  }))
                }
              >
                −
              </button>
              <input
                type="number"
                value={form.min_purchase_amount}
                onChange={(e) =>
                  setForm({ ...form, min_purchase_amount: e.target.value })
                }
                className="flex-1 px-3 py-2 border rounded-lg"
              />
              <button
                className="px-3 py-1.5 rounded-lg border"
                onClick={() =>
                  setForm((f) => ({
                    ...f,
                    min_purchase_amount:
                      Number(f.min_purchase_amount) + 1,
                  }))
                }
              >
                +
              </button>
            </div>
          </div>

          {/* Tiers per card */}
          <div className="border rounded-xl p-4">
            <div className="text-xs text-gray-500">Tiers per card (1–5)</div>
            <div className="flex items-center gap-3 mt-2">
              <button
                className="px-3 py-1.5 rounded-lg border"
                onClick={() => setTierCount(Math.max(1, form.tiers_per_card - 1))}
              >
                −
              </button>
              <input
                type="number"
                className="flex-1 px-3 py-2 border rounded-lg"
                value={form.tiers_per_card}
                onChange={(e) =>
                  setTierCount(
                    Math.min(5, Math.max(1, Number(e.target.value)))
                  )
                }
              />
              <button
                className="px-3 py-1.5 rounded-lg border"
                onClick={() =>
                  setTierCount(Math.min(5, form.tiers_per_card + 1))
                }
              >
                +
              </button>
            </div>
          </div>

          {/* Stamps per tier */}
          <div className="md:col-span-2 border rounded-xl p-4">
            <div className="text-xs text-gray-500">Stamps per tier (3–6)</div>
            <div className="flex items-center gap-3 mt-2">
              <button
                className="px-3 py-1.5 rounded-lg border"
                onClick={() =>
                  setForm((f) => ({
                    ...f,
                    stamps_per_tier: Math.max(3, f.stamps_per_tier - 1),
                  }))
                }
              >
                −
              </button>
              <input
                type="number"
                className="flex-1 px-3 py-2 border rounded-lg"
                value={form.stamps_per_tier}
                onChange={(e) =>
                  setForm({
                    ...form,
                    stamps_per_tier: Math.min(
                      6,
                      Math.max(3, Number(e.target.value))
                    ),
                  })
                }
              />
              <button
                className="px-3 py-1.5 rounded-lg border"
                onClick={() =>
                  setForm((f) => ({
                    ...f,
                    stamps_per_tier: Math.min(6, f.stamps_per_tier + 1),
                  }))
                }
              >
                +
              </button>
            </div>
          </div>
        </div>
      </Section>

      {/* ---- Tier Rewards ---- */}
      <Section>
        <div className="space-y-6">
          {form.tiers.map((tier, i) => (
            <div key={i} className="grid md:grid-cols-6 gap-3 items-start">
              <div className="md:col-span-4">
                <label className="text-sm text-gray-700 block mb-2">
                  {`Tier ${i + 1} Reward Discount`}
                </label>
                <input
                  placeholder="e.g. 25"
                  value={tier.reward_value}
                  onChange={(e) =>
                    setForm((f) => {
                      const tiers = [...f.tiers];
                      tiers[i] = {
                        ...tiers[i],
                        reward_value: e.target.value,
                      };
                      return { ...f, tiers };
                    })
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-sm text-gray-700 block mb-2">Type</label>
                <div className="relative">
                  <select
                    value={tier.reward_type}
                    onChange={(e) =>
                      setForm((f) => {
                        const tiers = [...f.tiers];
                        tiers[i] = {
                          ...tiers[i],
                          reward_type: e.target.value,
                        };
                        return { ...f, tiers };
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg appearance-none"
                  >
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed price</option>
                  </select>
                  <ChevronUp className="absolute right-3 top-3 h-4 w-4 text-gray-500 rotate-180" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ---- Summary ---- */}
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <span className="w-2 h-2 rounded-full bg-gray-400"></span>
        <span className="truncate">{summary}</span>
      </div>

      {/* ---- Save ---- */}
      <div className="flex justify-end">
        <button
          onClick={onSave}
          disabled={saving}
          className="px-6 py-3 bg-rose-300 hover:bg-rose-400 text-white rounded-xl shadow disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
}
