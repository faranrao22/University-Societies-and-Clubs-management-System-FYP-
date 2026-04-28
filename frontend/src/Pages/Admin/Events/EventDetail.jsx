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
        <h2 className={a.panelTitle}>Event information</h2>
        <p>
          <span className="text-slate-500">Category:</span>{" "}
          <span className="text-slate-800">{event.category || "—"}</span>
        </p>
        <p>
          <span className="text-slate-500">Status:</span>{" "}
          <span className="text-slate-800 capitalize">{event.status || "—"}</span>
        </p>
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
          <span>{event.venue || "—"}</span>
        </p>
        {event.description ? (
          <div>
            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-500">Description</p>
            <div
              className="prose prose-sm max-w-none text-slate-800"
              dangerouslySetInnerHTML={{ __html: event.description }}
            />
          </div>
        ) : null}
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
            <p className="text-slate-700">Dept: {org.department || "—"}</p>
            {org.email ? <p className="text-slate-700">{org.email}</p> : null}
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
