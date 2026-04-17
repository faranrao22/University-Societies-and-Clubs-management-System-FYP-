import React, { useEffect, useState } from "react";
import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Download,
  Trash2,
  Calendar,
  MapPin,
  User,
} from "lucide-react";
import API_BASE_URL from "../../../config/api.config";
import toast from "react-hot-toast";
import { adminUi as a } from "../components/adminUi";
import AdminDeleteModal from "../components/AdminDeleteModal";
import { fetchAdminSociety, fetchAdminSocietyEvents } from "../api/adminApi";
import { adminKeys } from "../api/adminQueryKeys";

function formatDate(d) {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleString();
  } catch {
    return "—";
  }
}

export default function AdminSocietyDetail() {
  const { societyId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState("Inactive");
  const [eventDeleteId, setEventDeleteId] = useState(null);

  const {
    data: society,
    isPending: societyLoading,
    isError: societyError,
  } = useQuery({
    queryKey: adminKeys.society(societyId),
    queryFn: () => fetchAdminSociety(societyId),
    enabled: Boolean(societyId),
    staleTime: 60 * 1000,
  });

  const { data: events = [], isPending: eventsLoading } = useQuery({
    queryKey: adminKeys.societyEvents(societyId),
    queryFn: () => fetchAdminSocietyEvents(societyId),
    enabled: Boolean(societyId),
    staleTime: 60 * 1000,
  });

  useEffect(() => {
    if (societyError) {
      toast.error("Failed to load society");
      navigate("/admin/societies");
    }
  }, [societyError, navigate]);

  useEffect(() => {
    if (society?.status) setStatus(society.status);
  }, [society?.status]);

  const patchStatus = useMutation({
    mutationFn: (nextStatus) =>
      axios.patch(
        `${API_BASE_URL}/admin/societies/${societyId}/status`,
        { status: nextStatus },
        { withCredentials: true }
      ),
    onSuccess: () => {
      toast.success("Status updated");
      queryClient.invalidateQueries({ queryKey: adminKeys.society(societyId) });
      queryClient.invalidateQueries({ queryKey: adminKeys.societiesAll() });
      queryClient.invalidateQueries({ queryKey: adminKeys.stats() });
    },
    onError: (e) => toast.error(e.response?.data?.message || "Could not update status"),
  });

  const deleteEventMut = useMutation({
    mutationFn: (id) =>
      axios.delete(`${API_BASE_URL}/admin/events/${id}`, { withCredentials: true }),
    onSuccess: () => {
      toast.success("Event deleted");
      setEventDeleteId(null);
      queryClient.invalidateQueries({ queryKey: adminKeys.societyEvents(societyId) });
      queryClient.invalidateQueries({ queryKey: adminKeys.events() });
    },
    onError: (e) => toast.error(e.response?.data?.message || "Delete failed"),
  });

  const downloadPdf = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/admin/societies/${societyId}/pdf`, {
        withCredentials: true,
        responseType: "blob",
      });
      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${(society?.name || "society").replace(/[^\w\s-]/g, "")}-report.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success("Download started");
    } catch {
      toast.error("PDF download failed");
    }
  };

  const saveStatus = () => patchStatus.mutate(status);

  const loading = societyLoading || !society;

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-slate-500">
        Loading…
      </div>
    );
  }

  return (
    <div className={a.pageDetail}>
      <button type="button" onClick={() => navigate("/admin/societies")} className={a.backLink}>
        <ArrowLeft size={18} />
        Back to societies
      </button>

      <div className={a.headerRow}>
        <div className="min-w-0">
          <h1 className={a.h1}>{society.name}</h1>
          {society.shortName && <p className={a.lead}>{society.shortName}</p>}
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={downloadPdf} className={a.btnPrimary}>
            <Download size={18} />
            Download PDF report
          </button>
        </div>
      </div>

      <div className={`${a.panel} space-y-4`}>
        <h2 className={a.sectionHeading}>Admin controls</h2>
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className={a.label}>Society status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className={a.select}>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
          <button
            type="button"
            onClick={saveStatus}
            disabled={patchStatus.isPending}
            className={a.btnPrimary}
          >
            {patchStatus.isPending ? "Saving…" : "Save status"}
          </button>
        </div>
      </div>

      <div className={`${a.panel} space-y-3 text-sm`}>
        <h2 className={a.panelTitle}>Details</h2>
        <p>
          <span className="text-slate-500">Description:</span>{" "}
          <span className="text-slate-800">{society.description || "—"}</span>
        </p>
        <p>
          <span className="text-slate-500">Department:</span> {society.department || "—"}
        </p>
        <p>
          <span className="text-slate-500">Advisor:</span> {society.advisor || "—"}
        </p>
        <p>
          <span className="text-slate-500">Contact:</span> {society.email || "—"} · {society.phone || "—"}
        </p>
        <p>
          <span className="text-slate-500">Join policy:</span> {society.joinPolicy || "—"}
        </p>
        <p>
          <span className="text-slate-500">Members (count):</span>{" "}
          {society.members?.length ?? society.membersCount ?? "—"}
        </p>
      </div>

      <div className={a.panel}>
        <h2 className={`${a.panelTitle} mb-3 flex items-center gap-2`}>
          <User size={16} className="text-slate-500" strokeWidth={1.75} />
          Leadership & members
        </h2>
        <p className="text-sm text-slate-700">
          <span className="text-slate-500">Creator:</span>{" "}
          {society.Creator ? `${society.Creator.fullname} (${society.Creator.email})` : "—"}
        </p>
        <ul className="mt-3 space-y-2 text-sm">
          {(society.roles || []).map((r) => (
            <li key={r.name} className="text-slate-800">
              <span className="font-medium text-slate-600">{r.name}:</span>{" "}
              {r.user ? `${r.user.fullname} · ${r.user.email || ""}` : "Vacant"}
            </li>
          ))}
        </ul>
        <h3 className="mt-5 mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Members</h3>
        <ul className="max-h-56 divide-y divide-slate-100 overflow-y-auto text-sm">
          {(society.members || []).length === 0 ? (
            <li className="py-2 text-slate-500">No members</li>
          ) : (
            society.members.map((m) => (
              <li key={m._id} className="py-2 text-slate-800">
                {m.fullname} — {m.email}
                {m.rollNo ? ` · Roll ${m.rollNo}` : ""}
                {m.Department ? ` · ${m.Department}` : ""}
              </li>
            ))
          )}
        </ul>
      </div>

      <div className={a.panel}>
        <h2 className={`${a.panelTitle} mb-4 flex items-center gap-2`}>
          <Calendar size={16} className="text-slate-500" strokeWidth={1.75} />
          Events for this society
        </h2>
        {eventsLoading ? (
          <p className="text-sm text-slate-500">Loading events…</p>
        ) : events.length === 0 ? (
          <p className="text-sm text-slate-500">No events found.</p>
        ) : (
          <ul className="space-y-3">
            {events.map((ev) => (
              <li
                key={ev._id}
                className="flex flex-col gap-2 rounded-lg border border-slate-100 p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium text-slate-900">{ev.title}</p>
                  <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                    <Calendar size={12} />
                    {formatDate(ev.startDateTime)} — {formatDate(ev.endDateTime)}
                  </p>
                  {ev.venue && (
                    <p className="flex items-center gap-1 text-xs text-slate-500">
                      <MapPin size={12} />
                      {ev.venue}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-slate-500">
                    Status: {ev.status || "—"} · Creator: {ev.creator?.fullname || "—"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setEventDeleteId(ev._id)}
                  disabled={deleteEventMut.isPending && deleteEventMut.variables === ev._id}
                  className={`${a.btnOutlineDanger} px-3 py-1.5 text-xs`}
                >
                  <Trash2 size={16} />
                  {deleteEventMut.isPending && deleteEventMut.variables === ev._id ? "…" : "Delete"}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <AdminDeleteModal
        open={Boolean(eventDeleteId)}
        onClose={() => {
          if (deleteEventMut.isPending) return;
          setEventDeleteId(null);
        }}
        title="Delete event?"
        description="This permanently removes the event from the system."
        isPending={deleteEventMut.isPending}
        onConfirm={() => {
          if (eventDeleteId) deleteEventMut.mutate(eventDeleteId);
        }}
      />
    </div>
  );
}
