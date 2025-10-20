export default function ConfirmDeleteModal({
  open,
  onClose,
  onConfirm,
  message = "Are you sure you want to proceed?",
  yesText = "Yes",
  noText = "No",
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden
      />
      <div className="relative w-[520px] max-w-[92vw] rounded-2xl bg-white p-6 shadow-xl">
        <p className="text-center text-[18px] leading-6 text-gray-800">
          {message}
        </p>

        <div className="mt-8 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={onClose}
            className="h-11 w-[140px] rounded-xl border border-gray-300 bg-white text-gray-700 transition hover:bg-gray-50"
          >
            {noText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="h-11 w-[140px] rounded-xl bg-rose-300 text-white transition hover:bg-rose-400"
          >
            {yesText}
          </button>
        </div>
      </div>
    </div>
  );
}
