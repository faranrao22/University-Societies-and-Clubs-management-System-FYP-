import React, { useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ExternalLink, Menu, Search } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import NotificationBell from "./NotificationBell";

const TITLE_MAP = [
  { match: /\/admin\/?$/, title: "Dashboard" },
  { match: /\/admin\/dashboard/, title: "Dashboard" },
  { match: /\/admin\/managers/, title: "Managers" },
  { match: /\/admin\/users\/[^/]+/, title: "User profile" },
  { match: /\/admin\/users/, title: "All users" },
  { match: /\/admin\/societies\/[^/]+$/, title: "Society details" },
  { match: /\/admin\/societies/, title: "Societies" },
  { match: /\/admin\/events\/[^/]+$/, title: "Event details" },
  { match: /\/admin\/events/, title: "Events" },
  { match: /\/admin\/elections\/[^/]+$/, title: "Election details" },
  { match: /\/admin\/elections/, title: "Elections" },
  { match: /\/admin\/societyRequests/, title: "Society requests" },
  { match: /\/admin\/society-posts/, title: "Society posts" },
  { match: /\/admin\/memberForm/, title: "Manager account" },
  { match: /\/admin\/form/, title: "Form" },
];

function pageTitle(pathname) {
  for (const { match, title } of TITLE_MAP) {
    if (match.test(pathname)) return title;
  }
  return "Admin";
}

function initials(name) {
  if (!name || typeof name !== "string") return "A";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function roleLabel(role) {
  if (role === "admin") return "Administrator";
  if (role === "manager") return "Manager";
  return "User";
}

export default function AdminTopbar({ onOpenNav }) {
  const location = useLocation();
  const { user } = useAuth();
  const [search, setSearch] = useState("");

  const title = useMemo(() => pageTitle(location.pathname), [location.pathname]);

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/90 bg-white/95 shadow-[0_1px_0_rgba(15,23,42,0.04)] backdrop-blur-md">
      <div className="flex h-14 items-center gap-3 px-3 sm:gap-4 sm:px-5 lg:px-6">
        <button
          type="button"
          onClick={() => onOpenNav?.()}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 lg:hidden"
          aria-label="Open navigation menu"
        >
          <Menu size={18} strokeWidth={1.75} />
        </button>

        <div className="hidden min-w-0 shrink-0 lg:block lg:w-44">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">Current</p>
          <p className="truncate text-sm font-semibold text-slate-900">{title}</p>
        </div>

        <div className="flex min-w-0 flex-1 justify-center px-1 sm:px-3">
          <label className="relative w-full max-w-xl">
            <span className="sr-only">Search</span>
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              strokeWidth={2}
            />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search societies, users, events…"
              className="w-full rounded-full border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-indigo-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </label>
        </div>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <Link
            to="/"
            className="hidden items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50/60 hover:text-indigo-800 md:inline-flex"
          >
            <ExternalLink size={13} className="text-slate-400" />
            Site
          </Link>

          <NotificationBell buttonClassName="rounded-full border border-slate-200 bg-white hover:border-indigo-200 hover:bg-indigo-50/50" />

          <div className="flex items-center gap-2.5 rounded-full border border-slate-200 bg-slate-50/90 py-1 pl-1 pr-2 sm:pr-3">
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 text-[10px] font-bold text-white shadow-sm ring-2 ring-white"
              aria-hidden
            >
              {initials(user?.fullname)}
            </div>
            <div className="hidden min-w-0 text-right sm:block">
              <p className="truncate text-sm font-bold uppercase tracking-wide text-slate-900">
                {user?.role === "admin" ? "Super admin" : roleLabel(user?.role)}
              </p>
              <p className="truncate text-[11px] font-medium text-slate-500">{user?.fullname || "—"}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-100 px-3 py-2 lg:hidden">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Current page</p>
        <p className="truncate text-sm font-semibold text-slate-900">{title}</p>
      </div>
    </header>
  );
}
