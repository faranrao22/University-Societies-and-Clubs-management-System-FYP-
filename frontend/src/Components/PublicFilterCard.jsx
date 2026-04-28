import React from "react";
import PublicSearchInput from "./PublicSearchInput";

/** Shared with public list pages (societies, events, news) */
export const PUBLIC_FILTER_COLORS = {
  dark: "#1e3a8a",
  gold: "#38bdf8",
  cream: "#e2e8f0",
  text: "#111827",
  muted: "#4B5563",
  border: "rgba(30, 64, 175, 0.16)",
};

/**
 * Unified filter header: centered title + subtitle, compact search, optional slot below (chips, date, etc.).
 */
export default function PublicFilterCard({
  title,
  subtitle,
  search = null,
  /** Optional node (e.g. Clear filters) aligned top-right above title */
  headerAction = null,
  children,
}) {
  const C = PUBLIC_FILTER_COLORS;
  return (
    <div className="relative mb-6 rounded-xl border bg-white px-4 py-3 shadow-sm sm:px-5 sm:py-4" style={{ borderColor: C.border }}>
      {headerAction ? <div className="mb-1 flex justify-end sm:absolute sm:right-5 sm:top-3 sm:mb-0">{headerAction}</div> : null}
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-lg font-extrabold tracking-tight sm:text-xl" style={{ color: C.text }}>
          {title}
        </h2>
        {subtitle ? (
          <p className="mt-1 text-xs sm:text-sm" style={{ color: C.muted }}>
            {subtitle}
          </p>
        ) : null}
      </div>

      {search ? (
        <div className="mx-auto mt-3 w-full max-w-md">
          <PublicSearchInput
            id={search.id}
            className="w-full"
            compact
            value={search.value}
            onChange={search.onChange}
            placeholder={search.placeholder}
            onKeyDown={search.onKeyDown}
          />
        </div>
      ) : null}

      {children}
    </div>
  );
}

/** Section label + centered chip row (matches societies “Browse by department” block). */
export function PublicFilterChipGroup({ label, children }) {
  const C = PUBLIC_FILTER_COLORS;
  if (!children) return null;
  return (
    <div className="mt-4 border-t pt-3" style={{ borderColor: C.border }}>
      <p className="mb-2 text-center text-[10px] font-bold uppercase tracking-wider" style={{ color: C.muted }}>
        {label}
      </p>
      <div className="flex flex-wrap justify-center gap-1.5">{children}</div>
    </div>
  );
}

export function PublicFilterChip({ active, onClick, children, className = "" }) {
  const C = PUBLIC_FILTER_COLORS;
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-md px-3 py-1.5 text-left text-xs font-semibold transition ${className}`}
      style={{
        backgroundColor: active ? C.dark : "#fff",
        color: active ? "#fff" : C.text,
        border: `1px solid ${active ? C.dark : C.border}`,
      }}
    >
      {children}
    </button>
  );
}
