import React, { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { CalendarDays, ChevronRight, MapPin } from "lucide-react";
import toast from "react-hot-toast";
import AdminPageHeader from "../components/AdminPageHeader";
import { adminUi as a } from "../components/adminUi";
import { fetchAdminEvents } from "../api/adminApi";
import { adminKeys } from "../api/adminQueryKeys";

function formatRange(start, end) {
  try {
    const s = new Date(start);
    const e = new Date(end);
    return `${s.toLocaleString()} → ${e.toLocaleString()}`;
  } catch {
    return "—";
  }
}

const statusStyle = {
  scheduled: "text-emerald-800 bg-emerald-50 ring-1 ring-emerald-100",
  published: "text-emerald-900 bg-emerald-100 ring-1 ring-emerald-200",
  postponed: "text-amber-900 bg-amber-100 ring-1 ring-amber-200",
  cancelled: "text-red-900 bg-red-50 ring-1 ring-red-100",
  completed: "text-slate-700 bg-slate-100 ring-1 ring-slate-200",
};

export default function AdminEventsList() {
  const navigate = useNavigate();
  const { data: events = [], isPending, isError } = useQuery({
    queryKey: adminKeys.events(),
    queryFn: fetchAdminEvents,
    staleTime: 60 * 1000,
  });

  useEffect(() => {
    if (isError) toast.error("Could not load events");
  }, [isError]);

  return (
    <div className={a.pageNarrow}>
      <AdminPageHeader
        variant="hero"
        title="Events"
        description="All events in the system. Open one for full details and a downloadable report."
      />

      <div className={`${a.card} ${a.list}`}>
        {isPending ? (
          <div className={a.emptyState}>Loading events…</div>
        ) : events.length === 0 ? (
          <div className={a.emptyState}>No events found.</div>
        ) : (
          events.map((ev) => (
            <button
              key={ev._id}
              type="button"
              onClick={() => navigate(`/admin/events/${ev._id}`)}
              className={a.listRowBtn}
            >
              <div className={a.iconTile}>
                <CalendarDays size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-slate-900">{ev.title}</p>
                <p className="mt-1 flex flex-wrap items-center gap-1 text-xs text-slate-500">
                  <span>{ev.organizer?.name || "Society"}</span>
                  {ev.organizer?.shortName && (
                    <span className="text-slate-400">({ev.organizer.shortName})</span>
                  )}
                  <span className="text-slate-300">·</span>
                  <span>{ev.category || "—"}</span>
                </p>
                <p className="mt-1 flex items-center gap-1 text-xs text-slate-600">
                  <MapPin size={12} className="shrink-0" />
                  <span className="truncate">{ev.venue || "—"}</span>
                </p>
                <p className="mt-1 text-[11px] text-slate-500">{formatRange(ev.startDateTime, ev.endDateTime)}</p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-2">
                <span
                  className={`rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase ${
                    statusStyle[ev.status] || "bg-slate-100 text-slate-700 ring-1 ring-slate-200"
                  }`}
                >
                  {ev.status || "—"}
                </span>
                <ChevronRight className="text-slate-400" size={18} />
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
