import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { MoreVertical } from "lucide-react";

export default function AdminRowMenu({ items, align = "right" }) {
  const [open, setOpen] = useState(false);
  const root = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e) => {
      if (!root.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const panelPos = align === "right" ? "right-0" : "left-0";

  return (
    <div className="relative flex justify-end" ref={root}>
      <button
        type="button"
        className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Row actions"
        onClick={() => setOpen((o) => !o)}
      >
        <MoreVertical size={18} strokeWidth={2} />
      </button>
      {open ? (
        <div
          className={`absolute top-full z-40 mt-1 min-w-[11rem] rounded-xl border border-slate-200 bg-white py-1 shadow-xl ring-1 ring-slate-900/5 ${panelPos}`}
          role="menu"
        >
          {items.map((it, i) => {
            const base =
              "flex w-full items-center px-3 py-2 text-left text-sm transition hover:bg-slate-50";
            const danger = it.danger ? "text-red-700 hover:bg-red-50" : "text-slate-700";
            if (it.to) {
              return (
                <Link
                  key={i}
                  to={it.to}
                  role="menuitem"
                  className={`${base} ${danger}`}
                  onClick={() => setOpen(false)}
                >
                  {it.label}
                </Link>
              );
            }
            return (
              <button
                key={i}
                type="button"
                role="menuitem"
                className={`${base} ${danger}`}
                onClick={() => {
                  it.onClick?.();
                  setOpen(false);
                }}
              >
                {it.label}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
