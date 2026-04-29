import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Users, Calendar, ChevronRight, Sparkles, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import API_BASE_URL from "../../../config/api.config";
import PublicFilterCard, { PublicFilterChip, PublicFilterChipGroup } from "../../../Components/PublicFilterCard";
import useDebouncedValue from "../../../hooks/useDebouncedValue";

const COLORS = {
  primary: "#1e3a8a",
  accent: "#38bdf8",
  bg: "#e2e8f0",
  surface: "#FFFFFF",
  text: "#111827",
  textMuted: "#4B5563",
  border: "rgba(30, 64, 175, 0.2)",
  borderLight: "rgba(30, 64, 175, 0.1)",
};

const statusConfig = {
  APPLICATIONS_OPEN: { label: "Applications Open", text: COLORS.primary, bg: "rgba(29, 78, 216, 0.12)", border: COLORS.border },
  APPLICATIONS_CLOSED: { label: "Applications Closed", text: COLORS.accent, bg: "rgba(56, 189, 248, 0.12)", border: "rgba(56, 189, 248, 0.25)" },
  VOTING_SCHEDULED: { label: "Voting Scheduled", text: COLORS.primary, bg: "rgba(29, 78, 216, 0.12)", border: COLORS.border },
  VOTING_LIVE: { label: "Voting Live", text: "#DC2626", bg: "rgba(220, 38, 38, 0.08)", border: "rgba(220, 38, 38, 0.2)" },
  COMPLETED: { label: "Completed", text: COLORS.textMuted, bg: "rgba(75, 85, 99, 0.08)", border: COLORS.borderLight },
};

