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

/** Public event detail page tokens (aligned with societies / events lists) */
const ED = {
    dark: "#1e3a8a",
    darkMid: "#1d4ed8",
    gold: "#38bdf8",
    cream: "#e2e8f0",
    text: "#111827",
    muted: "#4B5563",
    border: "rgba(30, 64, 175, 0.16)",
    surface: "#ffffff",
    tint: "rgba(30, 64, 175, 0.06)",
};

/* ─── Person Card ─────────────────────────────────────────────────────────── */
function PersonCard({ person }) {
    return (
        <div
            className="flex items-start gap-3 rounded-md border bg-white p-3.5 transition-colors hover:border-[#1d4ed8]/25"
            style={{ borderColor: ED.border }}
        >
            <div
                className="flex h-10 w-10 shrink-0 select-none items-center justify-center rounded-md text-sm font-bold text-white"
                style={{ backgroundColor: ED.dark }}
            >
                {person.name?.charAt(0)?.toUpperCase() || "?"}
            </div>
            <div className="min-w-0">
                <p className="text-sm font-semibold leading-snug" style={{ color: ED.text }}>{person.name}</p>
                {person.designation && (
                    <p className="mt-0.5 text-[11px] font-semibold" style={{ color: ED.darkMid }}>{person.designation}</p>
                )}
                {person.bio && (
                    <p className="mt-1 text-xs leading-relaxed" style={{ color: ED.muted }}>{person.bio}</p>
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
            <div className="mb-3 flex items-center gap-2">
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${iconBg} ${iconColor}`}>
                    <Icon size={14} strokeWidth={2} />
                </div>
                <h3 className="text-[10px] font-bold uppercase tracking-wider" style={{ color: ED.muted }}>{label}</h3>
            </div>
            <div className="space-y-2">
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
            className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/45 px-4 pb-6 backdrop-blur-sm sm:items-center sm:pb-0"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="w-full max-w-sm overflow-hidden rounded-xl border bg-white shadow-xl" style={{ borderColor: ED.border }}>
                <div className="flex items-center justify-between border-b px-5 py-4" style={{ borderColor: ED.border }}>
                    <div className="min-w-0 pr-2">
                        <p className="text-base font-bold tracking-tight" style={{ color: ED.text }}>Share event</p>
                        <p className="mt-0.5 truncate text-xs font-medium" style={{ color: ED.muted }}>{title}</p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border bg-white transition hover:bg-slate-50"
                        style={{ borderColor: ED.border }}
                        aria-label="Close"
                    >
                        <X size={16} className="text-slate-600" />
                    </button>
                </div>
                <div className="grid grid-cols-3 gap-2 px-5 pt-5 pb-2">
                    {shareOptions.map((opt) => (
                        <button
                            key={opt.label}
                            type="button"
                            onClick={() => opt.href ? window.open(opt.href, "_blank") : opt.action()}
                            className={`flex flex-col items-center gap-2 rounded-md border border-transparent py-4 transition-colors ${opt.bg}`}
                        >
                            <opt.icon size={20} className={opt.color} strokeWidth={2} />
                            <span className="text-[10px] font-semibold text-slate-700">{opt.label}</span>
                        </button>
                    ))}
                </div>
                <div className="px-5 pb-5 pt-2">
                    <div className="flex items-center gap-2 rounded-md border px-3 py-2.5" style={{ borderColor: ED.border, backgroundColor: ED.tint }}>
                        <p className="min-w-0 flex-1 truncate select-all text-[11px] font-mono text-slate-600">{url}</p>
                        <button
                            type="button"
                            onClick={copyLink}
                            className="flex shrink-0 items-center gap-1 text-[11px] font-semibold uppercase tracking-wide hover:underline"
                            style={{ color: ED.darkMid }}
                        >
                            <Copy size={12} strokeWidth={2.5} /> Copy
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
            className="rounded-md border px-2.5 py-1.5 text-left text-[11px] font-semibold transition"
            style={
                selected
                    ? { backgroundColor: ED.dark, color: "#fff", borderColor: ED.dark }
                    : { backgroundColor: "#fff", color: ED.text, borderColor: ED.border }
            }
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
        if (Object.keys(e).length) {
            setErrors(e);
            const firstError = Object.values(e)[0];
            if (firstError) toast.error(firstError);
            return;
        }
        onSubmit(form);
    };

    const fieldClass = (err) =>
        `w-full resize-none rounded-md border bg-white px-3 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#1d4ed8] focus:ring-2 focus:ring-[rgba(29,78,216,0.12)] ${
            err ? "border-red-300" : "border-slate-200"
        }`;

    const roleOptions =
        Array.isArray(event?.volunteerRoles) && event.volunteerRoles.length > 0
            ? event.volunteerRoles
            : [
                "Registration & Check-in",
                "Stage & AV Support",
                "Guest Relations",
                "Photography / Videography",
                "Social Media Coverage",
                "Logistics & Setup",
                "Security & Crowd Management",
                "General Assistance",
              ];

    return (
        <div
            className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/45 px-4 pb-0 backdrop-blur-sm sm:items-center sm:pb-6"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-t-xl border bg-white shadow-xl sm:rounded-xl" style={{ borderColor: ED.border }}>
                {/* Header */}
                <div className="flex shrink-0 items-center justify-between border-b px-5 py-4" style={{ borderColor: ED.border }}>
                    <div className="min-w-0 pr-2">
                        <p className="text-lg font-bold tracking-tight" style={{ color: ED.text }}>Apply as volunteer</p>
                        <p className="mt-0.5 truncate text-xs font-medium" style={{ color: ED.muted }}>{event?.title}</p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border bg-white transition hover:bg-slate-50"
                        style={{ borderColor: ED.border }}
                        aria-label="Close"
                    >
                        <X size={16} className="text-slate-600" />
                    </button>
                </div>

                {/* Scrollable Body */}
                <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">

                    {/* Motivation */}
                    <div>
                        <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider" style={{ color: ED.muted }}>
                            Why do you want to volunteer? <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            rows={3}
                            value={form.motivation}
                            onChange={(e) => set("motivation", e.target.value)}
                            placeholder="Share what motivates you to be part of this event..."
                            className={fieldClass(errors.motivation)}
                        />
                        {errors.motivation && <p className="mt-1 text-xs font-medium text-red-600">{errors.motivation}</p>}
                    </div>

                    {/* Skills */}
                    <div>
                        <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider" style={{ color: ED.muted }}>
                            Your skills <span className="text-red-500">*</span>
                        </label>
                        <div className="flex flex-wrap gap-1.5">
                            {SKILL_OPTIONS.map((s) => (
                                <SkillTag
                                    key={s}
                                    label={s}
                                    selected={form.skills.includes(s)}
                                    onClick={() => toggleSkill(s)}
                                />
                            ))}
                        </div>
                        {errors.skills && <p className="mt-2 text-xs font-medium text-red-600">{errors.skills}</p>}
                    </div>

                    {/* Preferred Role */}
                    <div>
                        <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider" style={{ color: ED.muted }}>
                            Preferred role <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <select
                                value={form.preferredRole}
                                onChange={(e) => set("preferredRole", e.target.value)}
                                className={`${fieldClass(errors.preferredRole)} appearance-none pr-10 ${!form.preferredRole ? "text-slate-400" : "text-slate-800"}`}
                            >
                                <option value="" disabled>Select a role...</option>
                                {roleOptions.map((role) => (
                                    <option key={role} value={role}>{role}</option>
                                ))}
                            </select>
                            <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        </div>
                        {errors.preferredRole && <p className="mt-1 text-xs font-medium text-red-600">{errors.preferredRole}</p>}
                    </div>

                    {/* Availability */}
                    <div>
                        <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider" style={{ color: ED.muted }}>
                            Your availability <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            rows={2}
                            value={form.availability}
                            onChange={(e) => set("availability", e.target.value)}
                            placeholder="e.g. Full day, Morning only, Day before for setup..."
                            className={fieldClass(errors.availability)}
                        />
                        {errors.availability && <p className="mt-1 text-xs font-medium text-red-600">{errors.availability}</p>}
                    </div>

                    {/* Notice */}
                    <div className="flex items-start gap-2.5 rounded-md border px-3 py-3" style={{ borderColor: ED.border, backgroundColor: ED.tint }}>
                        <Info size={15} className="mt-0.5 shrink-0" style={{ color: ED.darkMid }} strokeWidth={2} />
                        <p className="text-xs font-medium leading-relaxed" style={{ color: ED.text }}>
                            Your application will be reviewed by the organizers. You must be a member of the society to volunteer.
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="grid shrink-0 grid-cols-2 gap-2 border-t px-5 py-4" style={{ borderColor: ED.border }}>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-md border bg-white py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                        style={{ borderColor: ED.border }}
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="rounded-md py-3 text-sm font-semibold text-white transition hover:brightness-105 active:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
                        style={{ backgroundColor: ED.dark }}
                    >
                        {isSubmitting ? "Submitting…" : "Submit application"}
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
        <div className="public-theme flex min-h-screen flex-col items-center justify-center" style={{ backgroundColor: ED.cream }}>
            <div
                className="mb-3 h-9 w-9 animate-spin rounded-full border-2 border-solid border-slate-200"
                style={{ borderTopColor: ED.dark }}
            />
            <p className="text-sm font-medium" style={{ color: ED.muted }}>Loading event…</p>
        </div>
    );

    if (!event) {
        return (
            <div className="public-theme py-24 text-center text-sm font-semibold" style={{ backgroundColor: ED.cream, color: ED.text }}>
                Event not found
            </div>
        );
    }

    const eventImageUrl =
        uploadFileUrl(event.image) ||
        "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80";

    const volState = volunteerApplyState(event, user);

    const metaRows = [
        {
            key: "host",
            icon: (
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-sm font-bold text-white" style={{ backgroundColor: ED.dark }}>
                    {event.organizer?.name?.charAt(0) || "U"}
                </div>
            ),
            label: "Hosted by",
            value: event.organizer?.name || "Society",
        },
        {
            key: "venue",
            icon: (
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-amber-50 text-amber-700">
                    <MapPin size={18} strokeWidth={2} />
                </div>
            ),
            label: "Venue",
            value: event.venue || "TBA",
        },
        {
            key: "time",
            icon: (
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-emerald-50 text-emerald-700">
                    <Clock size={18} strokeWidth={2} />
                </div>
            ),
            label: "Starts",
            value: formatTime(event.startDateTime),
        },
    ];

    return (
        <div className="public-theme min-h-screen" style={{ backgroundColor: ED.cream }}>
            <nav
                className="sticky top-0 z-40 border-b bg-white/95 px-4 py-2.5 backdrop-blur-md sm:px-6"
                style={{ borderColor: ED.border }}
            >
                <div className="mx-auto flex max-w-6xl items-center justify-between">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 rounded-md border bg-white px-3 py-2 text-xs font-semibold uppercase tracking-wide transition hover:bg-slate-50"
                        style={{ borderColor: ED.border, color: ED.dark }}
                    >
                        <ArrowLeft size={16} strokeWidth={2.25} /> <span>Back</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setIsShareModalOpen(true)}
                        className="flex h-10 w-10 items-center justify-center rounded-md text-white transition hover:brightness-110 active:brightness-95"
                        style={{ backgroundColor: ED.dark }}
                        aria-label="Share event"
                    >
                        <Share2 size={17} strokeWidth={2} />
                    </button>
                </div>
            </nav>

            <div className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-10">
                <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-10">
                    <div className="w-full lg:w-[46%] lg:max-w-xl lg:shrink-0">
                        <div
                            className="relative overflow-hidden rounded-md border bg-white shadow-sm"
                            style={{ borderColor: ED.border, boxShadow: "0 1px 2px rgba(15, 23, 42, 0.05)" }}
                        >
                            <div className="aspect-[4/3]">
                                <img src={eventImageUrl} className="h-full w-full object-cover" alt={event.title} />
                            </div>
                            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0f172a]/45 via-transparent to-transparent" />
                        </div>
                    </div>

                    <div className="min-w-0 flex-1 lg:pt-0">
                        <div className="mb-3 inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide" style={{ backgroundColor: ED.gold, color: ED.dark }}>
                            <Calendar size={11} strokeWidth={2.5} /> {event.category || "Event"}
                        </div>
                        <h1 className="mb-6 text-2xl font-bold leading-tight tracking-tight sm:text-3xl lg:text-[2rem]" style={{ color: ED.text }}>
                            {event.title}
                        </h1>
                        <div
                            className="divide-y overflow-hidden rounded-md border bg-white"
                            style={{ borderColor: ED.border, boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04)" }}
                        >
                            {metaRows.map((row) => (
                                <div key={row.key} className="flex items-center gap-3 px-3.5 py-3 sm:px-4 sm:py-3.5">
                                    {row.icon}
                                    <div className="min-w-0 flex-1">
                                        <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: ED.muted }}>{row.label}</p>
                                        <p className="truncate text-sm font-semibold sm:text-[15px]" style={{ color: ED.text }}>{row.value}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <main className="mx-auto max-w-6xl px-4 pb-16 md:px-6 md:pb-20">
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
                    <div className="space-y-6 lg:col-span-7">
                        <section
                            className="rounded-md border bg-white p-5 sm:p-6"
                            style={{ borderColor: ED.border, boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04)" }}
                        >
                            <h2 className="mb-4 text-[10px] font-bold uppercase tracking-wider" style={{ color: ED.darkMid }}>About this event</h2>
                            <div
                                className="prose prose-slate max-w-none text-sm leading-relaxed prose-p:text-[15px] prose-p:leading-relaxed prose-headings:tracking-tight sm:prose-base [&>p]:mb-3 [&>ul]:list-disc [&>ul]:pl-5 [&>ol]:list-decimal [&>ol]:pl-5"
                                style={{ color: ED.muted }}
                                dangerouslySetInnerHTML={{ __html: event.description || "No description provided." }}
                            />
                        </section>

                        {hasPeople && (
                            <section
                                className="rounded-md border bg-white p-5 sm:p-6"
                                style={{ borderColor: ED.border, boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04)" }}
                            >
                                <h2 className="mb-6 text-[10px] font-bold uppercase tracking-wider" style={{ color: ED.darkMid }}>People</h2>
                                <div className="space-y-8">
                                    <PeopleGroup label="Chief Guests" icon={Star} iconBg="bg-amber-50" iconColor="text-amber-600" people={event.chiefGuests} />
                                    <PeopleGroup label="Speakers" icon={Mic} iconBg="bg-emerald-50" iconColor="text-emerald-700" people={event.speakers} />
                                    <PeopleGroup label="Hosts" icon={Users} iconBg="bg-slate-100" iconColor="text-slate-700" people={event.hosts} />
                                </div>
                            </section>
                        )}
                    </div>

                    <div className="lg:col-span-5">
                        <div
                            className="lg:sticky lg:top-20 rounded-md border bg-white p-5 sm:p-6"
                            style={{ borderColor: ED.border, boxShadow: "0 1px 2px rgba(15, 23, 42, 0.06)" }}
                        >
                            <div className="space-y-5">
                                <div>
                                    <label className="mb-2 block text-[10px] font-bold uppercase tracking-wider" style={{ color: ED.muted }}>Schedule</label>
                                    <div className="rounded-md border px-4 py-3" style={{ borderColor: ED.border, backgroundColor: ED.tint }}>
                                        <p className="text-base font-bold leading-snug sm:text-lg" style={{ color: ED.text }}>{formatDate(event.startDateTime)}</p>
                                        <p className="mt-1 text-sm font-semibold" style={{ color: ED.dark }}>{formatTime(event.startDateTime)} onwards</p>
                                    </div>
                                </div>

                                {event.isVolunteerOpen ? (
                                    <div className="space-y-3">
                                        <div className="rounded-md border border-emerald-200/80 bg-emerald-50/90 px-3.5 py-3">
                                            <div className="flex items-start gap-2.5">
                                                <Info size={16} className="mt-0.5 shrink-0 text-emerald-700" strokeWidth={2} />
                                                <p className="text-xs font-medium leading-snug text-emerald-950 sm:text-sm">
                                                    Volunteer with this society&apos;s event. You must be a society member; managers approve roles.
                                                </p>
                                            </div>
                                            {event.volunteerDeadline && (
                                                <div className="mt-3 border-t border-emerald-200/70 pt-3">
                                                    <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">Apply before</p>
                                                    <p className="mt-0.5 text-sm font-semibold text-emerald-950">{formatDate(event.volunteerDeadline)}</p>
                                                </div>
                                            )}
                                        </div>
                                        <button
                                            type="button"
                                            disabled={volState.disabled}
                                            title={volState.hint || undefined}
                                            onClick={() => !volState.disabled && setIsVolunteerModalOpen(true)}
                                            className="w-full rounded-sm border border-transparent py-2.5 text-sm font-semibold tracking-wide transition disabled:cursor-not-allowed disabled:opacity-55 hover:brightness-105 active:brightness-95"
                                            style={{
                                                backgroundColor: volState.disabled ? "#94a3b8" : ED.dark,
                                                color: "#fff",
                                            }}
                                        >
                                            {volState.label}
                                        </button>
                                        {volState.disabled && volState.hint && (
                                            <p className="text-center text-xs font-medium" style={{ color: ED.muted }}>{volState.hint}</p>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center gap-2 py-2 text-[10px] font-bold uppercase tracking-wider" style={{ color: ED.muted }}>
                                        <ExternalLink size={14} strokeWidth={2} /> Volunteering closed
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