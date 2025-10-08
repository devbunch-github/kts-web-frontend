import { useState, useEffect } from "react";
import axios from "../api/http";

export default function Filters({ onChange }) {
  const [category, setCategory] = useState("");
  const [services, setServices] = useState([]);
  const [allServices, setAllServices] = useState([]);

  useEffect(() => {
    axios.get("/api/services").then(r => setAllServices(r.data?.data ?? r.data ?? []));
  }, []);

  const toggle = (id) => setServices(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const apply = () => onChange?.({ category, service_ids: services.join(",") });

  return (
    <aside className="w-full md:w-[260px] space-y-4">
      <Panel title="Categories">
        <div className="space-y-2">
          {["Hair & Styling","Skincare","Makeup"].map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`w-full rounded-lg px-3 py-2 text-left text-[13px] ${
                category === c ? "bg-rose-50 text-[#7a5050] ring-1 ring-rose-200" : "text-neutral-600 hover:bg-neutral-50"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </Panel>

      <Panel title="Services">
        <div className="space-y-2">
          {allServices.map(s => (
            <label key={s.id} className="flex items-center gap-2 text-[13px] text-neutral-700">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-neutral-300 text-[#c98383] focus:ring-[#c98383]"
                checked={services.includes(s.id)}
                onChange={() => toggle(s.id)}
              />
              {s.name}
            </label>
          ))}
        </div>
      </Panel>

      <Panel title="Gift Cards">
        <p className="text-xs leading-relaxed text-neutral-500">
          Buy and redeem gift cards for services.
        </p>
      </Panel>

      <button
        onClick={apply}
        className="w-full rounded-lg bg-[#c98383] px-3 py-2 text-sm font-semibold text-white shadow hover:bg-[#b97878]"
      >
        Apply Filters
      </button>
    </aside>
  );
}

function Panel({ title, children }) {
  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm">
      <div className="mb-3 text-sm font-medium text-neutral-700">{title}</div>
      {children}
    </div>
  );
}
