import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CalendarDays, MapPin, ArrowRight, Sparkles, Loader2 } from "lucide-react";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import API_BASE_URL, { uploadFileUrl } from "../../config/api.config";

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
      return list.slice(0, 3);
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
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin" style={{ color: COLORS.gold }} />
          </div>
        ) : events.length === 0 ? (
          <div
            className="rounded-2xl border border-dashed p-10 text-center text-sm"
            style={{ borderColor: COLORS.border, color: COLORS.muted }}
          >
            No events available right now.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
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
                    className="flex h-full flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                    style={{ borderColor: COLORS.border }}
                  >
                    <div className="relative h-52 overflow-hidden">
                      <img
                        src={uploadFileUrl(event.image) || PLACEHOLDER_IMG}
                        alt={event.title || "Event"}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>

                    <div className="flex grow flex-col p-6">
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide" style={{ color: COLORS.dark }}>
                        {event.category || "Event"}
                      </p>
                      <h3
                        className="mb-3 text-lg font-bold leading-tight transition-colors group-hover:text-[#D4A017]"
                        style={{ color: COLORS.text }}
                      >
                        {event.title || "Untitled event"}
                      </h3>
                      <p className="mb-5 line-clamp-2 text-sm" style={{ color: COLORS.muted }}>
                        {(event.description || "Join this upcoming campus event.")
                          .replace(/<[^>]+>/g, " ")
                          .replace(/\s+/g, " ")
                          .trim()}
                      </p>
                      <div
                        className="mt-auto flex items-center justify-between border-t pt-4 text-xs"
                        style={{ borderColor: "rgba(75, 85, 99, 0.14)", color: COLORS.muted }}
                      >
                        <span className="inline-flex items-center gap-1.5">
                          <CalendarDays size={14} /> {fmtDate(event.startDateTime)}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin size={14} /> {event.venue || "TBA"}
                        </span>
                      </div>
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
