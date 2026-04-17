import React, { useEffect, useState } from "react";
import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Download,
  Trash2,
  Calendar,
  MapPin,
  User,
  Building2,
  Mic,
  Users,
} from "lucide-react";
import API_BASE_URL from "../../../config/api.config";
import toast from "react-hot-toast";
import { adminUi as a } from "../components/adminUi";
import AdminDeleteModal from "../components/AdminDeleteModal";
import { fetchAdminEvent } from "../api/adminApi";
import { adminKeys } from "../api/adminQueryKeys";

function fmt(d) {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleString();
  } catch {
    return "—";
  }
}

function PersonList({ title, people, icon: Icon }) {
  const list = people || [];
  return (
    <div className="rounded-lg border border-slate-100 p-4 bg-slate-50/50">
      <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2 mb-3">
        {Icon && <Icon size={16} className="text-slate-500" strokeWidth={1.75} />}
        {title}
      </h3>
      {list.length === 0 ? (
        <p className="text-sm text-slate-500">None listed.</p>
      ) : (
        <ul className="space-y-2 text-sm text-slate-800">
          {list.map((p, i) => (
            <li key={i} className="border-b border-slate-100 last:border-0 pb-2 last:pb-0">
              <span className="font-medium">{p.name || "—"}</span>
              {p.designation && (
                <span className="text-slate-600"> · {p.designation}</span>
              )}
              {p.bio && <p className="text-xs text-slate-600 mt-1">{p.bio}</p>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function AdminEventDetail() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const {
    data: event,
    isPending: loading,
    isError,
  } = useQuery({
    queryKey: adminKeys.event(eventId),
    queryFn: () => fetchAdminEvent(eventId),
    enabled: Boolean(eventId),
    staleTime: 60 * 1000,
  });

  useEffect(() => {
    if (isError) {
      toast.error("Event not found");
      navigate("/admin/events");
    }
  }, [isError, navigate]);

  const deleteMut = useMutation({
    mutationFn: () =>
      axios.delete(`${API_BASE_URL}/admin/events/${eventId}`, { withCredentials: true }),
    onSuccess: () => {
      toast.success("Event deleted");
      setDeleteOpen(false);
      const ev = queryClient.getQueryData(adminKeys.event(eventId));
      const sid = ev?.organizer?._id;
      queryClient.invalidateQueries({ queryKey: adminKeys.events() });
      queryClient.removeQueries({ queryKey: adminKeys.event(eventId) });
      if (sid) queryClient.invalidateQueries({ queryKey: adminKeys.societyEvents(sid) });
      navigate("/admin/events");
    },
    onError: (e) => toast.error(e.response?.data?.message || "Delete failed"),
  });

  const downloadPdf = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/admin/events/${eventId}/pdf`, {
        withCredentials: true,
        responseType: "blob",
      });
      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${(event?.title || "event").replace(/[^\w\s-]/g, "")}-details.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success("Download started");
    } catch {
      toast.error("Could not download PDF");
    }
  };

  if (loading || !event) {
    return (
      <div className="flex justify-center items-center min-h-[40vh] text-slate-500">
        Loading…
      </div>
    );
  }

  const org = event.organizer;
  const creator = event.creator;
  const volunteers = event.volunteers || [];

  return (
    <div className={a.pageDetail}>
      <button type="button" onClick={() => navigate("/admin/events")} className={a.backLink}>
        <ArrowLeft size={18} />
        Back to events
      </button>

      <div className={a.headerRow}>
        <div className="min-w-0">
          <h1 className={a.h1}>{event.title}</h1>
          <p className={a.lead}>
            {event.category} · <span className="capitalize">{event.status}</span>
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
            Delete event
          </button>
        </div>
      </div>

      <div className={`${a.panel} space-y-3 text-sm`}>
        <h2 className={a.panelTitle}>Schedule &amp; venue</h2>
        <p className="flex items-start gap-2 text-slate-700">
          <Calendar size={16} className="shrink-0 mt-0.5 text-slate-500" />
          <span>
            <span className="text-slate-500">Start:</span> {fmt(event.startDateTime)}
            <br />
            <span className="text-slate-500">End:</span> {fmt(event.endDateTime)}
          </span>
        </p>
        <p className="flex items-start gap-2 text-slate-700">
          <MapPin size={16} className="shrink-0 mt-0.5 text-slate-500" />
          <span>{event.venue}</span>
        </p>
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Description</p>
          <p className="text-slate-800 whitespace-pre-wrap">{event.description}</p>
        </div>
        {event.image && (
          <p className="text-xs text-slate-500">
            Image file: <code className="bg-slate-100 px-1 rounded">{event.image}</code>
          </p>
        )}
      </div>

      <div className={`${a.panel} space-y-3 text-sm`}>
        <h2 className={`${a.panelTitle} flex items-center gap-2`}>
          <Building2 size={16} className="text-slate-500" strokeWidth={1.75} />
          Organizing society
        </h2>
        {org ? (
          <>
            <p className="text-slate-800 font-medium">{org.name}</p>
            {org.shortName && <p className="text-slate-600 text-xs">Short name: {org.shortName}</p>}
            <p className="text-slate-700">
              Status: {org.status || "—"} · Dept: {org.department || "—"}
            </p>
            <p className="text-slate-700">{org.email || "—"} · {org.phone || "—"}</p>
            {org.description && (
              <p className="text-slate-600 text-xs mt-2 whitespace-pre-wrap">{org.description}</p>
            )}
            {org._id && (
              <Link
                to={`/admin/societies/${org._id}`}
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

      <div className={`${a.panel} space-y-2 text-sm`}>
        <h2 className={`${a.panelTitle} flex items-center gap-2`}>
          <User size={16} className="text-slate-500" strokeWidth={1.75} />
          Creator
        </h2>
        {creator ? (
          <p className="text-slate-800">
            {creator.fullname} · {creator.email}
            <br />
            <span className="text-slate-600 text-xs">
              {creator.Department && `${creator.Department} · `}
              Role: {creator.role}
              {creator.rollNo && ` · Roll ${creator.rollNo}`}
            </span>
          </p>
        ) : (
          <p className="text-slate-500">—</p>
        )}
      </div>

      <div className={`${a.panel} space-y-2 text-sm`}>
        <h2 className={a.panelTitle}>Volunteer settings</h2>
        <p className="text-slate-700">Applications open: {event.isVolunteerOpen ? "Yes" : "No"}</p>
        <p className="text-slate-700">Limit: {event.volunteerLimit ?? 0}</p>
        <p className="text-slate-700">Deadline: {fmt(event.volunteerDeadline)}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
        <PersonList title="Chief guests" people={event.chiefGuests} icon={Users} />
        <PersonList title="Speakers" people={event.speakers} icon={Mic} />
        <PersonList title="Hosts" people={event.hosts} icon={Users} />
      </div>

      <div className={a.panel}>
        <h2 className={`${a.panelTitle} mb-3 flex items-center gap-2`}>
          <Users size={16} className="text-slate-500" strokeWidth={1.75} />
          Volunteer applications ({volunteers.length})
        </h2>
        {volunteers.length === 0 ? (
          <p className="text-sm text-slate-500">No applications.</p>
        ) : (
          <ul className="space-y-4 text-sm">
            {volunteers.map((v, i) => {
              const u = v.user;
              return (
                <li
                  key={i}
                  className="border border-slate-100 rounded-lg p-4 bg-slate-50/60"
                >
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                        v.status === "approved"
                          ? "bg-teal-50 text-teal-800"
                          : v.status === "rejected"
                            ? "bg-red-100 text-red-800"
                            : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {v.status}
                    </span>
                    <span className="text-xs text-slate-500">Applied {fmt(v.appliedAt)}</span>
                  </div>
                  {u ? (
                    <p className="font-medium text-slate-900">
                      {u.fullname} · {u.email}
                    </p>
                  ) : (
                    <p className="text-slate-500">User record missing</p>
                  )}
                  {u && (
                    <p className="text-xs text-slate-600 mt-1">
                      {u.Department && `${u.Department} · `}
                      Roll {u.rollNo || "—"} · Semester {u.semester || "—"} · Session {u.session || "—"}
                    </p>
                  )}
                  <p className="text-xs text-slate-700 mt-2">
                    Preferred role: {v.preferredRole || "—"} · Assigned: {v.role || "—"}
                  </p>
                  <p className="text-xs text-slate-600 mt-1">Motivation: {v.motivation || "—"}</p>
                  <p className="text-xs text-slate-600">
                    Skills: {Array.isArray(v.skills) ? v.skills.join(", ") : v.skills || "—"}
                  </p>
                  <p className="text-xs text-slate-600">Availability: {v.availability || "—"}</p>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <p className="text-xs text-slate-400">
        Record created {fmt(event.createdAt)} · Updated {fmt(event.updatedAt)}
      </p>

      <AdminDeleteModal
        open={deleteOpen}
        onClose={() => {
          if (deleteMut.isPending) return;
          setDeleteOpen(false);
        }}
        title="Delete event?"
        description="This permanently removes the event and related data from the system. This cannot be undone."
        isPending={deleteMut.isPending}
        onConfirm={() => deleteMut.mutate()}
      />
    </div>
  );
}
