import { useEffect, useMemo, useRef, useState } from "react";

const SLIDES=[
  { img:"/images/hero-1.png", title:"Hair cut, make-up or more…", subtitle:"Book your beauty service online" },
  { img:"/images/hero-2.png", title:"Find top beauticians near you", subtitle:"Real ratings, instant booking" },
  { img:"/images/hero-3.png", title:"Gift cards & special offers", subtitle:"Treat someone (or yourself)" },
];

const AUTOPLAY_MS=5200;

export default function Hero(){
  const [index,setIndex]=useState(0);
  const [paused,setPaused]=useState(false);
  const timer=useRef(null); const touchStartX=useRef(null); const raf=useRef(null);
  const containerRef=useRef(null); const parallaxRef=useRef(0);

  useEffect(()=>{ if(paused) return;
    timer.current=setInterval(()=>setIndex(i=>(i+1)%SLIDES.length),AUTOPLAY_MS);
    return()=>clearInterval(timer.current);
  },[paused]);

  useEffect(()=>{ const onKey=e=>{ if(e.key==="ArrowRight") next(); if(e.key==="ArrowLeft") prev(); };
    window.addEventListener("keydown",onKey); return()=>window.removeEventListener("keydown",onKey);
  },[]);
  useEffect(()=>{ const onScroll=()=>{
    cancelAnimationFrame(raf.current);
    raf.current=requestAnimationFrame(()=>{
      if(!containerRef.current) return;
      const rect=containerRef.current.getBoundingClientRect();
      const ratio=Math.min(Math.max((innerHeight-rect.top)/(innerHeight+rect.height),0),1);
      parallaxRef.current=(ratio-0.5)*16; setIndex(i=>i);
    });
  };
  window.addEventListener("scroll",onScroll,{passive:true}); return()=>window.removeEventListener("scroll",onScroll);
  },[]);
  const next=()=>setIndex(i=>(i+1)%SLIDES.length);
  const prev=()=>setIndex(i=>(i-1+SLIDES.length)%SLIDES.length);
  const goTo=i=>setIndex(i);

  const current=index;
  const prevIdx=useMemo(()=> (index-1+SLIDES.length)%SLIDES.length, [index]);
  const nextIdx=useMemo(()=> (index+1)%SLIDES.length, [index]);

  const onTouchStart=e=> (touchStartX.current=e.touches[0].clientX);
  const onTouchEnd=e=>{ const endX=e.changedTouches[0].clientX; const d=endX-(touchStartX.current??endX);
    if(Math.abs(d)>50) (d<0?next():prev()); touchStartX.current=null; };

  return (
    <section
      ref={containerRef}
      className="relative w-full overflow-hidden bg-black h-[300px] sm:h-[360px] md:h-[460px] lg:h-[540px]"
      onMouseEnter={()=>setPaused(true)} onMouseLeave={()=>setPaused(false)}
      onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}
      aria-roledescription="carousel" aria-label="Hero"
    >
      {[prevIdx,current,nextIdx].map(i=>{
        const active=i===current;
        return (
          <picture key={i} className="absolute inset-0 block will-change-transform"
            style={{transform:`translateY(${parallaxRef.current}px)`}}>
            <img src={SLIDES[i].img} alt="" loading={active?"eager":"lazy"}
              className={`absolute inset-0 h-full w-full object-cover ${active?"opacity-100 scale-100 animate-heroZoomIn":"opacity-0 scale-105 transition-all duration-[900ms] ease-[cubic-bezier(.22,.61,.36,1)]"}`}
              style={{transitionProperty:"opacity, transform"}}/>
          </picture>
        );
      })}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,.35)_0%,rgba(0,0,0,.35)_40%,rgba(0,0,0,.25)_100%)]"/>
      <div className="relative z-10 container-7xl flex h-full flex-col items-center justify-center px-4 text-center">
        <h2 className="text-white font-semibold text-[22px] leading-tight sm:text-[26px] md:text-[34px] lg:text-[40px]">{SLIDES[current].title}</h2>
        <p className="mt-2 text-white/95 text-[15px] sm:text-[18px] md:text-[22px]">{SLIDES[current].subtitle}</p>
      </div>
      {/* <NavArrow side="left" onClick={prev}/>
      <NavArrow side="right" onClick={next}/> */}
      <div className="absolute bottom-4 left-1/2 z-20 -translate-x-1/2">
        <div className="flex gap-2">
          {SLIDES.map((_,i)=>(
            <button key={i} onClick={()=>goTo(i)} aria-label={`Go to slide ${i+1}`}
                    className={`h-2.5 w-2.5 rounded-full transition-transform ${i===current?"bg-white/90 scale-110":"bg-white/45 hover:bg-white/70"}`}/>
          ))}
        </div>
      </div>
    </section>
  );
}

function NavArrow({side="left",onClick}){
  const isLeft=side==="left";
  return (
    <button onClick={onClick} aria-label={isLeft?"Previous":"Next"}
      className={`hidden sm:flex absolute top-1/2 -translate-y-1/2 ${isLeft?"left-4 md:left-5":"right-4 md:right-5"} 
      h-11 w-11 md:h-12 md:w-12 items-center justify-center rounded-full bg-white/95 shadow-lg ring-1 ring-black/5
      transition-transform hover:-translate-y-[2px] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70`}>
      <svg viewBox="0 0 24 24" className={`h-6 w-6 text-neutral-900 ${isLeft?"":"-scale-x-100"}`} aria-hidden="true">
        <path d="M8 12h8M8 12l4-4M8 12l4 4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </button>
  );
}
