import { useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleExclamation, faXmark, faCircleDot } from "@fortawesome/free-solid-svg-icons";

/**
 * Reusable modal for form validation and submission errors.
 * Centered, accessible, keyboard-friendly (Esc), and guides the user.
 */
export const ValidationErrorModal = ({
  isOpen,
  title = "Unable to Submit Specimen",
  message = "Please resolve the following issue before submitting:",
  errors = [],
  onClose,
  buttonLabel = "OK, I'll Fix This"
}) => {
  const closeButtonRef = useRef(null);

  // Normalize errors into an array of non-empty strings
  const errorList = Array.isArray(errors)
    ? errors.filter(Boolean)
    : errors ? [String(errors)] : [];

  // Focus the primary action button when the modal opens and handle Esc key
  useEffect(() => {
    if (!isOpen) return;

    // Small delay to allow element mount
    const timer = setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 50);

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose?.();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-modal-backdrop"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="validation-error-title"
      aria-describedby="validation-error-desc"
    >
      <div
        className="bg-white border border-[#E0D9CE] rounded-sm max-w-lg w-full p-6 sm:p-7 shadow-2xl relative animate-modal-dialog max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close icon top-right */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-[#6E7570] hover:text-[#1C241E] p-1.5 rounded-xs transition-colors"
          aria-label="Close error notice"
        >
          <FontAwesomeIcon icon={faXmark} className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-start gap-3.5 mb-4">
          <div className="w-10 h-10 rounded-sm bg-[#FDF2F2] text-[#8F2D14] flex items-center justify-center shrink-0 shadow-2xs">
            <FontAwesomeIcon icon={faCircleExclamation} className="w-5 h-5" />
          </div>
          <div className="space-y-1 pr-6">
            <h2
              id="validation-error-title"
              className="font-serif-heading text-lg sm:text-xl font-bold text-[#1C241E] leading-snug"
            >
              {title}
            </h2>
            {message && (
              <p id="validation-error-desc" className="text-xs sm:text-sm text-[#566158] leading-relaxed">
                {message}
              </p>
            )}
          </div>
        </div>

        {/* Error Items List */}
        {errorList.length > 0 && (
          <div className="my-2 bg-[#FAF8F5] border border-[#E0D9CE] rounded-sm p-4 overflow-y-auto max-h-60 space-y-2.5">
            {errorList.length === 1 ? (
              <div className="flex items-start gap-2.5 text-xs text-[#1C241E] font-medium leading-relaxed">
                <FontAwesomeIcon icon={faCircleDot} className="w-3 h-3 text-[#8F2D14] mt-0.5 shrink-0" />
                <span>{errorList[0]}</span>
              </div>
            ) : (
              <ul className="space-y-2">
                {errorList.map((err, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-[#1C241E] leading-relaxed">
                    <FontAwesomeIcon icon={faCircleDot} className="w-2.5 h-2.5 text-[#8F2D14] mt-1 shrink-0" />
                    <span>{err}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Guidance tip */}
        <div className="text-[11px] text-[#6E7570] pt-2 pb-1 italic">
          Tip: Clicking below will guide you directly to the section requiring attention.
        </div>

        {/* Footer Actions */}
        <div className="mt-4 pt-4 border-t border-[#EDE7DD] flex items-center justify-end gap-3">
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white bg-[#1F4529] hover:bg-[#15321D] rounded-sm transition-all duration-150 shadow-xs focus-visible:ring-2 focus-visible:ring-[#1F4529] focus-visible:ring-offset-2 active:scale-95"
          >
            {buttonLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
