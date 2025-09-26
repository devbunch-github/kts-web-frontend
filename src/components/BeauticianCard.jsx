export default function BeauticianCard({ item }) {
  // expected item shape: { id, name, location, rating, reviews, cover_url }
  const rating = Number(item?.rating ?? 0);
  const reviews = Number(item?.reviews ?? item?.reviews_count ?? 0);

  return (
    <article
      className="
        group relative overflow-hidden rounded-2xl
        border border-neutral-200 bg-white
        shadow-[0_6px_18px_rgba(0,0,0,0.06)]
        transition-shadow hover:shadow-[0_10px_26px_rgba(0,0,0,0.09)]
      "
      role="listitem"
    >
      {/* Media */}
      <div className="relative">
        <div className="mx-5 mt-5 overflow-hidden rounded-xl">
          {item?.cover_url ? (
            <img
              src={item.cover_url}
              alt={item.name}
              className="h-48 w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            />
          ) : (
            <div className="h-48 w-full bg-neutral-100" />
          )}
        </div>

        {/* Heart (save) */}
        <button
          aria-label="Save"
          className="
            absolute right-5 top-5
            grid h-8 w-8 place-items-center
            rounded-full bg-orange-400 text-white
            shadow ring-1 ring-orange-300/70
            transition hover:bg-orange-500
          "
        >
          ♥
        </button>
      </div>

      {/* Content */}
      <div className="px-5 pb-5 pt-3">
        <h3 className="text-[16px] font-semibold leading-snug text-neutral-900">
          {item?.name}
        </h3>

        {/* Location */}
        <div className="mt-1.5 flex items-center gap-1.5 text-[13px] text-neutral-500">
          <svg
            viewBox="0 0 20 20"
            className="h-[14px] w-[14px] text-neutral-400"
            aria-hidden="true"
          >
            <path
              d="M10 2.5a5.5 5.5 0 0 0-5.5 5.5c0 3.6 5.5 9.5 5.5 9.5S15.5 11.6 15.5 8A5.5 5.5 0 0 0 10 2.5Zm0 7.5a2 2 0 1 1 0-4 2 2 0 0 1 0 4Z"
              fill="currentColor"
            />
          </svg>
          <span className="truncate">{item?.location ?? "—"}</span>
        </div>

        {/* Rating */}
        <div className="mt-1.5 flex items-center gap-1 text-[13px]">
          <span className="text-amber-500">★</span>
          <span className="text-neutral-800 font-medium">{rating}</span>
          <span className="text-orange-500">({reviews})</span>
        </div>
      </div>
    </article>
  );
}
