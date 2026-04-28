import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Trash2, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../../../config/api.config";
import toast from "react-hot-toast";
import { fetchAdminUsers } from "../api/adminApi";
import { adminKeys } from "../api/adminQueryKeys";
import AdminPageHeader from "../components/AdminPageHeader";
import AdminDeleteModal from "../components/AdminDeleteModal";
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
    },
    onError: (e) => toast.error(e.response?.data?.message || "Delete failed"),
  });

  const totalPages = Math.max(1, Math.ceil(managers.length / PAGE_SIZE));
  const pageSafe = Math.min(page, totalPages);
  const slice = managers.slice((pageSafe - 1) * PAGE_SIZE, pageSafe * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [managers.length]);

  return (
    <div className={a.page}>
      <AdminPageHeader
        variant="default"
        title="Manage managers"
        description="Keep manager accounts simple, clean, and up to date."
        actions={
          <button type="button" onClick={() => navigate("/admin/memberForm")} className={a.btnPrimary}>
            <Plus size={18} />
            Add manager
          </button>
        }
      />

      <div className={a.tableCard}>
        <div className={a.tableToolbar}>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Managers</p>
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
