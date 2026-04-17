import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import API_BASE_URL, { uploadFileUrl } from "../../../config/api.config";
import { FaEdit } from "react-icons/fa";
import { RiDeleteBinLine } from "react-icons/ri";
import {
    ArrowLeft, Users, CheckCircle, XCircle, Info,
    Mic, Star, BadgeCheck, AlertCircle,
} from "lucide-react";

function AdminEventDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [event, setEvent] = useState(null);
    const [volunteers, setVolunteers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState({});
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    useEffect(() => { fetchAll(); }, [id]);

    const fetchAll = async () => {
        try {
            setLoading(true);
            const [eventRes, volunteerRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/event/Eventbyid/${id}`, { withCredentials: true }),
                axios.get(`${API_BASE_URL}/event/volunteer/requests/${id}`, { withCredentials: true }),
            ]);
            setEvent(eventRes.data.data);
            setVolunteers(volunteerRes.data.data || []);
        } catch {
            alert("Failed to load event.");
        } finally {
            setLoading(false);
        }
    };

    const handleVolunteerAction = async (volunteerId, action) => {
        try {
            setActionLoading((prev) => ({ ...prev, [volunteerId]: action }));
            await axios.patch(
                `${API_BASE_URL}/event/${id}/volunteer/${volunteerId}/${action}`,
                {},
                { withCredentials: true }
            );
            await fetchAll();
        } catch {
            alert(`Failed to ${action} volunteer.`);
        } finally {
            setActionLoading((prev) => ({ ...prev, [volunteerId]: null }));
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

    const pending  = volunteers.filter((v) => v.status === "pending");
    const approved = volunteers.filter((v) => v.status === "approved");
    const rejected = volunteers.filter((v) => v.status === "rejected");
    const hasPeople = (event.chiefGuests?.length > 0) || (event.speakers?.length > 0) || (event.hosts?.length > 0);

    const statusColors = {
        scheduled: "bg-emerald-50 text-emerald-800",
        published:  "bg-green-100 text-green-700",
        postponed:  "bg-yellow-100 text-yellow-700",
        cancelled:  "bg-red-100 text-red-700",
        completed:  "bg-gray-100 text-gray-600",
    };

    const volunteerBadgeColors = {
        pending:  "bg-yellow-100 text-yellow-700",
        approved: "bg-green-100 text-green-700",
        rejected: "bg-red-100 text-red-700",
    };

    const DetailRow = ({ label, value }) => (
        <div className="flex flex-col sm:flex-row sm:items-start py-3 border-b border-gray-100 last:border-0">
            <span className="w-40 shrink-0 text-xs font-semibold text-gray-500 uppercase tracking-wide pt-0.5">{label}</span>
            <span className="text-gray-800 text-sm mt-1 sm:mt-0">{value || "—"}</span>
        </div>
    );

    const SectionTitle = ({ title }) => (
        <h2 className="text-sm font-bold text-[#3699FF] uppercase tracking-widest mb-4 pb-2 border-b-2 border-[#3699FF]">
            {title}
        </h2>
    );

    const PersonCard = ({ person }) => (
        <div className="flex items-start gap-3 p-3 border border-gray-200 bg-slate-100/90">
            <div className="w-9 h-9 bg-[#3699FF] text-white flex items-center justify-center font-bold text-sm shrink-0 rounded-lg">
                {person.name?.charAt(0)?.toUpperCase() || "?"}
            </div>
            <div>
                <p className="font-semibold text-gray-800 text-sm leading-tight">{person.name}</p>
                {person.designation && <p className="text-xs text-[#2B8ACF] mt-0.5">{person.designation}</p>}
                {person.bio && <p className="text-xs text-gray-500 mt-1 leading-relaxed">{person.bio}</p>}
            </div>
        </div>
    );

    return (
        <div className="min-h-screen p-6 font-sans">

            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-1.5 text-[#4B5563] hover:text-[#3699FF] text-xs font-semibold uppercase tracking-widest transition"
                    >
                        <ArrowLeft size={16} /> Back
                    </button>
                    <span className="text-gray-300 font-light text-lg">/</span>
                    <h1 className="text-2xl font-bold text-[#3699FF] tracking-tight">Event Details</h1>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => navigate(`/manager/eventForm/${event._id}/edit`)}
                        className="flex items-center gap-2 bg-[#3699FF] text-white px-4 py-2 text-sm font-medium rounded-lg shadow-sm hover:brightness-110 transition"
                    >
                        <FaEdit size={14} /> Edit Event
                    </button>
                    <button
                        onClick={() => setShowDeleteModal(true)}
                        className="flex items-center gap-2 border border-red-500 text-red-600 px-4 py-2 text-sm font-medium hover:bg-red-50 transition"
                    >
                        <RiDeleteBinLine size={16} /> Delete
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* ── LEFT COLUMN ─────────────────────────────────────────── */}
                <div className="lg:col-span-8 space-y-6">

                    {/* VOLUNTEER REQUESTS — TOP */}
                    {event.isVolunteerOpen && (
                        <div className="bg-white border border-gray-200 p-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
                                <SectionTitle title="Volunteer Applications" />
                                <div className="flex gap-4 text-xs font-semibold -mt-3">
                                    <span className="text-yellow-600">{pending.length} Pending</span>
                                    <span className="text-green-600">{approved.length} Approved</span>
                                    <span className="text-red-500">{rejected.length} Rejected</span>
                                </div>
                            </div>

                            {volunteers.length === 0 ? (
                                <div className="flex items-center gap-2 text-gray-400 text-sm py-4">
                                    <Info size={16} /> No applications yet.
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {volunteers.map((v) => {
                                        const vLoading = actionLoading[v._id || v.user];
                                        return (
                                            <div key={v._id || v.user} className="border border-gray-200 p-4 hover:bg-gray-100 transition rounded-lg">
                                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                                    <div className="flex items-start gap-3 flex-1 min-w-0">
                                                        <div className="w-9 h-9 bg-[#3699FF] text-white flex items-center justify-center font-bold text-sm shrink-0 rounded-lg">
                                                            {v.user?.fullname?.charAt(0)?.toUpperCase() || "?"}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <div className="flex items-center gap-2 flex-wrap">
                                                                <p className="font-semibold text-gray-800 text-sm">{v.user?.fullname || "Unknown"}</p>
                                                                <span className={`inline-block px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide ${volunteerBadgeColors[v.status] || "bg-gray-100 text-gray-600"}`}>
                                                                    {v.status}
                                                                </span>
                                                            </div>
                                                            {v.user?.email && (
                                                                <p className="text-xs text-gray-400 mt-0.5">{v.user.email}</p>
                                                            )}
                                                            <div className="mt-3 space-y-1.5">
                                                                {v.preferredRole && (
                                                                    <p className="text-xs text-gray-600">
                                                                        <span className="font-semibold text-gray-500 uppercase tracking-wide">Role: </span>
                                                                        {v.preferredRole}
                                                                    </p>
                                                                )}
                                                                {v.availability && (
                                                                    <p className="text-xs text-gray-600">
                                                                        <span className="font-semibold text-gray-500 uppercase tracking-wide">Availability: </span>
                                                                        {v.availability}
                                                                    </p>
                                                                )}
                                                                {v.motivation && (
                                                                    <p className="text-xs text-gray-600">
                                                                        <span className="font-semibold text-gray-500 uppercase tracking-wide">Motivation: </span>
                                                                        {v.motivation}
                                                                    </p>
                                                                )}
                                                                {v.skills?.length > 0 && (
                                                                    <div className="flex flex-wrap gap-1.5 mt-2">
                                                                        {v.skills.map((s, i) => (
                                                                            <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[11px] font-medium">
                                                                                {s}
                                                                            </span>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {v.status === "pending" && (
                                                        <div className="flex sm:flex-col gap-2 shrink-0">
                                                            <button
                                                                onClick={() => handleVolunteerAction(v._id || v.user, "approve")}
                                                                disabled={!!vLoading}
                                                                className="flex items-center gap-1.5 px-4 py-2 bg-[#3699FF] text-white text-xs font-semibold rounded-lg hover:brightness-110 transition disabled:opacity-50"
                                                            >
                                                                <CheckCircle size={13} />
                                                                {vLoading === "approve" ? "..." : "Approve"}
                                                            </button>
                                                            <button
                                                                onClick={() => handleVolunteerAction(v._id || v.user, "reject")}
                                                                disabled={!!vLoading}
                                                                className="flex items-center gap-1.5 px-4 py-2 border border-red-500 text-red-600 text-xs font-semibold hover:bg-red-50 transition disabled:opacity-50"
                                                            >
                                                                <XCircle size={13} />
                                                                {vLoading === "reject" ? "..." : "Reject"}
                                                            </button>
                                                        </div>
                                                    )}
                                                    {v.status === "approved" && (
                                                        <div className="flex items-center gap-1.5 text-green-600 text-xs font-semibold shrink-0">
                                                            <BadgeCheck size={16} /> Approved
                                                        </div>
                                                    )}
                                                    {v.status === "rejected" && (
                                                        <div className="flex items-center gap-1.5 text-red-400 text-xs font-semibold shrink-0">
                                                            <AlertCircle size={16} /> Rejected
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {/* EVENT IMAGE + TITLE */}
                    <div className="bg-white border border-gray-200">
                        <div className="w-full h-56 overflow-hidden">
                            {event.image ? (
                                <img
                                    src={uploadFileUrl(event.image)}
                                    alt={event.title}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-slate-100 flex items-center justify-center text-[#4B5563] text-sm">
                                    No Image
                                </div>
                            )}
                        </div>
                        <div className="p-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                                <h2 className="text-2xl font-bold text-[#3699FF]">{event.title}</h2>
                                <span className={`inline-block px-3 py-1 text-xs font-semibold uppercase tracking-wide ${statusColors[event.status] || "bg-gray-100 text-gray-600"}`}>
                                    {event.status}
                                </span>
                            </div>
                            <p className="text-gray-500 text-sm">
                                Organizer: <span className="font-semibold text-gray-700">{event.organizer?.name || "N/A"}</span>
                            </p>
                        </div>
                    </div>

                    {/* CORE DETAILS */}
                    <div className="bg-white border border-gray-200 p-6">
                        <SectionTitle title="Event Information" />
                        <DetailRow label="Venue"        value={event.venue} />
                        <DetailRow label="Start Date"        value={event.startDateTime ? `${fmt(event.startDateTime)} at ${fmtTime(event.startDateTime)}` : null} />
                        <DetailRow label="End Date"          value={event.endDateTime   ? `${fmt(event.endDateTime)}   at ${fmtTime(event.endDateTime)}`   : null} />
                        <DetailRow label="Category"     value={event.category} />
                        
                    </div>

                    {/* DESCRIPTION */}
                    {event.description && (
                        <div className="bg-white border border-gray-200 p-6">
                            <SectionTitle title="Description" />
                            <div
                                className="prose prose-sm max-w-none text-gray-600 leading-relaxed"
                                dangerouslySetInnerHTML={{ __html: event.description }}
                            />
                        </div>
                    )}

                    {/* PEOPLE */}
                    {hasPeople && (
                        <div className="bg-white border border-gray-200 p-6">
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
                <div className="lg:col-span-4 space-y-6">

                    {/* QUICK STATS */}
                    <div className="bg-white border border-gray-200 p-6">
                        <SectionTitle title="Quick Stats" />
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { label: "Total",    value: volunteers.length },
                                { label: "Approved", value: approved.length   },
                                { label: "Pending",  value: pending.length    },
                                { label: "Rejected", value: rejected.length   },
                            ].map(({ label, value }) => (
                                <div key={label} className="bg-slate-100 border border-gray-200 p-4 text-center rounded-lg">
                                    <p className="text-2xl font-bold text-[#3699FF]">{value}</p>
                                    <p className="text-xs text-gray-500 font-medium mt-0.5">{label}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* VOLUNTEER SETTINGS */}
                    {event.isVolunteerOpen !== undefined && (
                        <div className="bg-white border border-gray-200 p-6">
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
                                <DetailRow label="Limit" value={`${approved.length} / ${event.volunteerLimit}`} />
                            )}
                            {event.volunteerDeadline && (
                                <DetailRow label="Deadline" value={fmt(event.volunteerDeadline)} />
                            )}
                        </div>
                    )}

                    {/* META */}
                    <div className="bg-white border border-gray-200 p-6">
                        <SectionTitle title="Meta" />
                        
                        <DetailRow label="Created"  value={event.createdAt ? new Date(event.createdAt).toLocaleString() : null} />
                        <DetailRow label="Updated"  value={event.updatedAt ? new Date(event.updatedAt).toLocaleString() : null} />
                    </div>
                </div>
            </div>

            {/* DELETE MODAL */}
            {showDeleteModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
                    <div className="bg-white p-6 w-80 border border-gray-200 shadow-lg rounded-xl">
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