import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { useEffect, useState } from "react";
import { getPlans } from "../../api/publicApi";
import { useNavigate } from "react-router-dom";

export default function PlansPage(){
  const [plans,setPlans]=useState([]); const nav=useNavigate();
  useEffect(()=>{ getPlans().then(setPlans); },[]);
  return (
    <div className="min-h-screen bg-white">
      <Header/>
      <section className="relative h-[260px] md:h-[320px] bg-cover bg-center" style={{backgroundImage:"url(/images/hero-2.jpg)"}}>
        <div className="absolute inset-0 bg-black/40"/><div className="relative z-10 container-7xl flex h-full items-end px-4 pb-8">
          <h1 className="text-3xl md:text-4xl font-semibold text-white">Subscription</h1></div>
      </section>

      <section className="container-7xl section-pad">
        <div className="text-center">
          <div className="text-rose-400 text-sm font-medium">Subscription</div>
          <h2 className="mt-2 text-2xl md:text-3xl font-semibold">Plans & Pricing</h2>
          <p className="mt-2 text-sm text-neutral-600">Start with the plan that works for you. Upgrade anytime!</p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {plans.map(p=>(
            <article key={p.id} className="rounded-xl border bg-rose-50/60 p-5 shadow-sm">
              <div className="flex items-baseline justify-between">
                <h3 className="text-[16px] font-semibold underline decoration-2">{p.name}</h3>
                <div className="text-right">
                  <div className="text-sm">£ <span className="text-[18px] font-semibold">{Number(p.price).toFixed(2)}</span></div>
                  <div className="text-[11px] text-neutral-500">/ month</div>
                </div>
              </div>
              <div className="mt-4 text-[13px] text-neutral-700">
                <div className="font-semibold mb-2">Plan includes :</div>
                <ul className="space-y-2">{(p.features||[]).map((f,i)=>(<li key={i} className="flex items-start gap-2">✔<span>{f}</span></li>))}</ul>
              </div>
              <button onClick={()=>nav("/subscription/payment?plan="+p.id)} className="mt-6 w-full rounded-lg bg-rose-400 py-2 text-white hover:bg-rose-500">Choose Plan</button>
            </article>
          ))}
        </div>
      </section>
      <Footer/>
    </div>
  );
}
