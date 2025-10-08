import Header from "../components/Header";
import Hero from "../components/Hero";
import Footer from "../components/Footer";
import Filters from "../components/Filters";
import BeauticianGrid from "../components/BeauticianGrid";
import { useEffect, useState } from "react";
import { getBeauticians } from "../api/publicApi";

export default function HomePage(){
  const [items,setItems]=useState([]); 
  const [loading,setLoading]=useState(true);

  const load=async(filters={})=>{
    setLoading(true);
    try{
      const r=await getBeauticians(filters);
      setItems(r.data ?? r);
    }finally{ setLoading(false); }
  };

  useEffect(()=>{ load(); },[]);

  return (
    <div className="min-h-screen bg-white">
      <Header/>
      <Hero/>

      {/* Explore section */}
      <section className="section-pad">
        <div className="container-7xl">
          <div className="text-center">
            <h2 className="text-[28px] font-semibold tracking-tight text-neutral-900 md:text-[32px]">
              Explore Beauticians
            </h2>
            <p className="mx-auto mt-2 max-w-[720px] text-[13.5px] leading-[1.7] text-neutral-600">
              Discover top-rated professionals near you. Filter by category and services to book instantly.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-[260px,1fr]">
            <Filters onChange={load}/>
            {loading ? (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_,i)=>(
                  <div key={i} className="h-[260px] rounded-2xl border bg-white shadow-sm">
                    <div className="h-40 w-full rounded-t-2xl bg-neutral-100" />
                    <div className="space-y-2 p-4">
                      <div className="h-4 w-2/3 animate-pulse rounded bg-neutral-200" />
                      <div className="h-3 w-1/2 animate-pulse rounded bg-neutral-200" />
                      <div className="h-3 w-1/3 animate-pulse rounded bg-neutral-200" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <BeauticianGrid items={items}/>
            )}
          </div>
        </div>
      </section>

      <Footer/>
    </div>
  );
}
