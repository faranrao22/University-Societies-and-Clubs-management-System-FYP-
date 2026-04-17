import React, { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Vote, ChevronRight, Building2 } from "lucide-react";
import toast from "react-hot-toast";
import AdminPageHeader from "../components/AdminPageHeader";
import { adminUi as a } from "../components/adminUi";
import { fetchAdminElections } from "../api/adminApi";
import { adminKeys } from "../api/adminQueryKeys";

function fmt(d) {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "—";
  }
}

const statusColors = {
  DRAFT: "bg-slate-100 text-slate-800 ring-1 ring-slate-200",
  APPLICATIONS_OPEN: "bg-sky-100 text-sky-900 ring-1 ring-sky-200",
  APPLICATIONS_CLOSED: "bg-amber-100 text-amber-900 ring-1 ring-amber-200",
  CANDIDATES_FINALIZED: "bg-violet-100 text-violet-900 ring-1 ring-violet-200",
  VOTING_SCHEDULED: "bg-indigo-100 text-indigo-900 ring-1 ring-indigo-200",
  VOTING_LIVE: "bg-emerald-100 text-emerald-900 ring-1 ring-emerald-200",
  COMPLETED: "bg-emerald-50 text-emerald-900 ring-1 ring-emerald-200",
};

export default function AdminElectionsList() {
  const navigate = useNavigate();
  const { data: elections = [], isPending, isError } = useQuery({
    queryKey: adminKeys.elections(),
    queryFn: fetchAdminElections,
    staleTime: 60 * 1000,
  });

  useEffect(() => {
    if (isError) toast.error("Could not load elections");
  }, [isError]);

  return (
    <div className={a.pageNarrow}>
      <AdminPageHeader
        variant="hero"
        title="Elections"
        description="All elections across societies. Open one for full details, PDF export, or deletion."
      />

      <div className={`${a.card} ${a.list}`}>
        {isPending ? (
          <div className={a.emptyState}>Loading elections…</div>
        ) : elections.length === 0 ? (
          <div className={a.emptyState}>No elections found.</div>
        ) : (
          elections.map((el) => (
            <button
              key={el._id}
              type="button"
              onClick={() => navigate(`/admin/elections/${el._id}`)}
              className={a.listRowBtn}
            >
              <div className={a.iconTile}>
                <Vote size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-slate-900">{el.title}</p>
                <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                  <Building2 size={12} className="shrink-0" />
                  <span>{el.societyId?.name || "Society"}</span>
                  {el.societyId?.shortName && (
                    <span className="text-slate-400">({el.societyId.shortName})</span>
                  )}
                </p>
                <p className="mt-1 text-[11px] text-slate-500">
                  Apply by {fmt(el.applyDeadline)} · Vote {fmt(el.startDate)} – {fmt(el.endDate)}
                </p>
                <p className="text-[11px] text-slate-500">
                  {(el.candidates?.length ?? 0)} candidates · {(el.votes?.length ?? 0)} votes
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-2">
                <span
                  className={`rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase ${
                    statusColors[el.status] || "bg-slate-100 text-slate-700 ring-1 ring-slate-200"
                  }`}
                >
                  {(el.status || "").replace(/_/g, " ")}
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
