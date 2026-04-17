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
          className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-110"
          style={{ backgroundColor: COLORS.dark }}
        >
          <ArrowLeft size={16} /> Back to societies
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-32 md:pb-16" style={{ backgroundColor: COLORS.cream }}>
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="mb-8 rounded-2xl border bg-white p-5 shadow-sm sm:p-6" style={{ borderColor: COLORS.border }}>
          <button
            type="button"
            onClick={() => navigate("/community")}
            className="inline-flex items-center gap-2 text-sm font-semibold hover:underline"
            style={{ color: COLORS.dark }}
          >
            <ArrowLeft size={18} />
            All societies
          </button>
          <h1 className="mt-3 text-2xl font-black tracking-tight text-gray-900 sm:text-3xl">{society.name}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-2.5 text-sm">
            {society.department ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-semibold" style={{ borderColor: COLORS.border, color: COLORS.muted }}>
                <MapPin size={15} />
                {society.department}
              </span>
            ) : null}
            <span className="rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide text-white" style={{ backgroundColor: COLORS.lightGreen }}>
              {society.joinPolicy || "Open"}
            </span>
            {society.status ? (
              <span className="rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wide" style={{ borderColor: COLORS.border, color: COLORS.muted }}>
                {society.status}
              </span>
            ) : null}
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-12">
          <div className="space-y-8 lg:col-span-8">
            <motion.section
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border bg-white p-6 sm:p-8 shadow-sm"
              style={{ borderColor: COLORS.border }}
            >
              <h2 className="text-sm font-bold uppercase tracking-widest" style={{ color: COLORS.lightGreen }}>
                About
              </h2>
              <p className="mt-3 text-base leading-relaxed sm:text-lg" style={{ color: COLORS.muted }}>
                {society.description ||
                  "This society welcomes students who want to connect, learn, and take part in campus life."}
              </p>
            </motion.section>

            <section>
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="flex items-center gap-2 text-lg font-black text-gray-900">
                  <Newspaper size={22} style={{ color: COLORS.dark }} />
                  Updates &amp; posts
                </h2>
                <Link
                  to="/society-posts"
                  className="text-xs font-bold uppercase tracking-wide hover:underline"
                  style={{ color: COLORS.gold }}
                >
                  All campus news
                </Link>
              </div>
              {extrasLoading ? (
                <p className="text-sm text-gray-500">Loading posts…</p>
              ) : posts.length === 0 ? (
                <div
                  className="rounded-2xl border border-dashed p-8 text-center text-sm text-gray-500"
                  style={{ borderColor: COLORS.border, backgroundColor: "rgba(255,255,255,0.7)" }}
                >
                  No posts yet. Check back soon for society announcements.
                </div>
              ) : (
                <div className="space-y-6">
                  {posts.map((p) => (
                    <SocietyPostCard key={p._id} post={p} showSociety={false} />
                  ))}
                </div>
              )}
            </section>

            <section className="space-y-10">
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="flex items-center gap-2 text-lg font-black text-gray-900">
                    <Calendar size={22} style={{ color: COLORS.dark }} />
                    Upcoming events
                  </h2>
                  <Link to="/events" className="text-sm font-bold uppercase tracking-wide hover:underline" style={{ color: COLORS.gold }}>
                    Browse all events
                  </Link>
                </div>
                {extrasLoading ? (
                  <p className="text-sm text-gray-500">Loading events…</p>
                ) : upcomingEvents.length === 0 ? (
                  <div
                    className="rounded-2xl border border-dashed p-8 text-center text-sm text-gray-500"
                    style={{ borderColor: COLORS.border, backgroundColor: "rgba(255,255,255,0.7)" }}
                  >
                    No upcoming events for this society.
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {upcomingEvents.map((ev) => (
                      <Link
                        key={ev._id}
                        to={`/eventdetails/${ev._id}`}
                        className="group flex flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:shadow-md"
                        style={{ borderColor: COLORS.border }}
                      >
                        <div className="aspect-[2/1] overflow-hidden bg-slate-100">
                          <img
                            src={uploadFileUrl(ev.image) || FALLBACK_IMG}
                            alt=""
                            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                          />
                        </div>
                        <div className="flex flex-1 flex-col p-4">
                          <span className="mb-1 w-fit rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white" style={{ backgroundColor: COLORS.lightGreen }}>
                            {ev.category || "Event"}
                          </span>
                          <p className="font-bold text-gray-900 line-clamp-2 group-hover:text-[#B8860B]">{ev.title}</p>
                          <p className="mt-2 text-xs font-medium" style={{ color: COLORS.muted }}>
                            {fmtRange(ev.startDateTime, ev.endDateTime)}
                          </p>
                          <p className="mt-1 text-xs line-clamp-1" style={{ color: COLORS.muted }}>
                            <MapPin className="mr-1 inline size-3" style={{ color: COLORS.gold }} />
                            {ev.venue || "Venue TBA"}
                          </p>
                          <span className="mt-auto inline-flex items-center gap-1 pt-3 text-xs font-bold" style={{ color: COLORS.dark }}>
                            Open details <ChevronRight size={14} />
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h2 className="mb-4 flex items-center gap-2 text-lg font-black text-gray-900">
                  <Calendar size={22} className="text-gray-400" />
                  Past events
                  <span className="text-xs font-normal normal-case text-gray-500">(archive — not clickable)</span>
                </h2>
                {extrasLoading ? null : pastEvents.length === 0 ? (
                  <p className="text-sm text-gray-500">No past events to show yet.</p>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {pastEvents.map((ev) => (
                      <div
                        key={ev._id}
                        className="flex flex-col overflow-hidden rounded-2xl border border-dashed bg-gray-50/80 opacity-95"
                        style={{ borderColor: COLORS.border }}
                      >
                        <div className="relative aspect-[2/1] overflow-hidden bg-slate-200">
                          <img
                            src={uploadFileUrl(ev.image) || FALLBACK_IMG}
                            alt=""
                            className="h-full w-full object-cover grayscale-[0.35]"
                          />
                          <span className="absolute left-2 top-2 rounded bg-black/60 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                            Past
                          </span>
                        </div>
                        <div className="flex flex-1 flex-col p-4">
                          <p className="font-bold text-gray-800 line-clamp-2">{ev.title}</p>
                          <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                            {ev.status ? `Status: ${ev.status}` : "Ended"}
                          </p>
                          <p className="mt-2 text-sm" style={{ color: COLORS.muted }}>
                            {fmtRange(ev.startDateTime, ev.endDateTime)}
                          </p>
                          <p className="mt-1 text-sm" style={{ color: COLORS.muted }}>
                            <MapPin className="mr-1 inline size-3 shrink-0" style={{ color: COLORS.gold }} />
                            {ev.venue || "—"}
                          </p>
                          <p className="mt-2 text-sm leading-relaxed text-gray-600 line-clamp-3">
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

          <aside className="space-y-5 lg:col-span-4">
            <div
              className="rounded-2xl border bg-white p-5 shadow-sm"
              style={{ borderColor: COLORS.border }}
            >
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500">At a glance</h3>
              <div className="mt-4 space-y-4">
                <div className="flex gap-3 rounded-xl border p-3" style={{ borderColor: COLORS.border, backgroundColor: "#e2e8f0" }}>
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-white" style={{ backgroundColor: COLORS.dark }}>
                    <UserCircle size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">President</p>
                    <p className="text-sm font-semibold text-gray-900">{presidentName}</p>
                  </div>
                </div>
                <div className="flex gap-3 rounded-xl border p-3" style={{ borderColor: COLORS.border, backgroundColor: "#e2e8f0" }}>
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-white" style={{ backgroundColor: COLORS.dark }}>
                    <Users size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Members</p>
                    <p className="text-sm font-semibold text-gray-900">{society.members?.length ?? 0}</p>
                  </div>
                </div>
              </div>
            </div>

            {(society.advisor || society.email || society.phone) && (
              <div className="rounded-2xl border bg-white p-5 shadow-sm" style={{ borderColor: COLORS.border }}>
                <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-500">
                  <Shield size={14} className="text-[#1B4D28]" />
                  Contact
                </h3>
                <ul className="mt-4 space-y-3 text-sm" style={{ color: COLORS.muted }}>
                  {society.advisor && (
                    <li>
                      <span className="font-semibold text-gray-800">Advisor: </span>
                      {society.advisor}
                    </li>
                  )}
                  {society.email && (
                    <li className="flex flex-wrap items-center gap-2">
                      <Mail size={16} style={{ color: COLORS.gold }} />
                      <a href={`mailto:${society.email}`} className="font-medium underline-offset-2 hover:underline" style={{ color: COLORS.dark }}>
                        {society.email}
                      </a>
                    </li>
                  )}
                  {society.phone && (
                    <li className="flex items-center gap-2">
                      <Phone size={16} style={{ color: COLORS.gold }} />
                      <a href={`tel:${society.phone}`} className="font-medium underline-offset-2 hover:underline" style={{ color: COLORS.dark }}>
                        {society.phone}
                      </a>
                    </li>
                  )}
                </ul>
              </div>
            )}

            <div
              className="rounded-2xl border p-5 shadow-md"
              style={{
                borderColor: COLORS.border,
                background: `linear-gradient(145deg, ${COLORS.dark}, ${COLORS.lightGreen})`,
              }}
            >
              <p className="text-sm font-medium text-white/90">Want to join this community?</p>
              <button
                type="button"
                onClick={() => navigate(`/join-society/${society._id}`)}
                className="mt-4 w-full rounded-xl bg-white py-3 text-sm font-bold text-[#1B4D28] shadow transition hover:brightness-95"
              >
                Join society now
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