export default function ElectionListPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [selectedSociety, setSelectedSociety] = useState("All");
  const debouncedSearch = useDebouncedValue(search, 350);
  const { data: elections = [], isPending: loading } = useQuery({
    queryKey: ["public", "elections", "all"],
    queryFn: async () => (await axios.get(`${API_BASE_URL}/election/allElections`, { withCredentials: true })).data.data || [],
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });

  const formatDate = (date) => (date ? new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "TBA");
  const handleAction = (e) => navigate(e.status === "APPLICATIONS_OPEN" ? `/apply/${e._id}` : e.status === "COMPLETED" ? `/results/${e._id}` : `/VoteNow/${e._id}`);

  const grouped = useMemo(
    () =>
      elections.reduce((acc, e) => {
        const name = e.societyId?.name;
        if (!name) return acc;
        if (!acc[name]) acc[name] = [];
        acc[name].push(e);
        return acc;
      }, {}),
    [elections]
  );

  const filtered = useMemo(
    () =>
      Object.keys(grouped).reduce((acc, society) => {
        const query = debouncedSearch.toLowerCase();
        if (selectedSociety !== "All" && selectedSociety !== society) return acc;
        const list = grouped[society].filter((e) => e.title.toLowerCase().includes(query) || society.toLowerCase().includes(query));
        if (list.length) acc[society] = list;
        return acc;
      }, {}),
    [grouped, debouncedSearch, selectedSociety]
  );

  const hasResults = Object.keys(filtered).length > 0;
  const societyOptions = useMemo(() => Object.keys(grouped).sort((a, b) => a.localeCompare(b)), [grouped]);
  const hasActiveFilters = Boolean(search.trim()) || selectedSociety !== "All";

  return (
    <div className="min-h-screen px-6 py-10" style={{ backgroundColor: COLORS.bg }}>
      <div className="mx-auto max-w-6xl">
        <header className="mb-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-md px-3 py-1.5" style={{ backgroundColor: "rgba(29, 78, 216, 0.12)" }}>
            <Sparkles size={14} style={{ color: COLORS.accent }} />
            <span className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: COLORS.primary }}>Democratic Process</span>
          </div>
          <h1 className="mb-2 text-3xl font-bold" style={{ color: COLORS.text }}>Society Elections</h1>
          <p className="max-w-2xl text-sm" style={{ color: COLORS.textMuted }}>Participate in student leadership elections. Apply for roles, cast your vote, or view results.</p>
        </header>

        <PublicFilterCard
          title="Find elections"
          subtitle="Search by election title or filter by society."
          search={{
            id: "elections-search",
            value: search,
            onChange: (e) => setSearch(e.target.value),
            placeholder: "Search elections or societies...",
          }}
          headerAction={
            hasActiveFilters ? (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setSelectedSociety("All");
                }}
                className="flex items-center gap-1 text-xs font-semibold hover:underline"
                style={{ color: COLORS.primary }}
              >
                <X size={12} strokeWidth={2.5} /> Clear
              </button>
            ) : null
          }
        >
          {societyOptions.length > 0 ? (
            <PublicFilterChipGroup label="By society">
              <PublicFilterChip active={selectedSociety === "All"} onClick={() => setSelectedSociety("All")}>
                All societies
              </PublicFilterChip>
              {societyOptions.map((society) => (
                <PublicFilterChip
                  key={society}
                  active={selectedSociety === society}
                  className="max-w-[min(100%,14rem)]"
                  onClick={() => setSelectedSociety(selectedSociety === society ? "All" : society)}
                >
                  <span className="line-clamp-2">{society}</span>
                </PublicFilterChip>
              ))}
            </PublicFilterChipGroup>
          ) : null}
        </PublicFilterCard>

        {loading ? <div className="py-16 text-center"><p className="text-sm" style={{ color: COLORS.textMuted }}>Loading elections...</p></div> : null}
        {!loading && !hasResults ? <div className="rounded-xl border py-16 text-center" style={{ backgroundColor: COLORS.surface, borderColor: COLORS.border }}><div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full" style={{ backgroundColor: "rgba(29, 78, 216, 0.12)" }}><Users size={24} style={{ color: COLORS.primary }} /></div><h3 className="mb-2 text-base font-semibold" style={{ color: COLORS.text }}>No elections found</h3><p className="text-sm" style={{ color: COLORS.textMuted }}>{search ? "Try adjusting your search terms." : "Check back later for upcoming elections."}</p></div> : null}
        {!loading && hasResults ? <div className="space-y-10">{Object.keys(filtered).map((society) => <section key={society}><div className="mb-5 flex items-center gap-3 border-b pb-3" style={{ borderBottom: `1px solid ${COLORS.borderLight}` }}><div className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ backgroundColor: "rgba(29, 78, 216, 0.12)" }}><Users size={18} style={{ color: COLORS.primary }} /></div><h2 className="text-xl font-semibold" style={{ color: COLORS.text }}>{society}</h2></div><div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">{filtered[society].map((e) => { const status = statusConfig[e.status] || statusConfig.COMPLETED; return <article key={e._id} className="overflow-hidden rounded-xl border transition-all duration-200 hover:shadow-sm" style={{ backgroundColor: COLORS.surface, borderColor: COLORS.border, boxShadow: "0 1px 3px rgba(30, 64, 175, 0.06)" }}><div className="border-b p-5" style={{ borderColor: COLORS.borderLight }}><div className="mb-3 flex items-start justify-between gap-3"><h3 className="text-base font-semibold leading-tight" style={{ color: COLORS.text }}>{e.title}</h3><span className="whitespace-nowrap rounded-md px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide" style={{ backgroundColor: status.bg, color: status.text, border: `1px solid ${status.border}` }}>{status.label}</span></div><p className="text-xs" style={{ color: COLORS.textMuted }}>{e.status === "APPLICATIONS_OPEN" ? "Apply for available roles" : e.status === "VOTING_LIVE" ? "Voting is now open" : e.status === "COMPLETED" ? "Results available" : "Election updates available"}</p></div><div className="space-y-4 p-5"><div className="flex items-center gap-2 text-xs" style={{ color: COLORS.textMuted }}><Calendar size={14} style={{ color: COLORS.accent }} /><span>{e.status === "APPLICATIONS_OPEN" ? `Apply by ${formatDate(e.applyDeadline)}` : `${formatDate(e.startDate)} -> ${formatDate(e.endDate)}`}</span></div></div><div className="p-5 pt-0">{e.status === "APPLICATIONS_CLOSED" ? <p className="text-center text-xs font-semibold" style={{ color: COLORS.textMuted }}>Voting for this election will start soon</p> : <button onClick={() => handleAction(e)} className="flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-semibold text-white transition-colors" style={{ backgroundColor: COLORS.primary }}>{e.status === "APPLICATIONS_OPEN" ? "Apply Now" : e.status === "VOTING_LIVE" ? "Vote Now" : e.status === "COMPLETED" ? "View Results" : "View Details"} <ChevronRight size={12} /></button>}</div></article>; })}</div></section>)}</div> : null}
      </div>
    </div>
  );
}
