import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Trash2, Plus, Building2, Users, Activity, Inbox, ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import API_BASE_URL from "../../../config/api.config";
import toast from "react-hot-toast";
import { fetchAdminStats, fetchAdminUsers } from "../api/adminApi";
import { adminKeys } from "../api/adminQueryKeys";
import AdminPageHeader from "../components/AdminPageHeader";
import AdminDeleteModal from "../components/AdminDeleteModal";
import AdminKpiCard from "../components/AdminKpiCard";
import { adminUi as a } from "../components/adminUi";

function initials(name) {
  if (!name || typeof name !== "string") return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

const PAGE_SIZE = 8;

export default function Managers() {
  const queryClient = useQueryClient();
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  const { data: allUsers = [], isError: usersError } = useQuery({
    queryKey: adminKeys.users(),
    queryFn: fetchAdminUsers,
    staleTime: 60 * 1000,
  });

  const { data: stats = null } = useQuery({
    queryKey: adminKeys.stats(),
    queryFn: fetchAdminStats,
    staleTime: 2 * 60 * 1000,
  });

  useEffect(() => {
    if (usersError) toast.error("Could not load managers");
  }, [usersError]);

  const managers = useMemo(() => allUsers.filter((u) => u.role === "manager"), [allUsers]);

  const deleteMut = useMutation({
    mutationFn: (id) => axios.delete(`${API_BASE_URL}/auth/delete/${id}`, { withCredentials: true }),
    onSuccess: () => {
      toast.success("Manager removed");
      setDeleteModal(false);
      setSelectedId(null);
      queryClient.invalidateQueries({ queryKey: adminKeys.users() });
      queryClient.invalidateQueries({ queryKey: adminKeys.stats() });
    },
    onError: (e) => toast.error(e.response?.data?.message || "Delete failed"),
  });

  const societyCoverage = useMemo(() => {
    if (!stats || !stats.societies) return null;
    const total = stats.societies;
    const activeCt = stats.activeSocieties ?? 0;
    return Math.round((activeCt / Math.max(total, 1)) * 100);
  }, [stats]);

  const totalPages = Math.max(1, Math.ceil(managers.length / PAGE_SIZE));
  const pageSafe = Math.min(page, totalPages);
  const slice = managers.slice((pageSafe - 1) * PAGE_SIZE, pageSafe * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [managers.length]);

  const badgeGreen = (text) => (
    <span className="inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-800 ring-1 ring-emerald-100">
      {text}
    </span>
  );
  const badgeOrange = (text) => (
    <span className="inline-flex rounded-full bg-orange-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-orange-900 ring-1 ring-orange-100">
      {text}
    </span>
  );

  return (
    <div className={a.page}>
      <AdminPageHeader
        variant="hero"
        title="Manage managers"
        description="Oversee the administrative leads of your campus societies. Assign accounts, review coverage, and keep the directory current."
        actions={
          <button type="button" onClick={() => navigate("/admin/memberForm")} className={a.btnPrimary}>
            <Plus size={20} />
            Add new manager
          </button>
        }
      />

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminKpiCard
          icon={Users}
          label="Total managers"
          value={managers.length.toLocaleString()}
          hint="Accounts with manager role"
          badge={badgeGreen("Roster")}
          iconClassName="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-indigo-100 bg-indigo-50 text-indigo-700"
        />
        <AdminKpiCard
          icon={Activity}
          label="Active directory"
          value={managers.length.toLocaleString()}
          hint="Real-time roster from live data"
          badge={badgeGreen("Live")}
          iconClassName="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-sky-100 bg-sky-50 text-sky-700"
        />
        <AdminKpiCard
          icon={Building2}
          label="Society coverage"
          value={societyCoverage != null ? `${societyCoverage}%` : "—"}
          hint="Active societies vs total registry"
          iconClassName="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-violet-100 bg-violet-50 text-violet-700"
        >
          {societyCoverage != null ? (
            <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-600 to-violet-500 transition-all"
                style={{ width: `${Math.min(100, societyCoverage)}%` }}
              />
            </div>
          ) : null}
        </AdminKpiCard>
        <AdminKpiCard
          icon={Inbox}
          label="Pending join requests"
          value={(stats?.pendingJoinRequests ?? 0).toLocaleString()}
          hint="Requires manager review"
          badge={(stats?.pendingJoinRequests ?? 0) > 0 ? badgeOrange("Review") : badgeGreen("Clear")}
          iconClassName="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-amber-100 bg-amber-50 text-amber-800"
        />
      </section>

      <div className={a.tableCard}>
        <div className={a.tableToolbar}>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Directory</p>
          <p className="text-xs text-slate-500">
            {managers.length} manager{managers.length === 1 ? "" : "s"} on file
          </p>
        </div>
        <div className={a.tableScroll}>
          <table className={a.table}>
            <thead className={a.thead}>
              <tr>
                <th className={`${a.th} pl-5`}>Manager</th>
                <th className={a.th}>Department</th>
                <th className={a.th}>Contact</th>
                <th className={a.th}>Status</th>
                <th className={`${a.th} pr-5 text-right`}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {slice.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-16 text-center text-sm text-slate-500">
                    No managers found
                  </td>
                </tr>
              ) : (
                slice.map((m, idx) => (
                  <tr key={m._id} className={a.tbodyRowStriped(idx)}>
                    <td className={`${a.cellStrong} pl-5`}>
                      <div className="flex items-center gap-3">
                        <div
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 text-xs font-bold text-white shadow-sm ring-2 ring-white"
                          aria-hidden
                        >
                          {initials(m.fullname)}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-slate-900">{m.fullname}</p>
                          <p className="truncate text-xs text-slate-500">Manager account</p>
                        </div>
                      </div>
                    </td>
                    <td className={a.cell}>
                      <span className="inline-flex rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-medium text-sky-900 ring-1 ring-sky-100">
                        {m.Department || "General"}
                      </span>
                    </td>
                    <td className={a.cell}>
                      <p className="text-sm text-slate-800">{m.email}</p>
                      <p className="text-xs text-slate-400">Primary contact</p>
                    </td>
                    <td className={a.cell}>
                      <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-900 ring-1 ring-emerald-100">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden />
                        Active
                      </span>
                    </td>
                    <td className={`${a.cell} pr-5 text-right`}>
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => navigate("/admin/memberForm", { state: { manager: m } })}
                          className={a.btnIcon}
                          title="Edit"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedId(m._id);
                            setDeleteModal(true);
                          }}
                          className={a.btnIconDanger}
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {managers.length > PAGE_SIZE ? (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 py-3 sm:px-5">
            <p className="text-xs text-slate-500">
              Page {pageSafe} of {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={pageSafe <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className={a.btnGhostToolbar}
              >
                Previous
              </button>
              <button
                type="button"
                disabled={pageSafe >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className={`${a.btnPrimarySm} rounded-full px-4`}
              >
                Next
              </button>
            </div>
          </div>
        ) : null}
      </div>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className={`${a.insightCard} lg:col-span-3`}>
          <span className={a.insightBadge}>Management insight</span>
          <h2 className={`${a.insightTitle} mt-2`}>Empowering your leads for better engagement.</h2>
          <p className={a.insightLead}>
            Pair each society with a responsive manager account so approvals, events, and elections stay on schedule.
          </p>
        </div>
        <div className={`${a.cardPadded} lg:col-span-2`}>
          <h2 className="mb-3 text-sm font-semibold tracking-tight text-slate-900">Quick actions</h2>
          <ul className="space-y-1">
            <li>
              <Link
                to="/admin/users"
                className="flex items-center justify-between gap-3 rounded-xl px-3 py-3 text-sm transition hover:bg-slate-50"
              >
                <span>
                  <span className="block font-medium text-slate-900">Bulk directory</span>
                  <span className="mt-0.5 block text-xs text-slate-500">Open all users</span>
                </span>
                <ArrowRight size={16} className="text-slate-300" />
              </Link>
            </li>
            <li>
              <Link
                to="/admin/societies"
                className="flex items-center justify-between gap-3 rounded-xl px-3 py-3 text-sm transition hover:bg-slate-50"
              >
                <span>
                  <span className="block font-medium text-slate-900">Society registry</span>
                  <span className="mt-0.5 block text-xs text-slate-500">Review leads &amp; status</span>
                </span>
                <ArrowRight size={16} className="text-slate-300" />
              </Link>
            </li>
          </ul>
        </div>
      </section>

      <AdminDeleteModal
        open={deleteModal}
        onClose={() => {
          if (deleteMut.isPending) return;
          setDeleteModal(false);
          setSelectedId(null);
        }}
        title="Delete manager?"
        description="The user account will be permanently removed from the system. This cannot be undone."
        isPending={deleteMut.isPending}
        onConfirm={() => {
          if (selectedId) deleteMut.mutate(selectedId);
        }}
      />
    </div>
  );
}
