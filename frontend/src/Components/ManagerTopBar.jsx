import React, { useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu } from "lucide-react";
import NotificationBell from "./NotificationBell";

function titleFromPath(pathname) {
  if (pathname.includes("/reviewCandidate/")) return "Review candidate";
  if (pathname.includes("/SpecificSocietymembers/")) return "Society members";
  if (pathname.includes("/societyDetails/")) return "Society details";
  if (pathname.includes("/details/")) return "Event details";
  if (pathname.includes("/society-posts")) return "Society posts";
  if (pathname.includes("/societyform")) {
    return pathname.includes("/edit") ? "Edit society" : "New society";
  }
  if (pathname.includes("/eventForm")) {
    return pathname.includes("/edit") ? "Edit event" : "New event";
  }
  const parts = pathname.split("/").filter(Boolean);
  const seg = parts[parts.length - 1] || "";
  const map = {
    dashboard: "Dashboard",
    events: "Events",
    election: "Election",
    "all-elections": "All elections",
    "my-drafts": "Schedule applications",
    applications: "Applications",
    "schedule-voting": "Schedule voting",
    results: "Election results",
    members: "Members",
    volunteers: "Volunteers",
    society: "Societies",
    "society-status": "Society status",
    requests: "Join requests",
  };
  return map[seg] || "Manager portal";
}

export default function ManagerTopBar({ user, onMenuToggle }) {
  const { pathname } = useLocation();
  const title = useMemo(() => titleFromPath(pathname), [pathname]);

  const initial = (user?.fullname || user?.email || "M").charAt(0).toUpperCase();

  return (
    <header
      className="fixed top-0 left-0 right-0 z-30 flex h-14 items-center justify-between gap-4 border-b border-gray-200 bg-white px-4 sm:px-6 lg:left-64"
    >
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <button
          type="button"
          onClick={onMenuToggle}
          className="shrink-0 rounded-lg p-2 text-gray-600 transition hover:bg-gray-100 lg:hidden"
          aria-label="Open menu"
        >
          <Menu size={22} />
        </button>
        <h1 className="min-w-0 truncate text-base font-semibold text-gray-900">
          {title}
        </h1>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <NotificationBell buttonClassName="hover:bg-gray-100" />
        <Link
          to="/profile"
          className="flex shrink-0 items-center gap-2 rounded-lg py-1 pl-1 pr-2 transition hover:bg-gray-50"
        >
          <span className="hidden max-w-[140px] truncate text-sm font-medium text-gray-700 sm:block">
            {user?.fullname || "Manager"}
          </span>
          <div
            className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold text-white"
            style={{ backgroundColor: "#3699FF" }}
          >
            {initial}
          </div>
        </Link>
      </div>
    </header>
  );
}
