import React, { useDeferredValue, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  ArrowRight,
  Globe,
  Loader2,
  BookOpen,
  Eye,
  Search,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import API_BASE_URL, { uploadFileUrl } from "../../../config/api.config";
import PublicFilterCard, { PublicFilterChip, PublicFilterChipGroup } from "../../../Components/PublicFilterCard";

const FALLBACK_SOCIETY_IMG =
  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=800";

// 🔹 Premium Color Tokens
const COLORS = {
  dark: "#1e3a8a",
  darkHover: "#1d4ed8",
  lightGreen: "#1d4ed8",
  gold: "#38bdf8",
  goldHover: "#0ea5e9",
  cream: "#e2e8f0",
  text: "#111827",
  muted: "#4B5563",
  border: "rgba(30, 64, 175, 0.16)",
};

const deptLabel = (s) => s.department || "General / Others";

const AllSocieties = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const deferredSearch = useDeferredValue(searchQuery);
  const navigate = useNavigate();

  const { data: societies = [], isPending: loading } = useQuery({
    queryKey: ["public", "societies", "all"],
    queryFn: async () => {
      const res = await axios.get(`${API_BASE_URL}/societies/Allsocieties`, { withCredentials: true });
      return res.data.data || [];
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 20 * 60 * 1000,
    retry: 1,
  });

  const departmentOptions = useMemo(() => {
    const set = new Set();
    for (const s of societies) set.add(deptLabel(s));
    return [...set].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
  }, [societies]);

  const filteredSocieties = useMemo(() => {
    const q = deferredSearch.trim().toLowerCase();
    return societies.filter((s) => {
      const dept = deptLabel(s);
      if (selectedDepartment && dept !== selectedDepartment) return false;
      if (!q) return true;
      const name = (s.name || "").toLowerCase();
      const desc = (s.description || "").toLowerCase();
      return name.includes(q) || desc.includes(q) || dept.toLowerCase().includes(q);
    });
  }, [societies, deferredSearch, selectedDepartment]);

  const groupedSocieties = useMemo(() => {
    return filteredSocieties.reduce((acc, society) => {
      const dept = deptLabel(society);
      if (!acc[dept]) acc[dept] = [];
      acc[dept].push(society);
      return acc;
    }, {});
  }, [filteredSocieties]);

  const departments = Object.keys(groupedSocieties)
    .filter((dept) => groupedSocieties[dept].length > 0)
    .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedDepartment(null);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: COLORS.cream }}>
      <section className="max-w-6xl mx-auto px-6 py-6 md:py-8">
        <PublicFilterCard
          title="Find your society"
          subtitle="Browse by department or search by society name."
          search={{
            id: "societies-search",
            value: searchQuery,
            onChange: (e) => setSearchQuery(e.target.value),
            placeholder: "Search societies, descriptions…",
          }}
        >
          {!loading && departmentOptions.length > 0 ? (
            <PublicFilterChipGroup label="Browse by department">
              <PublicFilterChip active={!selectedDepartment} onClick={() => setSelectedDepartment(null)}>
                All departments
              </PublicFilterChip>
              {departmentOptions.map((name) => {
                const active = selectedDepartment === name;
                return (
                  <PublicFilterChip key={name} active={active} onClick={() => setSelectedDepartment(active ? null : name)}>
                    <span className="line-clamp-2">{name}</span>
                  </PublicFilterChip>
                );
              })}
            </PublicFilterChipGroup>
          ) : null}
        </PublicFilterCard>

        {loading ? (
          <div className="flex flex-col justify-center items-center h-80">
            <Loader2 className="animate-spin mb-4" size={40} style={{ color: COLORS.gold }} />
            <p className="text-sm font-medium" style={{ color: COLORS.muted }}>Loading societies...</p>
          </div>
        ) : (
          departments.map((dept, deptIndex) => (
            <div key={dept} className="mb-12 last:mb-0">
              {/* Department Header */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: deptIndex * 0.1 }}
                className="mb-5 flex items-center gap-3 border-b pb-3"
                style={{ borderColor: COLORS.border }}
              >
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md"
                  style={{ backgroundColor: COLORS.dark }}
                >
                  <BookOpen size={18} color="#fff" strokeWidth={2} />
                </div>
                <div className="min-w-0">
                  <h2 className="text-base font-bold tracking-tight sm:text-lg" style={{ color: COLORS.text }}>
                    {dept}
                  </h2>
                  <p className="mt-0.5 text-xs font-medium" style={{ color: COLORS.muted }}>
                    {groupedSocieties[dept].length}{" "}
                    {groupedSocieties[dept].length === 1 ? "society" : "societies"}
                  </p>
                </div>
              </motion.div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4">
                {groupedSocieties[dept].map((item) => {
                  const cardImg = uploadFileUrl(item.image) || FALLBACK_SOCIETY_IMG;
                  return (
                  <article
                    key={item._id}
                    className="group flex flex-col overflow-hidden rounded-md border bg-white transition-[border-color,box-shadow] duration-200 hover:border-[#1d4ed8]/35 hover:shadow-md"
                    style={{
                      borderColor: COLORS.border,
                      boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04)",
                    }}
                  >
                    <div className="relative h-32 overflow-hidden sm:h-36">
                      <img
                        src={cardImg}
                        alt={item.name}
                        className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.02]"
                        loading="lazy"
                        onError={(e) => {
                          e.target.src = FALLBACK_SOCIETY_IMG;
                        }}
                      />
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0f172a]/55 via-transparent to-transparent" />

                      <div className="absolute left-2 top-2 right-2 flex justify-start">
                        <span
                          className="rounded px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide"
                          style={{ backgroundColor: COLORS.gold, color: COLORS.dark }}
                        >
                          {item.joinPolicy || "Open"}
                        </span>
                      </div>
                    </div>

                    <div className="flex grow flex-col p-3.5 sm:p-4">
                      <h3 className="mb-1.5 text-sm font-bold leading-snug tracking-tight sm:text-[15px]" style={{ color: COLORS.text }}>
                        {item.name}
                      </h3>

                      <p className="mb-3 line-clamp-2 flex-grow text-xs leading-relaxed" style={{ color: COLORS.muted }}>
                        {item.description ||
                          "Connect with members, join events, and grow skills alongside peers who share your interests."}
                      </p>

                      <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-dashed pt-2.5" style={{ borderColor: COLORS.border }}>
                        <div
                          className="flex items-center gap-1 text-[11px] font-semibold sm:text-xs"
                          style={{ color: COLORS.muted }}
                        >
                          <Users size={13} style={{ color: COLORS.gold }} strokeWidth={2} />
                          {item.members?.length || 0} members
                        </div>
                        <div
                          className="flex min-w-0 max-w-full items-center gap-1 truncate text-[11px] font-semibold sm:text-xs"
                          style={{ color: COLORS.muted }}
                          title={item.department || "General"}
                        >
                          <Globe size={13} style={{ color: COLORS.gold }} className="shrink-0" strokeWidth={2} />
                          <span className="truncate">{item.department || "General"}</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => navigate(`/society/${item._id}`)}
                        className="mt-auto flex w-full items-center justify-center gap-1.5 rounded-sm border border-transparent py-2 text-xs font-semibold tracking-wide transition-colors duration-150 hover:bg-[#1d4ed8] active:bg-[#1e40af]"
                        style={{
                          backgroundColor: COLORS.dark,
                          color: "#fff",
                        }}
                      >
                        <Eye size={14} strokeWidth={2.25} />
                        View
                        <ArrowRight size={13} className="opacity-90" strokeWidth={2.5} />
                      </button>
                    </div>
                  </article>
                  );
                })}
              </div>
            </div>
          ))
        )}

        {!loading && societies.length > 0 && departments.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-2xl border bg-white py-16 text-center shadow-sm"
            style={{ borderColor: COLORS.border }}
          >
            <div
              className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full"
              style={{ backgroundColor: "rgba(30, 64, 175, 0.08)" }}
            >
              <Search size={28} style={{ color: COLORS.muted }} />
            </div>
            <p className="text-base font-bold mb-2" style={{ color: COLORS.text }}>
              No societies match your filters
            </p>
            <p className="mb-5 text-sm px-4" style={{ color: COLORS.muted }}>
              Try another department or clear the search.
            </p>
            <button
              type="button"
              onClick={clearFilters}
              className="rounded-xl px-5 py-2.5 text-sm font-bold text-white transition hover:brightness-110"
              style={{ backgroundColor: COLORS.dark }}
            >
              Clear filters
            </button>
          </motion.div>
        )}

        {!loading && societies.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div
              className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
              style={{ backgroundColor: "rgba(27, 77, 40, 0.08)" }}
            >
              <Search size={28} style={{ color: COLORS.muted }} />
            </div>
            <p className="text-base font-bold mb-2" style={{ color: COLORS.text }}>
              No societies yet
            </p>
            <p className="text-sm" style={{ color: COLORS.muted }}>
              Check back later for new societies.
            </p>
          </motion.div>
        )}
      </section>
    </div>
  );
};

export default AllSocieties;
