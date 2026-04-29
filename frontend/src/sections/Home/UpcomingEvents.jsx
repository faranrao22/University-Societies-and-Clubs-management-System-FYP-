import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Users, Calendar, MapPin, ArrowRight, Sparkles, Eye } from "lucide-react";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import API_BASE_URL, { uploadFileUrl } from "../../config/api.config";
import PageLoader from "../../Components/PageLoader";

const COLORS = {
  dark: "#1e3a8a",
  gold: "#38bdf8",
  cream: "#e2e8f0",
  text: "#111827",
  muted: "#4B5563",
  border: "rgba(30, 64, 175, 0.16)",
};

const PLACEHOLDER_IMG =
  "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=900&auto=format&fit=crop";

function fmtDate(value) {
  if (!value) return "Date TBA";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "Date TBA";
  return d.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function UpcomingEvents() {
  const { data: events = [], isPending: loading } = useQuery({
    queryKey: ["public", "home", "upcoming-events"],
    queryFn: async () => {
      const res = await axios.get(`${API_BASE_URL}/event/allevents`, {
        params: { page: 1, limit: 6 },
      });
      const list = Array.isArray(res.data?.data) ? res.data.data : [];
      const latestFirst = [...list].sort((a, b) => {
        const aTime = new Date(a?.createdAt || a?.updatedAt || a?.startDateTime || 0).getTime();
        const bTime = new Date(b?.createdAt || b?.updatedAt || b?.startDateTime || 0).getTime();
        return bTime - aTime;
      });
      return latestFirst.slice(0, 3);
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });

  return (
    <section className="px-6 py-14 md:py-16" style={{ backgroundColor: COLORS.cream }}>
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col justify-between gap-4 md:mb-10 md:flex-row md:items-end">
          <div className="max-w-xl">
            <div
              className="mb-5 inline-flex items-center gap-2 rounded-xl px-4 py-2"
              style={{ backgroundColor: `${COLORS.gold}1A`, color: COLORS.dark }}
            >
              <Sparkles size={14} style={{ color: COLORS.gold }} />
              <span className="text-[11px] font-bold uppercase tracking-wider">Upcoming</span>
            </div>
            <h2 className="text-3xl font-black tracking-tight md:text-4xl" style={{ color: COLORS.dark }}>
              Campus <span className="text-[#D4A017]">Events</span>
            </h2>
            <p className="mt-2 text-base leading-relaxed" style={{ color: COLORS.muted }}>
              Discover what is happening next across societies and clubs.
            </p>
          </div>

          <Link
            to="/events"
            className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-xs font-bold uppercase tracking-wide text-white transition hover:brightness-105"
            style={{ backgroundColor: COLORS.dark }}
          >
            View All
            <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <PageLoader />
        ) : events.length === 0 ? (
          <div
            className="rounded-2xl border border-dashed p-10 text-center text-sm"
            style={{ borderColor: COLORS.border, color: COLORS.muted }}
          >
            No events available right now.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4">
            {events.map((event, index) => (
              <motion.div
                key={event._id || index}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
              >
                <Link to="/events" className="group block h-full">
                  <article
                    className="flex h-full flex-col overflow-hidden rounded-md border bg-white transition-[border-color,box-shadow] duration-200 hover:border-[#1d4ed8]/35 hover:shadow-md"
                    style={{
                      borderColor: COLORS.border,
                      boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04)",
                    }}
                  >
                    <div className="relative h-32 overflow-hidden sm:h-36">
                      <img
                        src={uploadFileUrl(event.image) || PLACEHOLDER_IMG}
                        alt={event.title || "Event"}
                        className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.02]"
                        onError={(e) => {
                          e.target.src = PLACEHOLDER_IMG;
                        }}
                      />
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0f172a]/55 via-transparent to-transparent" />
                      <div className="absolute left-2 top-2 right-2 flex justify-start">
                        <span
                          className="rounded px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide"
                          style={{ backgroundColor: COLORS.gold, color: COLORS.dark }}
                        >
                          {event.category || "Event"}
                        </span>
                      </div>
                    </div>

                    <div className="flex grow flex-col p-3.5 sm:p-4">
                      <h3 className="mb-1.5 text-sm font-bold leading-snug tracking-tight sm:text-[15px]" style={{ color: COLORS.text }}>
                        {event.title || "Untitled event"}
                      </h3>
                      <div className="min-h-0 flex-grow" aria-hidden />

                      <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-dashed pt-2.5" style={{ borderColor: COLORS.border }}>
                        <div
                          className="flex min-w-0 max-w-full items-center gap-1 truncate text-[11px] font-semibold sm:text-xs"
                          style={{ color: COLORS.muted }}
                          title={event.organizer?.name || "Society"}
                        >
                          <Users size={13} style={{ color: COLORS.gold }} className="shrink-0" strokeWidth={2} />
                          <span className="truncate">{event.organizer?.name || "Society"}</span>
                        </div>
                        <div
                          className="flex min-w-0 max-w-full items-center gap-1 truncate text-[11px] font-semibold sm:text-xs"
                          style={{ color: COLORS.muted }}
                          title={event.venue}
                        >
                          <MapPin size={13} style={{ color: COLORS.gold }} className="shrink-0" strokeWidth={2} />
                          <span className="truncate">{event.venue || "TBA"}</span>
                        </div>
                        <div
                          className="flex min-w-0 max-w-full items-center gap-1 truncate text-[11px] font-semibold sm:text-xs"
                          style={{ color: COLORS.muted }}
                          title={fmtDate(event.startDateTime)}
                        >
                          <Calendar size={13} style={{ color: COLORS.gold }} className="shrink-0" strokeWidth={2} />
                          <span className="truncate">{fmtDate(event.startDateTime)}</span>
                        </div>
                      </div>

                      <span
                        className="mt-auto flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-sm border border-transparent py-2 text-xs font-semibold tracking-wide transition-colors duration-150 group-hover:bg-[#1d4ed8] active:bg-[#1e40af]"
                        style={{
                          backgroundColor: COLORS.dark,
                          color: "#fff",
                        }}
                      >
                        <Eye size={14} strokeWidth={2.25} />
                        View
                        <ArrowRight size={13} className="opacity-90" strokeWidth={2.5} />
                      </span>
                    </div>
                  </article>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
