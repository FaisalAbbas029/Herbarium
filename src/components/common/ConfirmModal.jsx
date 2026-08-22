import { AlertTriangle, X } from "lucide-react";
const ConfirmModal = ({
  isOpen,
  title,
  message,
  confirmLabel = "Confirm Action",
  cancelLabel = "Cancel",
  isDestructive = true,
  isLoading = false,
  onConfirm,
  onCancel
}) => {
  if (!isOpen) return null;
  return <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div
    className="bg-white border border-[#E0D9CE] rounded-sm max-w-md w-full p-6 shadow-xl relative animate-in fade-in zoom-in-95 duration-150"
    role="dialog"
    aria-modal="true"
    aria-labelledby="modal-title"
  >
        <button
    onClick={onCancel}
    disabled={isLoading}
    className="absolute top-4 right-4 text-[#6E7570] hover:text-[#1C241E] p-1"
  >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-4">
          <div
    className={`w-10 h-10 rounded-sm flex items-center justify-center shrink-0 ${isDestructive ? "bg-[#FDF2F2] text-[#8F2D14]" : "bg-[#EBF3ED] text-[#1F4529]"}`}
  >
            <AlertTriangle className="w-5 h-5" />
          </div>

          <div className="space-y-2">
            <h3 id="modal-title" className="font-serif-heading text-lg font-bold text-[#1C241E]">
              {title}
            </h3>
            <p className="text-sm text-[#566158] leading-relaxed">{message}</p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3 border-t border-[#EDE7DD] pt-4">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-[#4A554D] hover:bg-[#F3EFEA] border border-[#C7BEB1] rounded-sm transition-colors whitespace-nowrap shrink-0 disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (!isLoading && onConfirm) {
                onConfirm();
              }
            }}
            disabled={isLoading}
            className={`px-4 py-2 text-sm font-medium text-white rounded-sm transition-colors flex items-center gap-2 whitespace-nowrap shrink-0 ${
              isDestructive ? "bg-[#8F2D14] hover:bg-[#73230F]" : "bg-[#1F4529] hover:bg-[#15321D]"
            } disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed`}
          >
            {isLoading && (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin shrink-0" />
            )}
            <span>{confirmLabel}</span>
          </button>
        </div>
      </div>
    </div>;
};
export {
  ConfirmModal
};
