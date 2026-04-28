import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import API_BASE_URL, { uploadFileUrl } from "../../../config/api.config";
import { FaEdit } from "react-icons/fa";
import { RiDeleteBinLine } from "react-icons/ri";
import {
    ArrowLeft, Users, Mic, Star,
} from "lucide-react";

function AdminEventDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    useEffect(() => { fetchAll(); }, [id]);

    const fetchAll = async () => {
        try {
            setLoading(true);
            const eventRes = await axios.get(`${API_BASE_URL}/event/Eventbyid/${id}`, { withCredentials: true });
            setEvent(eventRes.data.data);
        } catch {
            alert("Failed to load event.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        try {
            await axios.delete(`${API_BASE_URL}/event/delete/${id}`, { withCredentials: true });
            navigate(-1);
        } catch {
            alert("Failed to delete event.");
        }
    };

    const fmt = (d) =>
        new Date(d).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
    const fmtTime = (d) =>
        new Date(d).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-[#3699FF] border-t-transparent rounded-full animate-spin" />
        </div>
    );

    if (!event) return (
        <div className="min-h-screen flex items-center justify-center text-[#4B5563] font-medium">
            Event not found.
        </div>
    );

    const approvedVolunteersCount = (event.volunteers || []).filter(
        (v) => v.status === "approved"
    ).length;
    const hasPeople = (event.chiefGuests?.length > 0) || (event.speakers?.length > 0) || (event.hosts?.length > 0);

    const statusColors = {
        scheduled: "bg-emerald-50 text-emerald-800",
        published:  "bg-green-100 text-green-700",
        postponed:  "bg-yellow-100 text-yellow-700",
        cancelled:  "bg-red-100 text-red-700",
        completed:  "bg-gray-100 text-gray-600",
    };

    const DetailRow = ({ label, value }) => (
        <div className="flex flex-col border-b border-slate-100 py-3 last:border-0 sm:flex-row sm:items-start">
            <span className="w-40 shrink-0 pt-0.5 text-[11px] font-bold uppercase tracking-wider text-gray-500">{label}</span>
            <span className="mt-1 text-sm text-slate-700 sm:mt-0">{value || "—"}</span>
        </div>
    );

    const SectionTitle = ({ title }) => (
        <h2 className="mb-4 border-b border-slate-200 pb-2 text-xs font-bold uppercase tracking-[0.12em] text-[#3699FF]">
            {title}
        </h2>
    );

    const PersonCard = ({ person }) => (
        <div className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#3699FF] text-sm font-bold text-white">
                {person.name?.charAt(0)?.toUpperCase() || "?"}
            </div>
            <div>
                <p className="text-sm font-semibold leading-tight text-slate-800">{person.name}</p>
                {person.designation && <p className="mt-0.5 text-xs text-[#2B8ACF]">{person.designation}</p>}
                {person.bio && <p className="mt-1 text-xs leading-relaxed text-gray-500">{person.bio}</p>}
            </div>
        </div>
    );

    return (
        <div className="manager-page-shell space-y-6 font-sans">

            {/* HEADER */}
            <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate(-1)}
                        className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#4B5563] transition hover:bg-gray-50"
                    >
                        <ArrowLeft size={16} /> Back
                    </button>
                    <span className="text-gray-300 font-light text-lg">/</span>
                    <h1 className="manager-page-heading">Event Details</h1>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => navigate("/manager/volunteers")}
                        className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                        Manage Volunteers
                    </button>
                    <button
                        onClick={() => navigate(`/manager/eventForm/${event._id}/edit`)}
                        className="inline-flex items-center gap-2 rounded-md bg-[#3699FF] px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110"
                    >
                        <FaEdit size={14} /> Edit Event
                    </button>
                    <button
                        onClick={() => setShowDeleteModal(true)}
                        className="inline-flex items-center gap-2 rounded-md border border-red-300 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                    >
                        <RiDeleteBinLine size={16} /> Delete
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">

                {/* ── LEFT COLUMN ─────────────────────────────────────────── */}
                <div className="space-y-5 lg:col-span-8">

                    {/* EVENT IMAGE + TITLE */}
                    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
                        <div className="h-56 w-full overflow-hidden">
                            {event.image ? (
                                <img
                                    src={uploadFileUrl(event.image)}
                                    alt={event.title}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center bg-slate-100 text-sm text-[#4B5563]">
                                    No Image
                                </div>
                            )}
                        </div>
                        <div className="p-6">
                            <div className="mb-3 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                                <h2 className="text-2xl font-bold text-[#111827]">{event.title}</h2>
                                <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${statusColors[event.status] || "bg-gray-100 text-gray-600"}`}>
                                    {event.status}
                                </span>
                            </div>
                            <p className="text-sm text-gray-500">
                                Organizer: <span className="font-semibold text-gray-700">{event.organizer?.name || "N/A"}</span>
                            </p>
                        </div>
                    </div>

                    {/* CORE DETAILS */}
                    <div className="rounded-lg border border-gray-200 bg-white p-5">
                        <SectionTitle title="Event Information" />
                        <DetailRow label="Venue"        value={event.venue} />
                        <DetailRow label="Start Date"        value={event.startDateTime ? `${fmt(event.startDateTime)} at ${fmtTime(event.startDateTime)}` : null} />
                        <DetailRow label="End Date"          value={event.endDateTime   ? `${fmt(event.endDateTime)}   at ${fmtTime(event.endDateTime)}`   : null} />
                        <DetailRow label="Category"     value={event.category} />
                        
                    </div>

                    {/* DESCRIPTION */}
                    {event.description && (
                        <div className="rounded-lg border border-gray-200 bg-white p-5">
                            <SectionTitle title="Description" />
                            <div
                                className="prose prose-sm max-w-none leading-relaxed text-gray-600"
                                dangerouslySetInnerHTML={{ __html: event.description }}
                            />
                        </div>
                    )}

                    {/* PEOPLE */}
                    {hasPeople && (
                        <div className="rounded-lg border border-gray-200 bg-white p-5">
                            <SectionTitle title="People" />
                            <div className="space-y-6">
                                {event.chiefGuests?.length > 0 && (
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                                            <Star size={12} /> Chief Guests
                                        </p>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {event.chiefGuests.map((p, i) => <PersonCard key={i} person={p} />)}
                                        </div>
                                    </div>
                                )}
                                {event.speakers?.length > 0 && (
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                                            <Mic size={12} /> Speakers
                                        </p>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {event.speakers.map((p, i) => <PersonCard key={i} person={p} />)}
                                        </div>
                                    </div>
                                )}
                                {event.hosts?.length > 0 && (
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                                            <Users size={12} /> Hosts
                                        </p>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {event.hosts.map((p, i) => <PersonCard key={i} person={p} />)}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* ── RIGHT COLUMN ─────────────────────────────────────────── */}
                <div className="space-y-5 lg:col-span-4">

                    {/* VOLUNTEER SETTINGS */}
                    {event.isVolunteerOpen !== undefined && (
                        <div className="rounded-lg border border-gray-200 bg-white p-5">
                            <SectionTitle title="Volunteer Settings" />
                            <DetailRow
                                label="Status"
                                value={
                                    <span className={event.isVolunteerOpen ? "text-green-600 font-semibold" : "text-gray-400 font-semibold"}>
                                        {event.isVolunteerOpen ? "Open" : "Closed"}
                                    </span>
                                }
                            />
                            {event.volunteerLimit > 0 && (
                                <DetailRow label="Limit" value={`${approvedVolunteersCount} / ${event.volunteerLimit}`} />
                            )}
                            {event.volunteerDeadline && (
                                <DetailRow label="Deadline" value={fmt(event.volunteerDeadline)} />
                            )}
                        </div>
                    )}

                    {/* META */}
                    <div className="rounded-lg border border-gray-200 bg-white p-5">
                        <SectionTitle title="Meta" />
                        
                        <DetailRow label="Created"  value={event.createdAt ? new Date(event.createdAt).toLocaleString() : null} />
                        <DetailRow label="Updated"  value={event.updatedAt ? new Date(event.updatedAt).toLocaleString() : null} />
                    </div>
                </div>
            </div>

            {/* DELETE MODAL */}
            {showDeleteModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
                    <div className="w-80 rounded-xl border border-gray-200 bg-white p-6 shadow-lg">
                        <h2 className="text-lg font-bold text-red-700 mb-2">Confirm Delete</h2>
                        <p className="text-gray-700 mb-1 text-sm">
                            You are about to delete <span className="font-semibold">"{event.title}"</span>.
                        </p>
                        <p className="text-gray-500 text-sm mb-6">
                            This action <span className="font-semibold">cannot be undone</span>.
                        </p>
                        <div className="flex justify-center gap-4">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="px-4 py-2 border border-gray-400 hover:bg-gray-100 transition text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 transition text-sm"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminEventDetails;