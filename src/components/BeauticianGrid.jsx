import BeauticianCard from "./BeauticianCard";

export default function BeauticianGrid({ items = [] }) {
  if (!items.length) {
    return (
      <div className="rounded-2xl border bg-white p-10 text-center text-sm text-neutral-500">
        No results. Try other filters.
      </div>
    );
  }

  return (
    <div
      className="
        grid grid-cols-1 gap-6
        sm:grid-cols-2
        lg:grid-cols-3
      "
    >
      {items.map((b) => (
        <BeauticianCard key={b.id} item={b} />
      ))}
    </div>
  );
}
