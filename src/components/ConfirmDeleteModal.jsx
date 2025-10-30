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
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      <div className="relative w-[420px] max-w-[90vw] rounded-2xl bg-white p-8 shadow-xl text-center">
        <p className="text-[16px] text-gray-800 leading-6 font-medium">
          {message}
        </p>

        <div className="mt-8 flex items-center justify-center gap-4">
          <button
            onClick={onClose}
            className="h-11 w-[140px] rounded-xl border border-gray-300 bg-white text-[14px] font-medium text-gray-700 transition hover:bg-gray-50"
          >
            {noText}
          </button>
          <button
            onClick={onConfirm}
            className="h-11 w-[140px] rounded-xl bg-[#D6A5A5] text-[14px] font-medium text-white transition hover:bg-[#c38e8e]"
          >
            {yesText}
          </button>
        </div>
      </div>
    </div>
  );
}
