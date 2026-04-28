import React, { useState } from "react";
import axios from "axios";
import API_BASE_URL, { uploadFileUrl } from "../../../config/api.config";
import { useQuery } from "@tanstack/react-query";
import { MapPin, Users, Calendar, X, Loader2, ArrowRight, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import PublicSearchInput from "../../../Components/PublicSearchInput";
import PublicFilterCard, { PublicFilterChip, PublicFilterChipGroup } from "../../../Components/PublicFilterCard";
import useDebouncedValue from "../../../hooks/useDebouncedValue";

const COLORS = {
  dark: "#1e3a8a",
  lightGreen: "#1d4ed8",
  gold: "#38bdf8",
  cream: "#e2e8f0",
  text: "#111827",
  muted: "#4B5563",
  border: "rgba(30, 64, 175, 0.16)",
};

const PLACEHOLDER_IMG =
  "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=800&auto=format&fit=crop";

/** Host society label — supports populated `organizer`, raw id string, or lookup from public societies list. */
function organizerSocietyName(event, societiesList) {
  const org = event?.organizer;
  if (org && typeof org === "object") {
    const n = org.name;
    if (typeof n === "string" && n.trim()) return n.trim();
  }
  const rawId = org && typeof org === "object" ? org._id ?? org.id : org;
  if (rawId != null && Array.isArray(societiesList) && societiesList.length > 0) {
    const idStr = String(rawId);
    const match = societiesList.find((s) => String(s._id) === idStr);
    if (match?.name && String(match.name).trim()) return String(match.name).trim();
  }
  return "Society";
}

function AllEvents() {
  const [search, setSearch] = useState("");
  const [selectedSociety, setSelectedSociety] = useState("All");
  const [selectedDate, setSelectedDate] = useState("");
  const [page, setPage] = useState(1);
  const limit = 9;
  const debouncedSearch = useDebouncedValue(search, 350);

  const { data: societies = [] } = useQuery({
    queryKey: ["public", "societies", "all-minimal"],
    queryFn: async () => {
      const res = await axios.get(`${API_BASE_URL}/societies/Allsocieties`);
      return res.data.data || [];
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 20 * 60 * 1000,
  });

  const { data: eventsData, isPending: loading } = useQuery({
    queryKey: ["public", "events", { debouncedSearch, selectedSociety, selectedDate, page, limit }],
    queryFn: async () => {
      const res = await axios.get(`${API_BASE_URL}/event/allevents`, {
        params: {
          search: debouncedSearch || undefined,
          society: selectedSociety === "All" ? undefined : selectedSociety,
          date: selectedDate || undefined,
          page,
          limit,
        },
      });
      return {
        events: res.data.data || [],
        totalPages: res.data.totalPages || 1,
      };
    },
    staleTime: 3 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    placeholderData: (prev) => prev,
  });
  const events = eventsData?.events || [];
  const totalPages = eventsData?.totalPages || 1;

  const handleClear = () => {
    setSearch("");
    setSelectedDate("");
    setSelectedSociety("All");
    setPage(1);
  };

  const formatDate = (date) => {
    const d = new Date(date);
    const options = { weekday: "short", month: "short", day: "numeric" };
    const time = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    return `${d.toLocaleDateString("en-US", options)} · ${time}`;
  };

  const hasActiveFilters = search || selectedDate || selectedSociety !== "All";

  return (
    <div className="min-h-screen" style={{ backgroundColor: COLORS.cream }}>
      <section className="mx-auto max-w-6xl px-6 py-6 md:py-8">
        <PublicFilterCard
          title="Discover events"
          subtitle="Workshops, competitions, and society programmes — filter by host, date, or keyword."
          search={null}
          headerAction={
            hasActiveFilters ? (
              <button
                type="button"
                onClick={handleClear}
                className="flex items-center gap-1 text-xs font-semibold hover:underline"
                style={{ color: COLORS.dark }}
              >
                <X size={12} strokeWidth={2.5} /> Clear
              </button>
            ) : null
          }
        >
          <div className="mx-auto mt-3 flex w-full max-w-3xl flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:gap-4">
            <div className="min-w-0 flex-1">
              <PublicSearchInput
                id="events-search"
                className="w-full"
                compact
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search by title…"
              />
            </div>
            <label
              className="inline-flex min-h-[2.25rem] shrink-0 cursor-pointer items-center gap-1.5 self-stretch rounded-md border bg-white px-2.5 py-1.5 text-xs sm:self-auto"
              style={{ borderColor: COLORS.border, color: COLORS.text }}
            >
              <Calendar size={14} className="shrink-0 opacity-60" strokeWidth={2} />
              <span className="font-semibold uppercase tracking-wide text-gray-500">Date</span>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setPage(1);
                }}
                className="w-full min-w-0 max-w-[11rem] cursor-pointer border-0 bg-transparent p-0 text-xs outline-none sm:w-auto"
              />
            </label>
          </div>

          {societies.length > 0 ? (
            <PublicFilterChipGroup label="By host society">
              <PublicFilterChip
                active={selectedSociety === "All"}
                onClick={() => {
                  setSelectedSociety("All");
                  setPage(1);
                }}
              >
                All societies
              </PublicFilterChip>
              {societies.map((soc) => {
                const id = String(soc._id);
                const active = selectedSociety === id;
                return (
                  <PublicFilterChip
                    key={id}
                    active={active}
                    className="max-w-[min(100%,14rem)]"
                    onClick={() => {
                      setSelectedSociety(active ? "All" : id);
                      setPage(1);
                    }}
                  >
                    <span className="line-clamp-2">{soc.name}</span>
                  </PublicFilterChip>
                );
              })}
            </PublicFilterChipGroup>
          ) : null}
        </PublicFilterCard>
      </section>

      <div className="mx-auto max-w-6xl px-6 pb-16">
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin" size={40} style={{ color: COLORS.gold }} />
            <p className="mt-3 text-sm" style={{ color: COLORS.muted }}>
              Loading events…
            </p>
          </div>
        )}

        {!loading && events.length === 0 && (
          <div className="py-16 text-center text-sm" style={{ color: COLORS.muted }}>
            No events match your filters. Try clearing filters or searching again.
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4">
          {!loading &&
            events.map((event, idx) => {
              const cardImg = uploadFileUrl(event.image) || PLACEHOLDER_IMG;
              const societyName = organizerSocietyName(event, societies);
              return (
                <motion.div
                  key={event._id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}
                >
                  <Link to={`/eventdetails/${event._id}`} className="group block h-full">
                    <article
                      className="flex h-full flex-col overflow-hidden rounded-md border bg-white transition-[border-color,box-shadow] duration-200 hover:border-[#1d4ed8]/35 hover:shadow-md"
                      style={{
                        borderColor: COLORS.border,
                        boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04)",
                      }}
                    >
                      <div className="relative h-32 overflow-hidden sm:h-36">
                        <img
                          src={cardImg}
                          alt={event.title}
                          className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.02]"
                          loading="lazy"
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
                        <h3
                          className="mb-1.5 text-sm font-bold leading-snug tracking-tight sm:text-[15px]"
                          style={{ color: COLORS.text }}
                        >
                          {event.title}
                        </h3>
                        <div className="min-h-0 flex-grow" aria-hidden />

                        <div
                          className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-dashed pt-2.5"
                          style={{ borderColor: COLORS.border }}
                        >
                          <div
                            className="flex min-w-0 max-w-full items-center gap-1 truncate text-[11px] font-semibold sm:text-xs"
                            style={{ color: COLORS.muted }}
                            title={societyName}
                          >
                            <Users size={13} style={{ color: COLORS.gold }} className="shrink-0" strokeWidth={2} />
                            <span className="truncate">{societyName}</span>
                          </div>
                          <div
                            className="flex min-w-0 max-w-full items-center gap-1 truncate text-[11px] font-semibold sm:text-xs"
                            style={{ color: COLORS.muted }}
                            title={event.venue}
                          >
                            <MapPin size={13} style={{ color: COLORS.gold }} className="shrink-0" strokeWidth={2} />
                            <span className="truncate">{event.venue}</span>
                          </div>
                          <div
                            className="flex min-w-0 max-w-full items-center gap-1 truncate text-[11px] font-semibold sm:text-xs"
                            style={{ color: COLORS.muted }}
                            title={formatDate(event.startDateTime)}
                          >
                            <Calendar size={13} style={{ color: COLORS.gold }} className="shrink-0" strokeWidth={2} />
                            <span className="truncate">{formatDate(event.startDateTime)}</span>
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
              );
            })}
        </div>

        {totalPages > 1 && (
          <div className="mt-12 flex items-center justify-center gap-2">
            <button
              type="button"
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-xl border px-4 py-2 text-sm font-semibold transition disabled:opacity-40"
              style={{ borderColor: COLORS.border, backgroundColor: "#fff", color: COLORS.text }}
            >
              Prev
            </button>
            <span className="px-3 text-sm" style={{ color: COLORS.muted }}>
              {page} / {totalPages}
            </span>
            <button
              type="button"
              disabled={page === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="rounded-xl border px-4 py-2 text-sm font-semibold transition disabled:opacity-40"
              style={{ borderColor: COLORS.border, backgroundColor: "#fff", color: COLORS.text }}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default AllEvents;
