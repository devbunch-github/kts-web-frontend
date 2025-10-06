import { useState, useEffect } from "react";
import axios from "../api/http"; // to fetch /api/services

export default function Filters({onChange}){
  const [category,setCategory]=useState("");
  const [services,setServices]=useState([]);
  const [allServices,setAllServices]=useState([]);

  useEffect(()=>{ axios.get("/api/services").then(r=>setAllServices(r.data?.data ?? r.data ?? []));},[]);

  const toggle=(id)=> setServices(prev=> prev.includes(id)? prev.filter(x=>x!==id) : [...prev,id]);
  const apply=()=> onChange?.({ category, service_ids: services.join(",") });

  return (
    <aside className="w-full md:w-[260px] space-y-4">
      <Panel title="Categories">
        {["Hair & Styling","Skincare","Makeup"].map(c=>(
          <label key={c} className="flex cursor-pointer items-center justify-between rounded-md px-2 py-1 hover:bg-neutral-50">
            <span className="text-sm text-neutral-800">{c}</span>
            <input type="radio" name="cat" className="accent-rose-400" checked={category===c} onChange={()=>setCategory(c)}/>
          </label>
        ))}
      </Panel>

      <Panel title="Services">
        <div className="max-h-64 space-y-1 overflow-auto pr-1">
          {allServices.map(s=>(
            <label key={s.id} className="flex items-center gap-2 rounded-md px-2 py-1 hover:bg-neutral-50">
              <input type="checkbox" className="accent-rose-400" checked={services.includes(s.id)} onChange={()=>toggle(s.id)}/>
              <span className="text-sm text-neutral-800">{s.name}</span>
            </label>
          ))}
        </div>
      </Panel>

      <Panel title="Gift Cards">
        <p className="text-xs leading-relaxed text-neutral-500">Buy and redeem gift cards for services.</p>
      </Panel>

      <button onClick={apply} className="w-full rounded-lg bg-rose-400 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-rose-500">
        Apply Filters
      </button>
    </aside>
  );
}
function Panel({title,children}){return(
  <div className="rounded-2xl border bg-white p-4 shadow-sm">
    <div className="mb-3 text-sm font-medium text-neutral-700">{title}</div>{children}
  </div>
);}
