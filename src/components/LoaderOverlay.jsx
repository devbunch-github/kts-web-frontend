export default function LoaderOverlay({ message = "Loading your to-dos..." }) {
  return (
    <div className="flex items-center justify-center py-10">
      <div className="flex items-center gap-3 text-gray-600">
        <span className="animate-spin inline-block w-4 h-4 border-2 border-rose-300 border-t-transparent rounded-full" />
        <span className="text-sm">{message}</span>
      </div>
    </div>
  );
}
