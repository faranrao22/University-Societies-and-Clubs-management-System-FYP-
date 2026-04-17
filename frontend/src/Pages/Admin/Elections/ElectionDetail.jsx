import React, { useEffect, useState } from "react";
import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Download,
  Trash2,
  Vote,
  Building2,
  Users,
  ListChecks,
  Trophy,
} from "lucide-react";
import API_BASE_URL from "../../../config/api.config";
import toast from "react-hot-toast";
import { adminUi as a } from "../components/adminUi";
import AdminDeleteModal from "../components/AdminDeleteModal";
import { fetchAdminElection } from "../api/adminApi";
import { adminKeys } from "../api/adminQueryKeys";

function fmt(d) {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleString();
  } catch {
    return "—";
  }
}

export default function AdminElectionDetail() {
  const { electionId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const {
    data: election,
    isPending: loading,
    isError,
  } = useQuery({
    queryKey: adminKeys.election(electionId),
    queryFn: () => fetchAdminElection(electionId),
    enabled: Boolean(electionId),
    staleTime: 60 * 1000,
  });

  useEffect(() => {
    if (isError) {
      toast.error("Election not found");
      navigate("/admin/elections");
    }
  }, [isError, navigate]);

  const deleteMut = useMutation({
    mutationFn: () =>
      axios.delete(`${API_BASE_URL}/admin/elections/${electionId}`, {
        withCredentials: true,
      }),
    onSuccess: () => {
      toast.success("Election deleted");
      setDeleteOpen(false);
      queryClient.invalidateQueries({ queryKey: adminKeys.elections() });
      queryClient.removeQueries({ queryKey: adminKeys.election(electionId) });
      navigate("/admin/elections");
    },
    onError: (e) => toast.error(e.response?.data?.message || "Delete failed"),
  });

  const downloadPdf = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/admin/elections/${electionId}/pdf`, {
        withCredentials: true,
        responseType: "blob",
      });
      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${(election?.title || "election").replace(/[^\w\s-]/g, "")}-election-report.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success("Download started");
    } catch {
      toast.error("Could not download PDF");
    }
  };

  if (loading || !election) {
    return (
      <div className="flex justify-center items-center min-h-[40vh] text-slate-500">
        Loading…
      </div>
    );
  }

  const soc = election.societyId;
  const candidates = election.candidates || [];
  const votes = election.votes || [];
  const winners = election.winners || [];

  return (
    <div className={a.pageDetail}>
      <button type="button" onClick={() => navigate("/admin/elections")} className={a.backLink}>
        <ArrowLeft size={18} />
        Back to elections
      </button>

      <div className={a.headerRow}>
        <div className="min-w-0">
          <h1 className={`${a.h1} flex items-center gap-2`}>
            <Vote className="shrink-0 text-slate-500" size={24} strokeWidth={1.75} />
            <span className="min-w-0">{election.title}</span>
          </h1>
          <p className={a.lead}>
            Status: <span className="font-semibold text-slate-800">{election.status}</span>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={downloadPdf} className={a.btnPrimary}>
            <Download size={18} />
            Download PDF
          </button>
          <button
            type="button"
            onClick={() => setDeleteOpen(true)}
            disabled={deleteMut.isPending}
            className={a.btnOutlineDanger}
          >
            <Trash2 size={18} />
            Delete election
          </button>
        </div>
      </div>

      <div className={`${a.panel} space-y-2`}>
        <h2 className={a.panelTitle}>Configuration</h2>
        <p className="text-slate-700">
          <span className="text-slate-500">Roles:</span>{" "}
          {(election.roles || []).join(", ") || "—"}
        </p>
        <p className="text-slate-700">
          <span className="text-slate-500">Who can apply:</span> {election.applicationEligibility}
        </p>
        <p className="text-slate-700">
          <span className="text-slate-500">Who can vote:</span> {election.votingEligibility}
        </p>
        <p className="text-slate-700">
          <span className="text-slate-500">Roles assigned from results:</span>{" "}
          {election.rolesAssigned === true ? "Yes" : election.rolesAssigned === false ? "No" : "—"}
        </p>
        <p className="text-slate-700">
          <span className="text-slate-500">Apply deadline:</span> {fmt(election.applyDeadline)}
        </p>
        <p className="text-slate-700">
          <span className="text-slate-500">Voting window:</span> {fmt(election.startDate)} →{" "}
          {fmt(election.endDate)}
        </p>
      </div>

      <div className={`${a.panel} space-y-2`}>
        <h2 className={`${a.panelTitle} flex items-center gap-2`}>
          <Building2 size={16} className="text-slate-500" strokeWidth={1.75} />
          Society
        </h2>
        {soc ? (
          <>
            <p className="font-medium text-slate-900">{soc.name}</p>
            {soc.shortName && <p className="text-slate-600 text-xs">Short: {soc.shortName}</p>}
            <p className="text-slate-700">Status: {soc.status || "—"}</p>
            <p className="text-slate-700">
              {soc.email || "—"} · {soc.phone || "—"}
            </p>
            {soc.department && <p className="text-slate-600">{soc.department}</p>}
            {soc.description && (
              <p className="text-slate-600 text-xs mt-2 whitespace-pre-wrap">{soc.description}</p>
            )}
            {soc._id && (
              <Link
                to={`/admin/societies/${soc._id}`}
                className="mt-2 inline-block text-sm font-medium text-slate-700 underline-offset-2 hover:text-slate-900 hover:underline"
              >
                Open society in admin →
              </Link>
            )}
          </>
        ) : (
          <p className="text-slate-500">—</p>
        )}
      </div>

      <div className={a.panel}>
        <h2 className={`${a.panelTitle} mb-3 flex items-center gap-2`}>
          <Users size={16} className="text-slate-500" strokeWidth={1.75} />
          Candidates ({candidates.length})
        </h2>
        {candidates.length === 0 ? (
          <p className="text-sm text-slate-500">No candidates.</p>
        ) : (
          <ul className="space-y-4 text-sm">
            {candidates.map((c, i) => {
              const u = c.user;
              return (
                <li
                  key={i}
                  className="rounded-lg border border-slate-200 bg-slate-50/80 p-4"
                >
                  <div className="flex flex-wrap gap-2 mb-2">
                    <span className="font-medium text-slate-900">{c.role}</span>
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                        c.status === "approved"
                          ? "bg-teal-50 text-teal-800"
                          : c.status === "rejected"
                            ? "bg-red-100 text-red-800"
                            : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {c.status}
                    </span>
                  </div>
                  {u ? (
                    <p className="text-slate-900 font-medium">
                      {u.fullname} · {u.email}
                    </p>
                  ) : (
                    <p className="text-slate-500">User missing</p>
                  )}
                  {u && (
                    <p className="text-xs text-slate-600 mt-1">
                      Dept {u.Department || "—"} · Roll {u.rollNo || "—"}
                    </p>
                  )}
                  <p className="text-xs text-slate-600 mt-2">CNIC: {c.cnic}</p>
                  {c.reason && <p className="text-xs text-slate-600 mt-1">Reason: {c.reason}</p>}
                  {c.image && (
                    <p className="text-xs text-slate-500 mt-1">
                      Image file: <code className="bg-slate-100 px-1 rounded">{c.image}</code>
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className={a.panel}>
        <h2 className={`${a.panelTitle} mb-3 flex items-center gap-2`}>
          <ListChecks size={16} className="text-slate-500" strokeWidth={1.75} />
          Votes ({votes.length})
        </h2>
        {votes.length === 0 ? (
          <p className="text-sm text-slate-500">No votes cast.</p>
        ) : (
          <div className="max-h-72 overflow-y-auto text-sm space-y-2">
            {votes.map((v, i) => (
              <div
                key={i}
                className="border-b border-slate-100 pb-2 last:border-0 text-slate-800"
              >
                <span className="text-slate-500 text-xs uppercase">{v.role}</span>
                <p className="mt-0.5">
                  Voter:{" "}
                  {v.voter
                    ? `${v.voter.fullname} (${v.voter.email})`
                    : "—"}
                </p>
                <p className="text-xs text-slate-600">
                  For:{" "}
                  {v.candidate
                    ? `${v.candidate.fullname} (${v.candidate.email})`
                    : "—"}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className={a.panel}>
        <h2 className={`${a.panelTitle} mb-3 flex items-center gap-2`}>
          <Trophy size={16} className="text-slate-500" strokeWidth={1.75} />
          Winners ({winners.length})
        </h2>
        {winners.length === 0 ? (
          <p className="text-sm text-slate-500">No winners recorded.</p>
        ) : (
          <ul className="text-sm space-y-2">
            {winners.map((w, i) => (
              <li key={i} className="text-slate-800">
                <span className="font-medium text-slate-600">{w.role}:</span>{" "}
                {w.user ? `${w.user.fullname} (${w.user.email})` : "—"}
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="text-xs text-slate-400">
        Record created {fmt(election.createdAt)} · Updated {fmt(election.updatedAt)}
      </p>

      <AdminDeleteModal
        open={deleteOpen}
        onClose={() => {
          if (deleteMut.isPending) return;
          setDeleteOpen(false);
        }}
        title="Delete election?"
        description="This permanently removes the election. Candidate photos will be removed from storage. This cannot be undone."
        isPending={deleteMut.isPending}
        onConfirm={() => deleteMut.mutate()}
      />
    </div>
  );
}
