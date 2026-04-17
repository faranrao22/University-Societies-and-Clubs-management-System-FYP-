import React, { useEffect, useState } from "react";
import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Building2, Loader2, Inbox } from "lucide-react";
import API_BASE_URL from "../../../config/api.config";
import toast from "react-hot-toast";
import AdminPageHeader from "../components/AdminPageHeader";
import { adminUi as a } from "../components/adminUi";
import { fetchAllSocieties } from "../api/adminApi";
import { adminKeys } from "../api/adminQueryKeys";

function presidentName(roles) {
  const p = roles?.find((r) => r.name === "President");
  return p?.user?.fullname || "—";
}

function pendingJoinCount(society) {
  return (society.joinRequests || []).filter((r) => r.status === "Pending").length;
}

export default function SocietyRequest() {
  const queryClient = useQueryClient();
  const [draftStatus, setDraftStatus] = useState({});

  const {
    data: allSocieties = [],
    isPending: loading,
    isError,
  } = useQuery({
    queryKey: adminKeys.societiesAll(),
    queryFn: fetchAllSocieties,
    staleTime: 60 * 1000,
  });

  useEffect(() => {
    if (isError) toast.error("Could not load societies");
  }, [isError]);

  useEffect(() => {
    const drafts = {};
    allSocieties.forEach((s) => {
      drafts[s._id] = s.status || "Inactive";
    });
    setDraftStatus(drafts);
  }, [allSocieties]);

  const saveMut = useMutation({
    mutationFn: ({ societyId, status }) =>
      axios.patch(
        `${API_BASE_URL}/admin/societies/${societyId}/status`,
        { status },
        { withCredentials: true }
      ),
    onSuccess: () => {
      toast.success("Status updated");
      queryClient.invalidateQueries({ queryKey: adminKeys.societiesAll() });
      queryClient.invalidateQueries({ queryKey: adminKeys.stats() });
      queryClient.invalidateQueries({ queryKey: ["admin", "society"] });
    },
    onError: (e) => toast.error(e.response?.data?.message || "Update failed"),
  });

  const inactiveList = allSocieties.filter((s) => s.status === "Inactive");

  const updateStatus = (societyId) => {
    const status = draftStatus[societyId];
    if (!status || !["Active", "Inactive"].includes(status)) {
      toast.error("Pick a valid status");
      return;
    }
    saveMut.mutate({ societyId, status });
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center gap-2 text-slate-500">
        <Loader2 className="animate-spin text-indigo-600" size={22} />
        <span className="text-sm font-medium">Loading societies…</span>
      </div>
    );
  }

  return (
    <div className={a.page}>
      <AdminPageHeader
        variant="hero"
        title="Society requests"
        description={
          <>
            Societies that are still <span className="font-semibold text-amber-800">Inactive</span>. Activate them
            when they are ready to operate, or keep them inactive.
          </>
        }
      />

      <div className={a.tableCard}>
        {inactiveList.length === 0 ? (
          <div className={a.emptyState}>
            <Building2 className="text-slate-300" size={40} strokeWidth={1.25} />
            <p className={a.emptyTitle}>No inactive societies</p>
            <p className="text-sm text-slate-500">All societies are currently active.</p>
          </div>
        ) : (
          <div className={a.tableScroll}>
            <table className={a.table}>
              <thead className={a.thead}>
                <tr>
                  <th className={a.th}>Society</th>
                  <th className={a.th}>Creator</th>
                  <th className={a.th}>President</th>
                  <th className={a.th}>Dept.</th>
                  <th className={`${a.th} text-center`}>Pending joins</th>
                  <th className={a.th}>New status</th>
                  <th className={`${a.th} text-center`}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {inactiveList.map((s, idx) => (
                  <tr key={s._id} className={a.tbodyRowStriped(idx)}>
                    <td className={a.cell}>
                      <div className="font-medium text-slate-900">{s.name}</div>
                      {s.shortName && <div className="text-xs text-slate-500">{s.shortName}</div>}
                      <Link to={`/admin/societies/${s._id}`} className={`${a.linkSubtle} mt-1 inline-block`}>
                        View details →
                      </Link>
                    </td>
                    <td className={a.cell}>
                      {s.Creator?.fullname || "—"}
                      <div className="text-xs text-slate-500">{s.Creator?.email}</div>
                    </td>
                    <td className={a.cell}>{presidentName(s.roles)}</td>
                    <td className={a.cell}>{s.department || "—"}</td>
                    <td className={`${a.cell} text-center`}>
                      <span className="inline-flex items-center justify-center gap-1 text-slate-800">
                        <Inbox size={14} className="text-amber-600" />
                        {pendingJoinCount(s)}
                      </span>
                    </td>
                    <td className={a.cell}>
                      <select
                        className={a.select}
                        value={draftStatus[s._id] ?? "Inactive"}
                        onChange={(e) =>
                          setDraftStatus((prev) => ({
                            ...prev,
                            [s._id]: e.target.value,
                          }))
                        }
                        disabled={saveMut.isPending && saveMut.variables?.societyId === s._id}
                      >
                        <option value="Inactive">Inactive</option>
                        <option value="Active">Active</option>
                      </select>
                    </td>
                    <td className={`${a.cell} text-center`}>
                      <button
                        type="button"
                        disabled={
                          saveMut.isPending ||
                          (draftStatus[s._id] ?? s.status) === s.status
                        }
                        onClick={() => updateStatus(s._id)}
                        className={a.btnPrimarySm}
                      >
                        {saveMut.isPending && saveMut.variables?.societyId === s._id ? "Saving…" : "Save status"}
                      </button>
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
