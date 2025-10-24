import LikeButton from "./LikeButton";

export default function BeauticianCard({ item }) {
  const rating = Number(item?.rating ?? 0);
  const reviews = Number(item?.reviews ?? item?.reviews_count ?? 0);

  return (
    <article
      className="group relative overflow-hidden rounded-[20px] border border-[#f0f0f0] bg-white 
                 shadow-[0_6px_20px_rgba(0,0,0,0.06)] 
                 transition-all duration-300 hover:shadow-[0_10px_28px_rgba(0,0,0,0.1)]"
      role="listitem"
    >
      {/* ─── Media ───────────────────────────────────── */}
      <div className="relative h-[220px] w-full overflow-hidden">
        <img
          src={item?.cover_url || item?.image || "/images/hero-3.png"}
          alt={item?.name || "Beautician"}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />

        {/* ─── Like / Heart Button ─────────────────────── */}
        <LikeButton />
      </div>

      {/* ─── Content ─────────────────────────────────── */}
      <div className="px-6 pt-4 pb-6">
        <h3 className="text-[17px] font-semibold text-[#1b1b1b] leading-snug truncate">
          {item?.name ?? "Salon Name"}
        </h3>

        <div className="mt-1.5 flex items-center gap-1.5 text-[14px] text-[#7a7a7a]">
          <svg
            viewBox="0 0 20 20"
            className="h-[15px] w-[15px] text-[#b98989]"
            aria-hidden="true"
          >
            <path
              d="M10 2.5a5.5 5.5 0 0 0-5.5 5.5c0 3.6 5.5 9.5 5.5 9.5s5.5-5.9 5.5-9.5A5.5 5.5 0 0 0 10 2.5Zm0 7.5a2 2 0 1 1 0-4 2 2 0 0 1 0 4Z"
              fill="currentColor"
            />
          </svg>
          <span className="truncate">{item?.address ?? "—"}</span>
        </div>

        <div className="mt-2 flex items-center gap-1 text-[14px]">
          <span className="text-[#ffc107]">★</span>
          <span className="font-medium text-[#1b1b1b]">{rating}</span>
          <span className="text-[#c98383]">({reviews})</span>
        </div>
      </div>
    </article>
  );
}
