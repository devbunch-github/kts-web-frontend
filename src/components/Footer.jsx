export default function Footer(){
  return (
    <footer className="mt-16 border-t">
      {/* Pink promo band */}
      <section className="bg-[linear-gradient(180deg,var(--rose-1)_0%,var(--rose-2)_100%)]">
        <div className="container-7xl relative grid grid-cols-1 items-center gap-10 px-4 py-16 md:grid-cols-[1.05fr_0.95fr] md:gap-14">
          <div className="max-w-[560px]">
            <h3 className="text-[38px] md:text-[44px] lg:text-[48px] leading-[1.05] tracking-tight font-extrabold text-neutral-900">
              Download<br/>The Appt.live app Now
            </h3>
            <p className="mt-4 max-w-[520px] text-[15px] leading-[1.6] text-neutral-700">
              Book unforgettable grooming experiences with the Appt.live Mobile App
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <a href="#" aria-label="App Store">
                <img src="/images/button.png" alt="App Store" className="h-[40px] w-auto" />
              </a>
              <a href="#" aria-label="Play Store">
                <img src="/images/button(1).png" alt="Play Store" className="h-[40px] w-auto" />
              </a>
            </div>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 -z-10 mx-auto h-[70%] max-w-[520px] rounded-[40px] bg-white/40 blur-[60px]" />
            <img
              src="/images/app-mockup.png"
              alt="Appt.live App"
              className="relative max-h-[420px] w-auto select-none drop-shadow-[0_18px_22px_rgba(0,0,0,0.18)] md:translate-x-2"
            />
          </div>
        </div>
      </section>

      <div className="container-7xl px-4 py-6 text-center text-[12px] text-neutral-500">
        © 2025 All Rights Reserved by <span className="text-rose-400">Appt.live</span>
      </div>
    </footer>
  );
}
