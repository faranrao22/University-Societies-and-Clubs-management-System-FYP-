import React, { useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Users,
  MapPin,
  Mail,
  Phone,
  Shield,
  Loader2,
  UserCircle,
  Calendar,
  Newspaper,
  ChevronRight,
} from "lucide-react";
import API_BASE_URL, { uploadFileUrl } from "../../../config/api.config";
import SocietyPostCard from "./SocietyPostCard";

const COLORS = {
  dark: "#1e3a8a",
  lightGreen: "#1d4ed8",
  gold: "#38bdf8",
  cream: "#e2e8f0",
  text: "#111827",
  muted: "#4B5563",
  border: "rgba(30, 64, 175, 0.16)",
};

const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1200";

function fmtWhen(d) {
  if (!d) return "";
  const x = new Date(d);
  return x.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function fmtRange(start, end) {
  const a = start ? new Date(start) : null;
  const b = end ? new Date(end) : null;
  if (!a) return "";
  if (!b || a.getTime() === b.getTime()) return fmtWhen(start);
  return `${fmtWhen(start)} → ${b.toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}`;
}

function stripHtmlSnippet(html, max = 140) {
  const t = (html || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max)}…`;
}

export default function SocietyView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    data: society,
    isPending: societyLoading,
    isError: societyError,
  } = useQuery({
    queryKey: ["public", "society", id],
    queryFn: async () => {
      const res = await axios.get(`${API_BASE_URL}/societies/${id}`, { withCredentials: true });
      return res.data?.success && res.data?.data ? res.data.data : null;
    },
    enabled: Boolean(id),
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    retry: 1,
  });

  const { data: posts = [], isPending: postsLoading } = useQuery({
    queryKey: ["public", "society", id, "posts"],
    queryFn: async () => {
      const pRes = await axios.get(`${API_BASE_URL}/societies/posts/society/${id}`, { withCredentials: true });
      return pRes.data.data || [];
    },
    enabled: Boolean(id),
    staleTime: 3 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const { data: events = [], isPending: eventsLoading } = useQuery({
    queryKey: ["public", "society", id, "events"],
    queryFn: async () => {
      const eRes = await axios.get(`${API_BASE_URL}/event/allevents`, {
        params: { society: id, limit: 80 },
        withCredentials: true,
      });
      return eRes.data.data || [];
    },
    enabled: Boolean(id),
    staleTime: 3 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
  const loading = societyLoading;
  const extrasLoading = postsLoading || eventsLoading;

  const presidentName =
    society?.roles?.find((r) => r.name === "President")?.user?.fullname ||
    society?.president ||
    "—";

  const { upcomingEvents, pastEvents } = useMemo(() => {
    const now = new Date();
    const list = Array.isArray(events) ? events : [];
    const upcoming = [];
    const past = [];
    for (const ev of list) {
      const end = ev.endDateTime ? new Date(ev.endDateTime) : null;
      if (end && end < now) past.push(ev);
      else upcoming.push(ev);
    }
    upcoming.sort((a, b) => new Date(a.startDateTime) - new Date(b.startDateTime));
    past.sort((a, b) => new Date(b.startDateTime) - new Date(a.startDateTime));
    return { upcomingEvents: upcoming, pastEvents: past };
  }, [events]);

  if (loading) {
    return (
      <div
        className="flex min-h-screen flex-col items-center justify-center gap-3"
        style={{ backgroundColor: COLORS.cream }}
      >
        <Loader2 className="animate-spin" size={40} style={{ color: COLORS.gold }} />
        <p className="text-sm font-medium" style={{ color: COLORS.muted }}>
          Loading society…
        </p>
      </div>
    );
  }

  if (!society || societyError) {
    return (
      <div
        className="flex min-h-screen flex-col items-center justify-center px-6"
        style={{ backgroundColor: COLORS.cream }}
      >
        <p className="mb-4 text-lg font-semibold" style={{ color: COLORS.text }}>
          We could not load this society.
        </p>
        <Link
          to="/community"
          className="inline-flex items-center gap-2 rounded-md border bg-white px-5 py-2.5 text-sm font-semibold transition hover:bg-slate-50"
          style={{ borderColor: COLORS.border, color: COLORS.dark }}
        >
          <ArrowLeft size={16} /> Back to societies
        </Link>
      </div>
    );
  }

  const cardShadow = "0 1px 2px rgba(15, 23, 42, 0.04)";
  const societyImageRaw =
    typeof society.image === "string" ? society.image.trim() : society.image?.url || society.image?.path || "";
  const heroImageUrl = uploadFileUrl(societyImageRaw) || FALLBACK_IMG;

  return (
    <div className="min-h-screen pb-20 md:pb-16" style={{ backgroundColor: COLORS.cream }}>
      <header
        className="sticky top-0 z-30 border-b bg-white/95 backdrop-blur-md"
        style={{ borderColor: COLORS.border }}
      >
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-2.5 sm:px-6">
          <button
            type="button"
            onClick={() => navigate("/community")}
            className="flex shrink-0 items-center gap-2 rounded-md border bg-white px-3 py-2 text-xs font-semibold uppercase tracking-wide transition hover:bg-slate-50"
            style={{ borderColor: COLORS.border, color: COLORS.dark }}
          >
            <ArrowLeft size={16} strokeWidth={2.25} />
            Societies
          </button>
          <h1 className="min-w-0 flex-1 truncate text-left text-sm font-bold tracking-tight sm:text-base" style={{ color: COLORS.text }}>
            {society.name}
          </h1>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-stretch lg:gap-8">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full lg:w-[44%] lg:max-w-xl lg:shrink-0"
          >
            <div
              className="relative overflow-hidden rounded-md border bg-white"
              style={{ borderColor: COLORS.border, boxShadow: cardShadow }}
            >
              <div className="aspect-[4/3] bg-slate-100">
                <img
                  src={heroImageUrl}
                  alt={society.name}
                  className="h-full w-full object-cover"
                  loading="eager"
                  decoding="async"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = FALLBACK_IMG;
                  }}
                />
              </div>
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0f172a]/50 via-transparent to-transparent" />
              <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
                <span
                  className="rounded px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide"
                  style={{ backgroundColor: COLORS.gold, color: COLORS.dark }}
                >
                  {society.joinPolicy || "Open"}
                </span>
                {society.status ? (
                  <span
                    className="rounded border bg-white/95 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide backdrop-blur-sm"
                    style={{ borderColor: COLORS.border, color: COLORS.muted }}
                  >
                    {society.status}
                  </span>
                ) : null}
              </div>
            </div>
          </motion.div>

          <div className="flex min-w-0 flex-1 flex-col justify-center">
            <h2 className="mt-1 hidden text-2xl font-bold leading-tight tracking-tight lg:block xl:text-3xl" style={{ color: COLORS.text }}>
              {society.name}
            </h2>
            <p className="text-[10px] font-bold uppercase tracking-wider lg:hidden" style={{ color: COLORS.muted }}>
              Overview
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-2 lg:mt-3">
              {society.department ? (
                <span
                  className="inline-flex items-center gap-1 rounded-md border bg-white px-2.5 py-1 text-[11px] font-semibold"
                  style={{ borderColor: COLORS.border, color: COLORS.muted }}
                >
                  <MapPin size={13} strokeWidth={2} className="shrink-0" style={{ color: COLORS.gold }} />
                  {society.department}
                </span>
              ) : null}
              <span className="text-[11px] font-semibold" style={{ color: COLORS.muted }}>
                {society.members?.length ?? 0} members
              </span>
            </div>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed sm:text-[15px] lg:mt-4" style={{ color: COLORS.muted }}>
              {stripHtmlSnippet(society.description, 220) ||
                "Connect with members, join events, and grow skills alongside peers who share your interests."}
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-8">
            <motion.section
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="rounded-md border bg-white p-5 sm:p-6"
              style={{ borderColor: COLORS.border, boxShadow: cardShadow }}
            >
              <h2 className="text-[10px] font-bold uppercase tracking-wider" style={{ color: COLORS.lightGreen }}>
                About
              </h2>
              <p className="mt-3 text-sm leading-relaxed sm:text-[15px]" style={{ color: COLORS.muted }}>
                {society.description ||
                  "This society welcomes students who want to connect, learn, and take part in campus life."}
              </p>
            </motion.section>

            <section>
              <div className="mb-3 flex items-center justify-between gap-3">
                <h2 className="flex items-center gap-2 text-base font-bold tracking-tight" style={{ color: COLORS.text }}>
                  <Newspaper size={18} strokeWidth={2} style={{ color: COLORS.dark }} />
                  Updates &amp; posts
                </h2>
                <Link
                  to="/society-posts"
                  className="text-[10px] font-bold uppercase tracking-wider hover:underline"
                  style={{ color: COLORS.dark }}
                >
                  All news
                </Link>
              </div>
              {extrasLoading ? (
                <p className="text-sm font-medium" style={{ color: COLORS.muted }}>Loading posts…</p>
              ) : posts.length === 0 ? (
                <div
                  className="rounded-md border border-dashed p-8 text-center text-sm"
                  style={{ borderColor: COLORS.border, color: COLORS.muted, backgroundColor: "rgba(255,255,255,0.85)" }}
                >
                  No posts yet. Check back soon for society announcements.
                </div>
              ) : (
                <div className="space-y-5">
                  {posts.map((p) => (
                    <SocietyPostCard key={p._id} post={p} showSociety={false} />
                  ))}
                </div>
              )}
            </section>

            <section className="space-y-8">
              <div>
                <div className="mb-3 flex items-center justify-between gap-2">
                  <h2 className="flex items-center gap-2 text-base font-bold tracking-tight" style={{ color: COLORS.text }}>
                    <Calendar size={18} strokeWidth={2} style={{ color: COLORS.dark }} />
                    Upcoming events
                  </h2>
                  <Link
                    to="/events"
                    className="text-[10px] font-bold uppercase tracking-wider hover:underline"
                    style={{ color: COLORS.dark }}
                  >
                    All events
                  </Link>
                </div>
                {extrasLoading ? (
                  <p className="text-sm font-medium" style={{ color: COLORS.muted }}>Loading events…</p>
                ) : upcomingEvents.length === 0 ? (
                  <div
                    className="rounded-md border border-dashed p-8 text-center text-sm"
                    style={{ borderColor: COLORS.border, color: COLORS.muted, backgroundColor: "rgba(255,255,255,0.85)" }}
                  >
                    No upcoming events for this society.
                  </div>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
                    {upcomingEvents.map((ev) => (
                      <Link
                        key={ev._id}
                        to={`/eventdetails/${ev._id}`}
                        className="group flex flex-col overflow-hidden rounded-md border bg-white transition-[border-color,box-shadow] duration-200 hover:border-[#1d4ed8]/35 hover:shadow-md"
                        style={{ borderColor: COLORS.border, boxShadow: cardShadow }}
                      >
                        <div className="aspect-[2/1] overflow-hidden bg-slate-100">
                          <img
                            src={uploadFileUrl(ev.image) || FALLBACK_IMG}
                            alt=""
                            className="h-full w-full object-cover transition duration-300 ease-out group-hover:scale-[1.02]"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = FALLBACK_IMG;
                            }}
                          />
                        </div>
                        <div className="flex flex-1 flex-col p-3.5">
                          <span
                            className="mb-1.5 w-fit rounded px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide"
                            style={{ backgroundColor: COLORS.gold, color: COLORS.dark }}
                          >
                            {ev.category || "Event"}
                          </span>
                          <p className="line-clamp-2 text-sm font-bold leading-snug group-hover:opacity-90" style={{ color: COLORS.text }}>
                            {ev.title}
                          </p>
                          <p className="mt-2 text-[11px] font-semibold" style={{ color: COLORS.muted }}>
                            {fmtRange(ev.startDateTime, ev.endDateTime)}
                          </p>
                          <p className="mt-1 line-clamp-1 text-[11px] font-medium" style={{ color: COLORS.muted }}>
                            <MapPin className="mr-1 inline size-3 shrink-0 align-middle" style={{ color: COLORS.gold }} />
                            {ev.venue || "Venue TBA"}
                          </p>
                          <span className="mt-auto inline-flex items-center gap-0.5 pt-2.5 text-[11px] font-semibold" style={{ color: COLORS.dark }}>
                            Details <ChevronRight size={14} strokeWidth={2.5} />
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h2 className="mb-3 flex flex-wrap items-center gap-2 text-base font-bold tracking-tight" style={{ color: COLORS.text }}>
                  <Calendar size={18} strokeWidth={2} className="text-slate-400" />
                  Past events
                  <span className="text-xs font-normal normal-case" style={{ color: COLORS.muted }}>
                    (archive — not clickable)
                  </span>
                </h2>
                {extrasLoading ? null : pastEvents.length === 0 ? (
                  <p className="text-sm font-medium" style={{ color: COLORS.muted }}>No past events to show yet.</p>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
                    {pastEvents.map((ev) => (
                      <div
                        key={ev._id}
                        className="flex flex-col overflow-hidden rounded-md border border-dashed bg-slate-50/90"
                        style={{ borderColor: COLORS.border }}
                      >
                        <div className="relative aspect-[2/1] overflow-hidden bg-slate-200">
                          <img
                            src={uploadFileUrl(ev.image) || FALLBACK_IMG}
                            alt=""
                            className="h-full w-full object-cover grayscale-[0.35]"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = FALLBACK_IMG;
                            }}
                          />
                          <span className="absolute left-2 top-2 rounded bg-black/60 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white">
                            Past
                          </span>
                        </div>
                        <div className="flex flex-1 flex-col p-3.5">
                          <p className="line-clamp-2 text-sm font-bold" style={{ color: COLORS.text }}>{ev.title}</p>
                          <p className="mt-1 text-[10px] font-bold uppercase tracking-wide" style={{ color: COLORS.muted }}>
                            {ev.status ? `Status: ${ev.status}` : "Ended"}
                          </p>
                          <p className="mt-2 text-xs font-medium" style={{ color: COLORS.muted }}>
                            {fmtRange(ev.startDateTime, ev.endDateTime)}
                          </p>
                          <p className="mt-1 text-xs font-medium" style={{ color: COLORS.muted }}>
                            <MapPin className="mr-1 inline size-3 shrink-0 align-middle" style={{ color: COLORS.gold }} />
                            {ev.venue || "—"}
                          </p>
                          <p className="mt-2 line-clamp-3 text-xs leading-relaxed" style={{ color: COLORS.muted }}>
                            {stripHtmlSnippet(ev.description, 180)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          </div>

          <aside className="space-y-4 lg:col-span-4">
            <div
              className="rounded-md border bg-white p-5"
              style={{ borderColor: COLORS.border, boxShadow: cardShadow }}
            >
              <h3 className="text-[10px] font-bold uppercase tracking-wider" style={{ color: COLORS.muted }}>
                At a glance
              </h3>
              <div className="mt-4 divide-y" style={{ borderColor: COLORS.border }}>
                <div className="flex gap-3 py-3 first:pt-0">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-white" style={{ backgroundColor: COLORS.dark }}>
                    <UserCircle size={18} strokeWidth={2} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: COLORS.muted }}>President</p>
                    <p className="truncate text-sm font-semibold" style={{ color: COLORS.text }}>{presidentName}</p>
                  </div>
                </div>
                <div className="flex gap-3 py-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-white" style={{ backgroundColor: COLORS.dark }}>
                    <Users size={18} strokeWidth={2} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: COLORS.muted }}>Members</p>
                    <p className="text-sm font-semibold" style={{ color: COLORS.text }}>{society.members?.length ?? 0}</p>
                  </div>
                </div>
              </div>
            </div>

            {(society.advisor || society.email || society.phone) && (
              <div className="rounded-md border bg-white p-5" style={{ borderColor: COLORS.border, boxShadow: cardShadow }}>
                <h3 className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider" style={{ color: COLORS.muted }}>
                  <Shield size={14} strokeWidth={2} style={{ color: COLORS.dark }} />
                  Contact
                </h3>
                <ul className="mt-3 space-y-2.5 text-sm" style={{ color: COLORS.muted }}>
                  {society.advisor && (
                    <li>
                      <span className="font-semibold" style={{ color: COLORS.text }}>Advisor: </span>
                      {society.advisor}
                    </li>
                  )}
                  {society.email && (
                    <li className="flex flex-wrap items-center gap-2">
                      <Mail size={15} strokeWidth={2} style={{ color: COLORS.gold }} />
                      <a href={`mailto:${society.email}`} className="font-medium underline-offset-2 hover:underline" style={{ color: COLORS.dark }}>
                        {society.email}
                      </a>
                    </li>
                  )}
                  {society.phone && (
                    <li className="flex items-center gap-2">
                      <Phone size={15} strokeWidth={2} style={{ color: COLORS.gold }} />
                      <a href={`tel:${society.phone}`} className="font-medium underline-offset-2 hover:underline" style={{ color: COLORS.dark }}>
                        {society.phone}
                      </a>
                    </li>
                  )}
                </ul>
              </div>
            )}

            <div
              className="rounded-md border p-5"
              style={{ borderColor: COLORS.border, backgroundColor: COLORS.dark, boxShadow: cardShadow }}
            >
              <p className="text-sm font-medium text-white/90">Want to join this community?</p>
              <button
                type="button"
                onClick={() => navigate(`/join-society/${society._id}`)}
                className="mt-3 w-full rounded-sm border border-transparent bg-white py-2.5 text-sm font-semibold tracking-wide text-slate-900 transition hover:bg-slate-100"
              >
                Join society
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
