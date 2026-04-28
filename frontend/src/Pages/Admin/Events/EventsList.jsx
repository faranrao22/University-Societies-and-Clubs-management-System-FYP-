import React, { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { CalendarDays } from "lucide-react";
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
        title="Events"
        description="All events in the system."
      />

      <div className={a.tableCard}>
        {isPending ? (
          <div className={a.emptyState}>Loading events...</div>
        ) : events.length === 0 ? (
          <div className={a.emptyState}>No events found.</div>
        ) : (
          <div className={a.tableScroll}>
            <table className={a.table}>
              <thead className={a.thead}>
                <tr>
                  <th className={`${a.th} pl-5`}>Event</th>
                  <th className={a.th}>Society</th>
                  <th className={a.th}>Venue</th>
                  <th className={a.th}>Status</th>
                </tr>
              </thead>
              <tbody>
                {events.map((ev, idx) => (
                  <tr
                    key={ev._id}
                    className={`${a.tbodyRowStriped(idx)} cursor-pointer`}
                    onClick={() => navigate(`/admin/events/${ev._id}`)}
                  >
                    <td className={`${a.cellStrong} pl-5`}>
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-500">
                          <CalendarDays size={16} />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-slate-900">{ev.title}</p>
                          <p className="mt-0.5 text-xs text-slate-500">{formatRange(ev.startDateTime, ev.endDateTime)}</p>
                        </div>
                      </div>
                    </td>
                    <td className={a.cell}>{ev.organizer?.name || "Society"}</td>
                    <td className={a.cell}>{ev.venue || "-"}</td>
                    <td className={a.cell}>
                      <span
                        className={`rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase ${
                          statusStyle[ev.status] || "bg-slate-100 text-slate-700 ring-1 ring-slate-200"
                        }`}
                      >
                        {ev.status || "-"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
