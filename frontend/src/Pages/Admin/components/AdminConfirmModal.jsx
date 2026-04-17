import React, { useEffect } from "react";
import { Loader2, X } from "lucide-react";
import { adminUi as a } from "./adminUi";

export default function AdminConfirmModal({
  open,
  onClose,
  title,
  message,
  confirmLabel = "Confirm",
  onConfirm,
  danger = true,
  /** When true, confirm shows a spinner label and interactions are blocked. */
  isPending = false,
  pendingLabel,
  /** Disable only the confirm button (e.g. validation). */
  confirmDisabled = false,
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape" && !isPending) onClose?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, isPending, onClose]);

  if (!open) return null;

  const blockClose = isPending;

  return (
    <div
      className={a.modalBackdrop}
      role="presentation"
      onClick={() => {
        if (!blockClose) onClose?.();
      }}
    >
      <div
        className={`${a.modalPanel} max-w-md`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-confirm-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={() => {
            if (!blockClose) onClose?.();
          }}
          disabled={blockClose}
          className="absolute right-3 top-3 rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:pointer-events-none disabled:opacity-40"
          aria-label="Close"
        >
          <X size={18} />
        </button>
        <h3 id="admin-confirm-title" className="pr-8 text-base font-semibold text-slate-900">
          {title}
        </h3>
        {message ? <p className="mt-2 text-sm leading-relaxed text-slate-600">{message}</p> : null}
        <div className="mt-6 flex justify-end gap-2 border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={() => onClose?.()}
            disabled={blockClose}
            className={a.btnSecondary}
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={confirmDisabled || isPending}
            onClick={() => onConfirm?.()}
            className={danger ? a.btnDanger : a.btnPrimary}
          >
            {isPending ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden />
                {pendingLabel || `${confirmLabel}…`}
              </span>
            ) : (
              confirmLabel
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
