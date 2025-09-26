export default function RatingStars({ value = 0 }) {
  const full = Math.floor(value);
  const half = value - full >= 0.5;
  return (
    <div className="flex items-center gap-1 text-xs text-amber-500">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={i < full ? "opacity-100" : i === full && half ? "opacity-80" : "opacity-25"}>
          ★
        </span>
      ))}
      <span className="ml-1 text-[11.5px] text-neutral-600">{value?.toFixed ? value.toFixed(1) : value}</span>
    </div>
  );
}
