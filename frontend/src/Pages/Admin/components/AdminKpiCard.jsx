import React from "react";

export default function AdminKpiCard({ icon: Icon, label, value, hint, badge, iconClassName, children }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-5 shadow-[0_4px_14px_rgba(15,23,42,0.06)] sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div
          className={
            iconClassName ||
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-indigo-100 bg-indigo-50 text-indigo-700"
          }
        >
          <Icon size={20} strokeWidth={1.75} />
        </div>
        {badge != null && badge !== false ? (
          <div className="shrink-0">{badge}</div>
        ) : null}
      </div>
      <p className="mt-5 text-2xl font-bold tabular-nums tracking-tight text-slate-900 sm:text-3xl">{value ?? "—"}</p>
      <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
      {children}
    </div>
  );
}
