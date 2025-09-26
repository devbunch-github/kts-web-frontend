import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { confirmCheckout } from "../../api/publicApi";

export default function ConfirmPage(){
  const [search]=useSearchParams(); const planId=Number(search.get("plan"));
  const userId=1; const nav=useNavigate();
  useEffect(()=>{ confirmCheckout({plan_id:planId,user_id:userId}).catch(()=>{}); },[planId]);

  return (
    <div className="min-h-screen bg-white">
      <Header/>
      <section className="relative h-[220px] bg-cover bg-center" style={{backgroundImage:"url(/images/hero-2.jpg)"}}>
        <div className="absolute inset-0 bg-black/40"/><div className="relative z-10 container-7xl flex h-full items-end px-4 pb-8">
          <h1 className="text-3xl font-semibold text-white">Subscription</h1></div>
      </section>

      <section className="container-7xl section-pad">
        <div className="mx-auto max-w-2xl rounded-2xl border bg-white p-10 text-center shadow-[var(--card-shadow)]">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-300/70 text-white">✓</div>
          <h2 className="mt-4 text-lg font-semibold">You’ve successfully subscribed to your plan!</h2>
          <p className="mt-2 text-sm text-neutral-600">Your plan is now active. Manage your subscription anytime from your dashboard.</p>
          <button onClick={()=>nav('/')} className="mt-6 rounded-lg bg-rose-400 px-6 py-2 text-white hover:bg-rose-500">Back to Home</button>
        </div>
      </section>
      <Footer/>
    </div>
  );
}
