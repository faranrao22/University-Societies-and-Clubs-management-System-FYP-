import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Download, UserPlus, X } from "lucide-react";
import API_BASE_URL from "../../../config/api.config";
import toast from "react-hot-toast";
import { useAuth } from "../../../context/AuthContext";
import { fetchAdminUsers } from "../api/adminApi";
import { adminKeys } from "../api/adminQueryKeys";
import AdminPageHeader from "../components/AdminPageHeader";
import AdminDeleteModal from "../components/AdminDeleteModal";
import AdminPillTabs from "../components/AdminPillTabs";
import AdminRowMenu from "../components/AdminRowMenu";
import { adminUi as a, adminRoleLabel, adminRolePillClass } from "../components/adminUi";

const ROLES = ["user", "manager", "admin"];

const DEPARTMENTS = [
  "Computer Science",
  "Information Technology",
  "Software Engineering",
  "Electrical Engineering",
  "Mechanical Engineering",
  "Business Administration",
  "Arts & Design",
  "Social Sciences",
  "Mathematics",
  "Physics",
];

const emptyCreateForm = () => ({
  fullname: "",
  email: "",
  password: "",
  Department: "",
  role: "user",
  rollNo: "",
  semester: "",
  session: "",
});

function initials(name) {
  if (!name || typeof name !== "string") return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function fmtDate(d) {
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

const TABS = [
  { id: "all", label: "All members" },
  { id: "user", label: "Students" },
  { id: "manager", label: "Managers" },
  { id: "admin", label: "Admins" },
];

const PAGE_SIZE = 10;

export default function AdminUsers() {
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [savingId, setSavingId] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState(emptyCreateForm);
  const [tab, setTab] = useState("all");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const {
    data: users = [],
    isPending: usersLoading,
    isError: usersError,
  } = useQuery({
    queryKey: adminKeys.users(),
    queryFn: fetchAdminUsers,
    staleTime: 60 * 1000,
  });

  useEffect(() => {
    if (usersError) toast.error("Could not load users");
  }, [usersError]);

  const updateRoleMut = useMutation({
    mutationFn: ({ id, role }) =>
      axios.put(`${API_BASE_URL}/auth/update/${id}`, { role }, { withCredentials: true }),
    onMutate: ({ id }) => setSavingId(id),
    onSuccess: () => {
      toast.success("Role updated");
      queryClient.invalidateQueries({ queryKey: adminKeys.users() });
      queryClient.invalidateQueries({ queryKey: adminKeys.stats() });
    },
    onError: (e) => toast.error(e.response?.data?.message || "Update failed"),
    onSettled: () => setSavingId(null),
  });

  const deleteUserMut = useMutation({
    mutationFn: (id) => axios.delete(`${API_BASE_URL}/auth/delete/${id}`, { withCredentials: true }),
    onSuccess: (_data, id) => {
      toast.success("User deleted");
      setDeleteModal(false);
      setSelectedId(null);
      queryClient.removeQueries({ queryKey: adminKeys.user(id) });
      queryClient.invalidateQueries({ queryKey: adminKeys.users() });
      queryClient.invalidateQueries({ queryKey: adminKeys.stats() });
    },
    onError: (e) => toast.error(e.response?.data?.message || "Delete failed"),
  });

  const createUserMut = useMutation({
    mutationFn: (payload) => axios.post(`${API_BASE_URL}/admin/users`, payload, { withCredentials: true }),
    onSuccess: () => {
      toast.success("Account created");
      setCreateForm(emptyCreateForm());
      setCreateOpen(false);
      queryClient.invalidateQueries({ queryKey: adminKeys.users() });
      queryClient.invalidateQueries({ queryKey: adminKeys.stats() });
    },
    onError: (err) => toast.error(err.response?.data?.message || "Could not create account"),
  });

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users.filter((u) => {
      if (tab !== "all" && u.role !== tab) return false;
      if (!q) return true;
      return (
        (u.fullname || "").toLowerCase().includes(q) ||
        (u.email || "").toLowerCase().includes(q) ||
        (u.Department || "").toLowerCase().includes(q) ||
        (u.rollNo || "").toLowerCase().includes(q)
      );
    });
  }, [users, tab, query]);

  useEffect(() => {
    setPage(1);
  }, [tab, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageSafe = Math.min(page, totalPages);
  const slice = filtered.slice((pageSafe - 1) * PAGE_SIZE, pageSafe * PAGE_SIZE);

  const updateRole = (id, role) => updateRoleMut.mutate({ id, role });

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    const payload = {
      fullname: createForm.fullname.trim(),
      email: createForm.email.trim(),
      password: createForm.password,
      Department: createForm.Department,
      role: createForm.role,
    };
    if (createForm.role === "user") {
      payload.rollNo = createForm.rollNo.trim();
      payload.semester = createForm.semester.trim();
      payload.session = createForm.session.trim();
    }
    createUserMut.mutate(payload);
  };

  const exportCsv = () => {
    const header = ["Full name", "Email", "Role", "Department", "Roll no.", "Joined"].join(",");
    const rows = filtered.map((u) =>
      [
        `"${(u.fullname || "").replace(/"/g, '""')}"`,
        `"${(u.email || "").replace(/"/g, '""')}"`,
        u.role,
        `"${(u.Department || "").replace(/"/g, '""')}"`,
        `"${(u.rollNo || "").replace(/"/g, '""')}"`,
        u.createdAt ? new Date(u.createdAt).toISOString() : "",
      ].join(",")
    );
    const blob = new Blob([header + "\n" + rows.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `users-export-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV downloaded");
  };

  const memberLine = (count) =>
    `Managing the directory of ${count.toLocaleString()} registered community member${count === 1 ? "" : "s"}.`;

  return (
    <div className={a.page}>
      <AdminPageHeader
        variant="hero"
        title="All users"
        description={memberLine(users.length)}
        actions={
          <>
            <button type="button" onClick={exportCsv} className={a.btnSecondary}>
              <Download size={18} strokeWidth={2} />
              Export CSV
            </button>
            <button
              type="button"
              onClick={() => {
                setCreateForm(emptyCreateForm());
                setCreateOpen(true);
              }}
              className={a.btnPrimary}
            >
              <UserPlus size={18} />
              Add user
            </button>
          </>
        }
      />

      <AdminPillTabs value={tab} onChange={setTab} tabs={TABS} />

      <div className={a.tableCard}>
        <div className={a.tableToolbar}>
          <p className="text-xs font-medium text-slate-500">
            Showing{" "}
            <span className="font-semibold text-slate-800">
              {filtered.length === 0 ? 0 : (pageSafe - 1) * PAGE_SIZE + 1}–
              {Math.min(pageSafe * PAGE_SIZE, filtered.length)}
            </span>{" "}
            of <span className="font-semibold text-slate-800">{filtered.length}</span> in this view
          </p>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter by name, email, department…"
            className="w-full max-w-xs rounded-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 sm:w-72"
          />
        </div>
        <div className={a.tableScroll}>
          <table className={a.table}>
            <thead className={a.thead}>
              <tr>
                <th className={`${a.th} pl-5`}>Member</th>
                <th className={a.th}>Role</th>
                <th className={a.th}>Status</th>
                <th className={a.th}>Joined</th>
                <th className={`${a.th} w-12 pr-5 text-right`}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {usersLoading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-16 text-center text-sm text-slate-500">
                    Loading directory…
                  </td>
                </tr>
              ) : slice.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-16 text-center text-sm text-slate-500">
                    No users match this view.
                  </td>
                </tr>
              ) : (
                slice.map((u, idx) => {
                  const rowIdx = (pageSafe - 1) * PAGE_SIZE + idx;
                  const isSelf = currentUser && u._id === currentUser._id;
                  const statusOk = !u.isGraduated;
                  return (
                    <tr key={u._id} className={a.tbodyRowStriped(rowIdx)}>
                      <td className={`${a.cellStrong} pl-5`}>
                        <div className="flex items-center gap-3">
                          <div
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 text-xs font-bold text-white shadow-sm ring-2 ring-white"
                            aria-hidden
                          >
                            {initials(u.fullname)}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-slate-900">{u.fullname}</p>
                            <p className="truncate text-xs text-slate-500">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className={a.cell}>
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                          <span
                            className={`inline-flex w-fit rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${adminRolePillClass(u.role)}`}
                          >
                            {adminRoleLabel(u.role)}
                          </span>
                          <select
                            className={`${a.select} max-w-[9.5rem] text-xs`}
                            value={u.role}
                            disabled={savingId === u._id || isSelf}
                            onChange={(e) => updateRole(u._id, e.target.value)}
                            title={isSelf ? "Use another admin account to change your role" : "Change role"}
                          >
                            {ROLES.map((r) => (
                              <option key={r} value={r}>
                                {r}
                              </option>
                            ))}
                          </select>
                          {savingId === u._id ? (
                            <span className="text-[11px] text-slate-400">Saving…</span>
                          ) : null}
                        </div>
                      </td>
                      <td className={a.cell}>
                        <span className="inline-flex items-center gap-2 text-xs font-medium text-slate-700">
                          <span
                            className={`h-2 w-2 shrink-0 rounded-full ${statusOk ? "bg-teal-500 shadow-[0_0_0_3px_rgba(20,184,166,0.25)]" : "bg-slate-300"}`}
                            aria-hidden
                          />
                          {statusOk ? "Active" : "Away"}
                        </span>
                      </td>
                      <td className={`${a.cell} text-slate-600`}>{fmtDate(u.createdAt)}</td>
                      <td className={`${a.cell} pr-5 text-right`}>
                        <AdminRowMenu
                          items={[
                            { label: "View profile", to: `/admin/users/${u._id}` },
                            {
                              label: "Delete user",
                              danger: true,
                              onClick: () => {
                                if (isSelf) {
                                  toast.error("You cannot delete your own account");
                                  return;
                                }
                                setSelectedId(u._id);
                                setDeleteModal(true);
                              },
                            },
                          ]}
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {filtered.length > PAGE_SIZE ? (
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

      {createOpen && (
        <div className={a.modalBackdrop}>
          <div className={a.modalPanel}>
            <button
              type="button"
              onClick={() => setCreateOpen(false)}
              className="absolute right-3 top-3 rounded-lg p-2 text-slate-500 transition hover:bg-slate-100"
              aria-label="Close"
            >
              <X size={22} />
            </button>
            <h2 className={a.modalTitle}>Add user</h2>
            <p className={`${a.modalLead} mb-5`}>
              Create a student, manager, or admin account. Students need roll number, semester, and session.
            </p>
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className={a.label}>Role</label>
                <select
                  value={createForm.role}
                  onChange={(e) => setCreateForm((f) => ({ ...f, role: e.target.value }))}
                  className={a.select + " w-full"}
                >
                  <option value="user">Student</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className={a.label}>Full name</label>
                  <input
                    required
                    value={createForm.fullname}
                    onChange={(e) => setCreateForm((f) => ({ ...f, fullname: e.target.value }))}
                    className={a.input}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className={a.label}>Email</label>
                  <input
                    type="email"
                    required
                    value={createForm.email}
                    onChange={(e) => setCreateForm((f) => ({ ...f, email: e.target.value }))}
                    className={a.input}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className={a.label}>Password</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={createForm.password}
                    onChange={(e) => setCreateForm((f) => ({ ...f, password: e.target.value }))}
                    className={a.input}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className={a.label}>Department</label>
                  <select
                    required
                    value={createForm.Department}
                    onChange={(e) => setCreateForm((f) => ({ ...f, Department: e.target.value }))}
                    className={a.select + " w-full"}
                  >
                    <option value="">Select department</option>
                    {DEPARTMENTS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                {createForm.role === "user" && (
                  <>
                    <div>
                      <label className={a.label}>Roll number</label>
                      <input
                        required
                        value={createForm.rollNo}
                        onChange={(e) => setCreateForm((f) => ({ ...f, rollNo: e.target.value }))}
                        className={a.input}
                      />
                    </div>
                    <div>
                      <label className={a.label}>Semester</label>
                      <input
                        required
                        value={createForm.semester}
                        onChange={(e) => setCreateForm((f) => ({ ...f, semester: e.target.value }))}
                        className={a.input}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className={a.label}>Session</label>
                      <input
                        required
                        value={createForm.session}
                        onChange={(e) => setCreateForm((f) => ({ ...f, session: e.target.value }))}
                        placeholder="e.g. 2022-2026"
                        className={a.input}
                      />
                    </div>
                  </>
                )}
              </div>
              <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
                <button type="button" onClick={() => setCreateOpen(false)} className={a.btnSecondary}>
                  Cancel
                </button>
                <button type="submit" disabled={createUserMut.isPending} className={a.btnPrimary}>
                  {createUserMut.isPending ? "Creating…" : "Add user"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <AdminDeleteModal
        open={deleteModal}
        onClose={() => {
          if (deleteUserMut.isPending) return;
          setDeleteModal(false);
          setSelectedId(null);
        }}
        title="Delete user?"
        description="This permanently removes the account from the system. This cannot be undone."
        isPending={deleteUserMut.isPending}
        onConfirm={() => {
          if (selectedId) deleteUserMut.mutate(selectedId);
        }}
      />
    </div>
  );
}
