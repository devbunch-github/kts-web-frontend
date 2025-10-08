import { useEffect, useMemo, useRef, useState } from "react";

const SLIDES = [
  { img: "/images/hero-1.png", title: "Hair cut, make-up or more…", subtitle: "Book your beauty service online" },
  { img: "/images/hero-2.png", title: "Find top beauticians near you", subtitle: "Real ratings, instant booking" },
  { img: "/images/hero-3.png", title: "Gift cards & special offers", subtitle: "Treat someone (or yourself)" },
];

const AUTOPLAY_MS = 5200;

export default function Hero() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const timer = useRef(null);

  useEffect(() => {
    if (paused) return;
    timer.current = setInterval(() => setIndex(i => (i + 1) % SLIDES.length), AUTOPLAY_MS);
    return () => clearInterval(timer.current);
  }, [paused]);

  const current = index;
  const prevIdx = useMemo(() => (index - 1 + SLIDES.length) % SLIDES.length, [index]);
  const nextIdx = useMemo(() => (index + 1) % SLIDES.length, [index]);

  return (
    <section
      className="relative h-[56vh] min-h-[420px] w-full overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel" aria-label="Hero"
    >
      {[prevIdx, current, nextIdx].map(i => (
        <img
          key={i}
          src={SLIDES[i].img}
          alt=""
          className={`absolute inset-0 h-full w-full object-cover transition-all duration-[900ms] ease-[cubic-bezier(.22,.61,.36,1)] ${
            i === current ? "opacity-100 scale-100" : "opacity-0 scale-105"
          }`}
        />
      ))}

      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,.35)_0%,rgba(0,0,0,.35)_40%,rgba(0,0,0,.25)_100%)]" />
      <div className="relative z-10 container-7xl flex h-full flex-col items-center justify-center px-4 text-center">
        <h2 className="text-white font-semibold text-[22px] leading-[1.15] sm:text-[28px] md:text-[36px] lg:text-[42px]">
          {SLIDES[current].title}
        </h2>
        <p className="mt-2 text-white/95 text-[15px] sm:text-[18px] md:text-[22px]">
          {SLIDES[current].subtitle}
        </p>
      </div>

      {/* dots */}
      <div className="absolute bottom-4 left-1/2 z-20 -translate-x-1/2">
        <div className="flex gap-2">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-2.5 w-2.5 rounded-full transition-all ${i === current ? "bg-white/90 scale-110" : "bg-white/45 hover:bg-white/70"}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
