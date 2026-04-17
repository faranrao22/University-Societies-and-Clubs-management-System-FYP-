import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import API_BASE_URL, { uploadFileUrl } from "../../../config/api.config";
import { useAuth } from "../../../context/AuthContext";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
    MapPin, Calendar, ArrowLeft, Clock, Info, ExternalLink,
    Share2, X, Instagram, Facebook, MessageCircle, Copy,
    Mic, Star, Users, ChevronDown,
} from "lucide-react";

/* ─── Person Card ─────────────────────────────────────────────────────────── */
function PersonCard({ person }) {
    return (
        <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="w-11 h-11 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-lg shrink-0 select-none">
                {person.name?.charAt(0)?.toUpperCase() || "?"}
            </div>
            <div className="min-w-0">
                <p className="font-bold text-slate-900 leading-tight">{person.name}</p>
                {person.designation && (
                    <p className="text-xs text-blue-600 font-semibold mt-0.5">{person.designation}</p>
                )}
                {person.bio && (
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{person.bio}</p>
                )}
            </div>
        </div>
    );
}

/* ─── People Group ────────────────────────────────────────────────────────── */
function PeopleGroup({ label, icon: Icon, iconBg, iconColor, people }) {
    if (!people || people.length === 0) return null;
    return (
        <div>
            <div className="flex items-center gap-2 mb-4">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${iconBg} ${iconColor}`}>
                    <Icon size={15} />
                </div>
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</h3>
            </div>
            <div className="space-y-3">
                {people.map((p, i) => <PersonCard key={i} person={p} />)}
            </div>
        </div>
    );
}

/* ─── Share Modal ─────────────────────────────────────────────────────────── */
function ShareModal({ event, onClose }) {
    const url = window.location.href;
    const title = event?.title || "Check out this event";
    const text = `${title} — ${url}`;

    const copyLink = () => {
        navigator.clipboard.writeText(url)
            .then(() => toast.success("Link copied to clipboard!"))
            .catch(() => {
                const el = document.createElement("textarea");
                el.value = url;
                document.body.appendChild(el);
                el.select();
                document.execCommand("copy");
                document.body.removeChild(el);
                toast.success("Link copied!");
            });
    };

    const shareOptions = [
        {
            label: "WhatsApp",
            icon: MessageCircle,
            bg: "bg-green-50 hover:bg-green-100",
            color: "text-green-600",
            href: `https://wa.me/?text=${encodeURIComponent(text)}`,
        },
        {
            label: "Facebook",
            icon: Facebook,
            bg: "bg-blue-50 hover:bg-blue-100",
            color: "text-blue-600",
            href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
        },
        {
            label: "Instagram",
            icon: Instagram,
            bg: "bg-pink-50 hover:bg-pink-100",
            color: "text-pink-500",
            action: () => {
                copyLink();
                toast("Link copied — paste it in your Instagram story!", { icon: "📸" });
            },
        },
    ];

    return (
        <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/50 backdrop-blur-sm px-4 pb-6 sm:pb-0"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between px-7 pt-7 pb-5 border-b border-slate-100">
                    <div>
                        <p className="font-black text-slate-900 text-lg">Share Event</p>
                        <p className="text-xs text-slate-400 mt-0.5 truncate max-w-[230px]">{title}</p>
                    </div>
                    <button onClick={onClose} className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors">
                        <X size={16} className="text-slate-600" />
                    </button>
                </div>
                <div className="px-7 pt-6 pb-3 grid grid-cols-3 gap-3">
                    {shareOptions.map((opt) => (
                        <button
                            key={opt.label}
                            onClick={() => opt.href ? window.open(opt.href, "_blank") : opt.action()}
                            className={`flex flex-col items-center gap-2.5 py-5 rounded-2xl transition-colors ${opt.bg}`}
                        >
                            <opt.icon size={22} className={opt.color} />
                            <span className="text-[11px] font-bold text-slate-700">{opt.label}</span>
                        </button>
                    ))}
                </div>
                <div className="px-7 pt-2 pb-7">
                    <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3">
                        <p className="text-xs text-slate-400 truncate flex-1 select-all">{url}</p>
                        <button onClick={copyLink} className="shrink-0 flex items-center gap-1.5 text-xs font-black text-blue-600 hover:text-blue-800 uppercase tracking-wide">
                            <Copy size={13} /> Copy
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ─── Skill Tag ───────────────────────────────────────────────────────────── */
const SKILL_OPTIONS = [
    "Event Management", "Photography", "Videography", "Social Media",
    "Technical Support", "Registration Desk", "Hospitality", "Security",
    "Logistics", "Public Relations", "Graphic Design", "MC / Hosting",
];

function SkillTag({ label, selected, onClick }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                selected
                    ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                    : "bg-slate-50 text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-600"
            }`}
        >
            {label}
        </button>
    );
}

/* ─── Volunteer Modal ─────────────────────────────────────────────────────── */
function VolunteerModal({ event, onClose, isSubmitting, onSubmit }) {
    const [form, setForm] = useState({
        motivation: "",
        skills: [],
        preferredRole: "",
        availability: "",
    });
    const [errors, setErrors] = useState({});

    const set = (key, val) => {
        setForm((f) => ({ ...f, [key]: val }));
        setErrors((e) => ({ ...e, [key]: undefined }));
    };

    const toggleSkill = (skill) => {
        setForm((f) => ({
            ...f,
            skills: f.skills.includes(skill)
                ? f.skills.filter((s) => s !== skill)
                : [...f.skills, skill],
        }));
    };

    const validate = () => {
        const e = {};
        if (!form.motivation.trim()) e.motivation = "Please share your motivation.";
        if (form.skills.length === 0) e.skills = "Select at least one skill.";
        if (!form.preferredRole.trim()) e.preferredRole = "Please specify a preferred role.";
        if (!form.availability.trim()) e.availability = "Please describe your availability.";
        return e;
    };

    const handleSubmit = () => {
        const e = validate();
        if (Object.keys(e).length) { setErrors(e); return; }
        onSubmit(form);
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/50 backdrop-blur-sm px-4 pb-0 sm:pb-6"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="bg-white w-full max-w-lg rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-7 pt-7 pb-5 border-b border-slate-100 shrink-0">
                    <div>
                        <p className="font-black text-slate-900 text-xl">Apply as Volunteer</p>
                        <p className="text-xs text-slate-400 mt-0.5 truncate max-w-[260px]">{event?.title}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
                    >
                        <X size={16} className="text-slate-600" />
                    </button>
                </div>

                {/* Scrollable Body */}
                <div className="overflow-y-auto px-7 py-6 space-y-6 flex-1">

                    {/* Motivation */}
                    <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
                            Why do you want to volunteer? <span className="text-red-400">*</span>
                        </label>
                        <textarea
                            rows={3}
                            value={form.motivation}
                            onChange={(e) => set("motivation", e.target.value)}
                            placeholder="Share what motivates you to be part of this event..."
                            className={`w-full resize-none px-4 py-3 rounded-2xl border text-sm text-slate-800 placeholder-slate-300 bg-slate-50 outline-none transition-all focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 ${
                                errors.motivation ? "border-red-300" : "border-slate-200"
                            }`}
                        />
                        {errors.motivation && <p className="text-xs text-red-500 mt-1 font-medium">{errors.motivation}</p>}
                    </div>

                    {/* Skills */}
                    <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
                            Your Skills <span className="text-red-400">*</span>
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {SKILL_OPTIONS.map((s) => (
                                <SkillTag
                                    key={s}
                                    label={s}
                                    selected={form.skills.includes(s)}
                                    onClick={() => toggleSkill(s)}
                                />
                            ))}
                        </div>
                        {errors.skills && <p className="text-xs text-red-500 mt-2 font-medium">{errors.skills}</p>}
                    </div>

                    {/* Preferred Role */}
                    <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
                            Preferred Role <span className="text-red-400">*</span>
                        </label>
                        <div className="relative">
                            <select
                                value={form.preferredRole}
                                onChange={(e) => set("preferredRole", e.target.value)}
                                className={`w-full appearance-none px-4 py-3 rounded-2xl border text-sm text-slate-800 bg-slate-50 outline-none transition-all focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 ${
                                    errors.preferredRole ? "border-red-300" : "border-slate-200"
                                } ${!form.preferredRole ? "text-slate-400" : ""}`}
                            >
                                <option value="" disabled>Select a role...</option>
                                <option>Registration & Check-in</option>
                                <option>Stage & AV Support</option>
                                <option>Guest Relations</option>
                                <option>Photography / Videography</option>
                                <option>Social Media Coverage</option>
                                <option>Logistics & Setup</option>
                                <option>Security & Crowd Management</option>
                                <option>General Assistance</option>
                            </select>
                            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        </div>
                        {errors.preferredRole && <p className="text-xs text-red-500 mt-1 font-medium">{errors.preferredRole}</p>}
                    </div>

                    {/* Availability */}
                    <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
                            Your Availability <span className="text-red-400">*</span>
                        </label>
                        <textarea
                            rows={2}
                            value={form.availability}
                            onChange={(e) => set("availability", e.target.value)}
                            placeholder="e.g. Full day, Morning only, Day before for setup..."
                            className={`w-full resize-none px-4 py-3 rounded-2xl border text-sm text-slate-800 placeholder-slate-300 bg-slate-50 outline-none transition-all focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 ${
                                errors.availability ? "border-red-300" : "border-slate-200"
                            }`}
                        />
                        {errors.availability && <p className="text-xs text-red-500 mt-1 font-medium">{errors.availability}</p>}
                    </div>

                    {/* Notice */}
                    <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-2xl border border-blue-100">
                        <Info size={16} className="text-blue-500 shrink-0 mt-0.5" />
                        <p className="text-xs text-blue-700 leading-relaxed font-medium">
                            Your application will be reviewed by the organizers. You must be a member of the society to volunteer.
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-7 pb-7 pt-4 border-t border-slate-100 shrink-0 grid grid-cols-2 gap-3">
                    <button
                        onClick={onClose}
                        className="py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full font-black transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="py-4 bg-blue-600 hover:bg-slate-900 text-white rounded-full font-black shadow-lg shadow-blue-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? "Submitting..." : "Submit Application"}
                    </button>
                </div>
            </div>
        </div>
    );
}

function volunteerApplyState(event, user) {
    if (!event?.isVolunteerOpen) {
        return { disabled: true, label: "Volunteering not open", hint: "The organizer has not opened applications." };
    }
    const vols = event.volunteers || [];
    const uid = user?._id ? String(user._id) : null;
    const mine = uid && vols.find((v) => String(v.user?._id || v.user) === uid);
    if (mine) {
        if (mine.status === "approved") {
            return { disabled: true, label: "You are a volunteer", hint: "You have been approved for this event." };
        }
        if (mine.status === "pending") {
            return { disabled: true, label: "Application submitted", hint: "The organizer is reviewing your request." };
        }
        return { disabled: true, label: "Application not available", hint: "You already have a record for this event." };
    }
    const approvedCount = vols.filter((v) => v.status === "approved").length;
    const limit = Number(event.volunteerLimit) || 0;
    if (limit > 0 && approvedCount >= limit) {
        return { disabled: true, label: "Volunteer limit reached", hint: "All approved volunteer slots are filled." };
    }
    if (event.volunteerDeadline && new Date() > new Date(event.volunteerDeadline)) {
        return { disabled: true, label: "Deadline passed", hint: "The application window has closed." };
    }
    if (event.endDateTime && new Date() > new Date(event.endDateTime)) {
        return { disabled: true, label: "Event ended", hint: "This event is in the past." };
    }
    if (!uid) {
        return { disabled: true, label: "Log in to volunteer", hint: "Sign in with your student account to apply." };
    }
    return { disabled: false, label: "Join as volunteer", hint: "" };
}

/* ─── Main Component ──────────────────────────────────────────────────────── */
function EventDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [isVolunteerModalOpen, setIsVolunteerModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const loadEvent = useCallback(async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API_BASE_URL}/event/Eventbyid/${id}`);
            setEvent(res.data.data);
        } catch {
            toast.error("Failed to load event details");
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        loadEvent();
    }, [loadEvent]);

    const handleApplyVolunteer = async (formData) => {
        try {
            setIsSubmitting(true);
            await axios.post(
                `${API_BASE_URL}/event/VolunteerApplication/${id}`,
                {
                    motivation: formData.motivation,
                    skills: formData.skills,
                    preferredRole: formData.preferredRole,
                    availability: formData.availability,
                },
                { withCredentials: true }
            );
            toast.success("Application submitted successfully!");
            setIsVolunteerModalOpen(false);
            await loadEvent();
        } catch (err) {
            toast.error(err.response?.data?.message || "Error applying");
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatDate = (d) =>
        new Date(d).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
    const formatTime = (d) =>
        new Date(d).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

    const hasPeople = Boolean(
        (event?.chiefGuests?.length > 0) ||
        (event?.speakers?.length > 0) ||
        (event?.hosts?.length > 0)
    );

    if (loading) return (
        <div className="flex min-h-screen flex-col items-center justify-center public-theme" style={{ backgroundColor: "#e2e8f0" }}>
            <div className="mb-4 h-10 w-10 animate-spin rounded-full border-4 border-[#1e3a8a] border-t-transparent" />
            <p className="text-sm font-medium text-gray-500">Loading event…</p>
        </div>
    );

    if (!event) return <div className="text-center mt-20 font-bold text-slate-800">Event not found</div>;

    const eventImageUrl =
        uploadFileUrl(event.image) ||
        "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80";

    const volState = volunteerApplyState(event, user);

    return (
        <div className="public-theme min-h-screen" style={{ backgroundColor: "#e2e8f0" }}>
            <nav className="sticky top-0 z-40 border-b border-[rgba(30,64,175,0.14)] bg-white/90 px-4 py-3 backdrop-blur-md sm:px-6">
                <div className="mx-auto flex max-w-6xl items-center justify-between">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#1e3a8a] transition hover:opacity-80"
                    >
                        <ArrowLeft size={18} /> <span>Back</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setIsShareModalOpen(true)}
                        className="rounded-full bg-[#1e3a8a] p-2.5 text-white shadow-md transition hover:brightness-110 active:scale-95"
                    >
                        <Share2 size={18} />
                    </button>
                </div>
            </nav>

            <div className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-14">
                <div className="flex flex-col items-start gap-10 lg:flex-row lg:gap-14">
                    <div className="relative w-full lg:w-1/2">
                        <div
                            className="pointer-events-none absolute -inset-2 rounded-[2rem] opacity-30 blur-2xl"
                            style={{ background: "linear-gradient(135deg, #38bdf855, #1e3a8a44)" }}
                        />
                        <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border-4 border-white shadow-xl">
                            <img src={eventImageUrl} className="h-full w-full object-cover" alt={event.title} />
                        </div>
                    </div>

                    <div className="w-full lg:w-1/2 lg:pt-2">
                        <div
                            className="mb-5 inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white"
                            style={{ backgroundColor: "#1d4ed8" }}
                        >
                            <Calendar size={12} /> {event.category || "Event"}
                        </div>
                        <h1 className="mb-8 text-3xl font-black leading-[1.12] tracking-tight text-gray-900 md:text-4xl lg:text-5xl">
                            {event.title}
                        </h1>
                        <div className="space-y-4">
                            <div className="flex items-center gap-4 rounded-2xl border border-[rgba(30,64,175,0.14)] bg-white/80 p-4">
                                <div
                                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-lg font-black text-white"
                                    style={{ backgroundColor: "#1e3a8a" }}
                                >
                                    {event.organizer?.name?.charAt(0) || "U"}
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Hosted by</p>
                                    <p className="text-lg font-bold text-gray-900">{event.organizer?.name || "Society"}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 rounded-2xl border border-[rgba(30,64,175,0.14)] bg-white/80 p-4">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
                                    <MapPin size={22} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Venue</p>
                                    <p className="text-lg font-bold text-gray-900">{event.venue || "TBA"}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 rounded-2xl border border-[rgba(30,64,175,0.14)] bg-white/80 p-4">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                                    <Clock size={22} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Starts</p>
                                    <p className="text-lg font-bold text-gray-900">{formatTime(event.startDateTime)}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <main className="mx-auto max-w-6xl px-4 pb-20 md:px-6">
                <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
                    <div className="space-y-8 lg:col-span-7">
                        <div className="rounded-3xl border border-[rgba(30,64,175,0.14)] bg-white p-8 shadow-sm md:p-10">
                            <h2 className="mb-6 text-xs font-black uppercase tracking-[0.2em] text-[#1d4ed8]">About this event</h2>
                            <div
                                className="prose prose-slate prose-lg max-w-none leading-relaxed text-gray-600 [&>p]:mb-4 [&>ul]:list-disc [&>ul]:pl-5 [&>ol]:list-decimal [&>ol]:pl-5"
                                dangerouslySetInnerHTML={{ __html: event.description || "No description provided." }}
                            />
                        </div>

                        {hasPeople && (
                            <div className="rounded-3xl border border-[rgba(30,64,175,0.14)] bg-white p-8 shadow-sm md:p-10">
                                <h2 className="mb-8 text-xs font-black uppercase tracking-[0.2em] text-[#1d4ed8]">People</h2>
                                <div className="space-y-10">
                                    <PeopleGroup label="Chief Guests" icon={Star} iconBg="bg-amber-50" iconColor="text-amber-600" people={event.chiefGuests} />
                                    <PeopleGroup label="Speakers" icon={Mic} iconBg="bg-emerald-50" iconColor="text-emerald-700" people={event.speakers} />
                                    <PeopleGroup label="Hosts" icon={Users} iconBg="bg-slate-100" iconColor="text-slate-700" people={event.hosts} />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="lg:col-span-5">
                        <div className="sticky top-24 rounded-3xl border border-[rgba(30,64,175,0.14)] bg-white p-8 shadow-lg">
                            <div className="space-y-6">
                                <div>
                                    <label className="mb-3 block text-[10px] font-black uppercase tracking-widest text-gray-400">Schedule</label>
                                    <div className="rounded-2xl border border-[rgba(30,64,175,0.12)] bg-[#eff6ff] p-5">
                                        <p className="text-xl font-black text-gray-900">{formatDate(event.startDateTime)}</p>
                                        <p className="mt-1 font-bold text-[#1e3a8a]">{formatTime(event.startDateTime)} onwards</p>
                                    </div>
                                </div>

                                {event.isVolunteerOpen ? (
                                    <div className="space-y-4">
                                        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/80 p-4">
                                            <div className="flex items-start gap-3">
                                                <Info size={18} className="mt-0.5 shrink-0 text-emerald-700" />
                                                <p className="text-sm font-medium leading-snug text-emerald-900">
                                                    Volunteer with this society&apos;s event. You must be a society member; managers approve roles.
                                                </p>
                                            </div>
                                            {event.volunteerDeadline && (
                                                <div className="mt-3 border-t border-emerald-100/80 pt-3">
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-emerald-700">Apply before</p>
                                                    <p className="text-sm font-bold text-emerald-950">{formatDate(event.volunteerDeadline)}</p>
                                                </div>
                                            )}
                                        </div>
                                        <button
                                            type="button"
                                            disabled={volState.disabled}
                                            title={volState.hint || undefined}
                                            onClick={() => !volState.disabled && setIsVolunteerModalOpen(true)}
                                            className="w-full rounded-2xl py-4 text-base font-black text-white shadow-lg transition disabled:cursor-not-allowed disabled:opacity-55 hover:brightness-105 active:scale-[0.99]"
                                            style={{
                                                backgroundColor: volState.disabled ? "#94a3b8" : "#1e3a8a",
                                                boxShadow: volState.disabled ? "none" : "0 12px 30px rgba(30,64,175,0.25)",
                                            }}
                                        >
                                            {volState.label}
                                        </button>
                                        {volState.disabled && volState.hint && (
                                            <p className="text-center text-xs text-gray-500">{volState.hint}</p>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center gap-2 pt-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                                        <ExternalLink size={14} /> Volunteering closed
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {isShareModalOpen && <ShareModal event={event} onClose={() => setIsShareModalOpen(false)} />}

            {isVolunteerModalOpen && (
                <VolunteerModal
                    event={event}
                    isSubmitting={isSubmitting}
                    onClose={() => setIsVolunteerModalOpen(false)}
                    onSubmit={handleApplyVolunteer}
                />
            )}
        </div>
    );
}

export default EventDetails;