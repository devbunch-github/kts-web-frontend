import { useEffect, useRef, useState } from "react";
import http from "@/api/http";
import toast from "react-hot-toast";
import { ChevronUp } from "lucide-react";

const Section = ({ children }) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-rose-100/40">
    {children}
  </div>
);

export default function LoyaltyProgramPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [summary, setSummary] = useState({
    outstanding_total: 0,
    total_outstanding_value: 0,
    total_credits_value: 0,
  });
  const [services, setServices] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [form, setForm] = useState({
    is_enabled: false,
    points_per_currency: 1,
    points_per_redemption_currency: 50,
    service_ids: [],
  });

  const dropdownRef = useRef();

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Load data
  useEffect(() => {
    (async () => {
      try {
        const [settingsRes, summaryRes, servicesRes] = await Promise.all([
          http.get("/api/loyalty-program"),
          http.get("/api/loyalty-program/summary"),
          http.get("/api/services?all=1"),
        ]);

        const settings = settingsRes?.data?.data || {};
        const servicesList = (servicesRes?.data?.data || []).map((s) => ({
          id: String(s.Id),
          name: s.Name,
        }));

        setServices(servicesList);
        setSummary(summaryRes?.data || {});
        setForm((f) => ({
          ...f,
          is_enabled: Boolean(settings.is_enabled),
          points_per_currency: Number(settings.points_per_currency ?? 1),
          points_per_redemption_currency: Number(
            settings.points_per_redemption_currency ?? 50
          ),
          service_ids: (settings.service_ids || []).map(String),
        }));
      } catch (err) {
        console.error(err);
        toast.error("Failed to load loyalty program settings");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Derived flag
  const allSelected =
    services.length > 0 &&
    form.service_ids.length === services.length &&
    services.every((s) => form.service_ids.includes(s.id));

  // Toggle single service
  const toggleService = (id) => {
    setForm((f) => {
      const exists = f.service_ids.includes(id);
      return {
        ...f,
        service_ids: exists
          ? f.service_ids.filter((x) => x !== id)
          : [...f.service_ids, id],
      };
    });
  };

  // Toggle all
  const toggleAll = () => {
    setForm((f) => ({
      ...f,
      service_ids: allSelected ? [] : services.map((s) => s.id),
    }));
  };

  // Save
  const onSave = async () => {
    setSaving(true);
    try {
      const payload = {
        ...form,
        service_ids: form.service_ids.map((x) => Number(x)),
      };
      await http.post("/api/loyalty-program", payload);
      toast.success("Saved successfully");
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  // ✅ Proper animated loader
  if (loading)
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] gap-4">
        <div className="w-10 h-10 border-4 border-rose-300 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-600 text-sm font-medium">
          Loading loyalty program settings...
        </p>
      </div>
    );

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Loyalty Program</h1>

      {/* Summary cards */}
      <div className="grid md:grid-cols-3 gap-4">
        {[
          { label: "Outstanding Total", value: summary.outstanding_total },
          {
            label: "Total Outstanding Loyalty Value",
            value: `£${Number(summary.total_outstanding_value).toFixed(2)}`,
          },
          {
            label: "Total Credits Value",
            value: `£${Number(summary.total_credits_value).toFixed(2)}`,
          },
        ].map((c, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl p-6 shadow-sm border border-rose-100/40"
          >
            <div className="text-sm text-gray-600 mb-2">{c.label}</div>
            <div className="text-2xl font-semibold">{c.value}</div>
          </div>
        ))}
      </div>

      <Section>
        {/* Enable / Disable toggle */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">Loyalty Program Enabled</div>

          {/* 🌸 Animated toggle identical to Loyalty Card */}
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

        {/* Points settings */}
        <div className="grid md:grid-cols-2 gap-4 mt-6">
          <div className="border rounded-xl p-4">
            <div className="text-xs text-gray-500">
              Points Earned (per £ spent)
            </div>
            <div className="flex items-center gap-3 mt-2">
              <button
                className="px-3 py-1.5 rounded-lg border"
                onClick={() =>
                  setForm((f) => ({
                    ...f,
                    points_per_currency: Math.max(0, f.points_per_currency - 1),
                  }))
                }
              >
                −
              </button>
              <input
                type="number"
                className="flex-1 px-3 py-2 border rounded-lg"
                value={form.points_per_currency}
                onChange={(e) =>
                  setForm({
                    ...form,
                    points_per_currency: Number(e.target.value),
                  })
                }
              />
              <button
                className="px-3 py-1.5 rounded-lg border"
                onClick={() =>
                  setForm((f) => ({
                    ...f,
                    points_per_currency: f.points_per_currency + 1,
                  }))
                }
              >
                +
              </button>
            </div>
          </div>

          <div className="border rounded-xl p-4">
            <div className="text-xs text-gray-500">
              Points Redeemed (points to redeem £1)
            </div>
            <div className="flex items-center gap-3 mt-2">
              <button
                className="px-3 py-1.5 rounded-lg border"
                onClick={() =>
                  setForm((f) => ({
                    ...f,
                    points_per_redemption_currency: Math.max(
                      1,
                      f.points_per_redemption_currency - 1
                    ),
                  }))
                }
              >
                −
              </button>
              <input
                type="number"
                className="flex-1 px-3 py-2 border rounded-lg"
                value={form.points_per_redemption_currency}
                onChange={(e) =>
                  setForm({
                    ...form,
                    points_per_redemption_currency: Math.max(
                      1,
                      Number(e.target.value)
                    ),
                  })
                }
              />
              <button
                className="px-3 py-1.5 rounded-lg border"
                onClick={() =>
                  setForm((f) => ({
                    ...f,
                    points_per_redemption_currency:
                      f.points_per_redemption_currency + 1,
                  }))
                }
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Services multi-select */}
        <div className="mt-6 relative" ref={dropdownRef}>
          <label className="text-sm text-gray-700 block mb-2">
            Select Services
          </label>

          <div
            className="w-full px-3 py-2 border rounded-lg flex items-center justify-between cursor-pointer bg-white"
            onClick={() => setIsDropdownOpen((o) => !o)}
          >
            <div className="text-gray-700 text-sm truncate">
              {form.service_ids.length === 0
                ? "None selected"
                : allSelected
                ? "All Services"
                : `${form.service_ids.length} selected`}
            </div>
            <ChevronUp
              className={`h-4 w-4 text-gray-500 transition-transform ${
                isDropdownOpen ? "rotate-0" : "rotate-180"
              }`}
            />
          </div>

          {isDropdownOpen && (
            <div className="absolute z-10 mt-2 w-full bg-white border rounded-lg shadow-lg max-h-60 overflow-auto">
              <div className="px-3 py-2 border-b">
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                  />
                  <span className="text-sm">All Services</span>
                </label>
              </div>

              <div className="p-2 space-y-1">
                {services.map((s) => (
                  <label
                    key={s.id}
                    className="w-full inline-flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={form.service_ids.includes(s.id)}
                      onChange={() => toggleService(s.id)}
                    />
                    <span className="text-sm">{s.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      </Section>

      {/* Summary */}
      <div className="text-xs text-gray-500 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-gray-400"></span>
        <span>
          Each £1 spent = {form.points_per_currency} point. To redeem £1 ={" "}
          {form.points_per_redemption_currency} points.
        </span>
      </div>

      {/* Save button */}
      <div className="flex justify-end">
        <button
          onClick={onSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-rose-300 hover:bg-rose-400 text-white rounded-xl shadow disabled:opacity-50"
        >
          {saving ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Saving...</span>
            </>
          ) : (
            "Save"
          )}
        </button>
      </div>
    </div>
  );
}
