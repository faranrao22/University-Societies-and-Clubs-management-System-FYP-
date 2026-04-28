import React from "react";

export default function AdminPillTabs({ value, onChange, tabs }) {
  return (
    <div
      className="mb-6 flex w-full flex-wrap gap-1 rounded-full border border-slate-200/90 bg-slate-100/95 p-1 sm:inline-flex sm:w-auto"
      role="tablist"
    >
      {tabs.map((t) => {
        const active = value === t.id;
        return (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(t.id)}
            className={
              active
                ? "rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-slate-200/80 transition"
                : "rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition hover:text-slate-900"
            }
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}
