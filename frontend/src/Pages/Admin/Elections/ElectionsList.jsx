import React, { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Vote } from "lucide-react";
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
        title="Elections"
        description="All elections across societies."
      />

      <div className={a.tableCard}>
        {isPending ? (
          <div className={a.emptyState}>Loading elections...</div>
        ) : elections.length === 0 ? (
          <div className={a.emptyState}>No elections found.</div>
        ) : (
          <div className={a.tableScroll}>
            <table className={a.table}>
              <thead className={a.thead}>
                <tr>
                  <th className={`${a.th} pl-5`}>Election</th>
                  <th className={a.th}>Society</th>
                  <th className={a.th}>Deadline</th>
                  <th className={a.th}>Status</th>
                </tr>
              </thead>
              <tbody>
                {elections.map((el, idx) => (
                  <tr
                    key={el._id}
                    className={`${a.tbodyRowStriped(idx)} cursor-pointer`}
                    onClick={() => navigate(`/admin/elections/${el._id}`)}
                  >
                    <td className={`${a.cellStrong} pl-5`}>
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-500">
                          <Vote size={16} />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-slate-900">{el.title}</p>
                          <p className="text-xs text-slate-500">
                            {(el.candidates?.length ?? 0)} candidates · {(el.votes?.length ?? 0)} votes
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className={a.cell}>{el.societyId?.name || "Society"}</td>
                    <td className={a.cell}>{fmt(el.applyDeadline)}</td>
                    <td className={a.cell}>
                      <span
                        className={`rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase ${
                          statusColors[el.status] || "bg-slate-100 text-slate-700 ring-1 ring-slate-200"
                        }`}
                      >
                        {(el.status || "").replace(/_/g, " ")}
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
