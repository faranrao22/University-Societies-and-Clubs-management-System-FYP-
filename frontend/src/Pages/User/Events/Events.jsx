import React, { useState } from "react";
import axios from "axios";
import API_BASE_URL, { uploadFileUrl } from "../../../config/api.config";
import { useQuery } from "@tanstack/react-query";
import { MapPin, Users, Calendar, Filter, X, Loader2, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import PublicSearchInput from "../../../Components/PublicSearchInput";
import PublicSectionCard from "../../../Components/PublicSectionCard";
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
      <div className="mx-auto max-w-6xl px-6 py-10">
        <PublicSectionCard className="mb-8">
          <h2 className="text-xl font-black tracking-tight sm:text-2xl" style={{ color: COLORS.text }}>
            Discover events
          </h2>
          <p className="mt-1 text-sm sm:text-base" style={{ color: COLORS.muted }}>
            Workshops, competitions, and society programmes — filter by host, date, or keyword.
          </p>
        </PublicSectionCard>

        <PublicSectionCard>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <Filter size={16} style={{ color: COLORS.dark }} />
            <span className="text-xs font-bold uppercase tracking-wide text-gray-800">Filters</span>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleClear}
                className="ml-auto flex items-center gap-1 text-xs font-semibold hover:underline"
                style={{ color: COLORS.dark }}
              >
                <X size={12} /> Clear all
              </button>
            )}
          </div>

          <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center">
            <div className="flex items-center gap-2">
              <Calendar size={16} className="shrink-0 text-gray-400" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setPage(1);
                }}
                className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#1d4ed8]/20 lg:w-auto"
                style={{ borderColor: COLORS.border, color: COLORS.text }}
              />
            </div>
            <select
              value={selectedSociety}
              onChange={(e) => {
                setSelectedSociety(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#1d4ed8]/20 lg:min-w-[200px]"
              style={{ borderColor: COLORS.border, color: COLORS.text }}
            >
              <option value="All">All societies</option>
              {societies.map((soc) => (
                <option key={soc._id} value={soc._id}>
                  {soc.name}
                </option>
              ))}
            </select>
            <PublicSearchInput
              className="min-w-[200px] flex-1"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by title…"
            />
          </div>
        </PublicSectionCard>
      </div>

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

        <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">
          {!loading &&
            events.map((event, idx) => (
              <motion.div
                key={event._id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
              >
                <Link to={`/eventdetails/${event._id}`} className="group block h-full">
                  <div
                    className="flex h-full flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
                    style={{ borderColor: COLORS.border }}
                  >
                    <div className="relative h-48 overflow-hidden bg-slate-100">
                      <img
                        src={uploadFileUrl(event.image) || PLACEHOLDER_IMG}
                        alt=""
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-85" />
                      <span className="absolute bottom-3 left-3 rounded-full bg-white/95 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-[#1e3a8a] shadow-sm">
                        {event.category || "Event"}
                      </span>
                    </div>
                    <div className="flex flex-1 flex-col p-5">
                      <h2 className="line-clamp-2 text-lg font-black leading-snug text-gray-900 transition group-hover:text-[#1d4ed8]">
                        {event.title}
                      </h2>
                      <div className="mt-3 space-y-2 text-sm" style={{ color: COLORS.muted }}>
                        <p className="flex items-center gap-2">
                          <Users size={14} className="shrink-0 text-[#38bdf8]" />
                          <span className="truncate">{event.organizer?.name || "Society"}</span>
                        </p>
                        <p className="flex items-center gap-2">
                          <MapPin size={14} className="shrink-0 text-[#38bdf8]" />
                          <span className="truncate">{event.venue}</span>
                        </p>
                        <p className="pt-1 text-sm font-semibold" style={{ color: COLORS.dark }}>
                          {formatDate(event.startDateTime)}
                        </p>
                      </div>
                      <span className="mt-auto inline-flex items-center gap-1 border-t pt-4 text-sm font-bold" style={{ color: COLORS.dark, borderColor: COLORS.border }}>
                        View details <ArrowRight size={14} />
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
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
