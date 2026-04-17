import React, { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import API_BASE_URL, { uploadFileUrl } from "../../../config/api.config";
import { Trophy, Medal, Loader2, CalendarCheck2, Users } from "lucide-react";

const COLORS = {
  bg: "#e2e8f0",
  surface: "#FFFFFF",
  dark: "#1e3a8a",
  gold: "#38bdf8",
  text: "#111827",
  muted: "#4B5563",
  border: "rgba(30, 64, 175, 0.16)",
};

const AVATAR_FALLBACK =
  "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?q=80&w=300&auto=format&fit=crop";

export default function ElectionResultsPage() {
  const { id } = useParams();
  const { data, isPending: loading } = useQuery({
    queryKey: ["public", "election-results", id],
    queryFn: async () => {
      const res = await axios.get(`${API_BASE_URL}/election/Finalresults/${id}`, { withCredentials: true });
      return res.data || null;
    },
    enabled: Boolean(id),
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    retry: 1,
  });

  const winnersByRole = useMemo(() => {
    const roleMap = data?.results || {};
    return Object.entries(roleMap)
      .map(([role, candidates]) => {
        const list = Array.isArray(candidates) ? candidates : [];
        if (list.length === 0) return null;
        const maxVotes = Math.max(...list.map((c) => Number(c.votes) || 0));
        const winners = list.filter((c) => (Number(c.votes) || 0) === maxVotes);
        return { role, winners, maxVotes };
      })
      .filter(Boolean);
  }, [data]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center gap-3" style={{ backgroundColor: COLORS.bg, color: COLORS.muted }}>
        <Loader2 className="animate-spin" />
        <span className="text-sm font-medium">Loading results…</span>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6" style={{ backgroundColor: COLORS.bg }}>
        <div className="rounded-2xl border bg-white p-8 text-center shadow-sm" style={{ borderColor: COLORS.border }}>
          <p className="text-lg font-semibold" style={{ color: COLORS.text }}>
            Failed to load election results.
          </p>
          <Link
            to="/applyForElections"
            className="mt-4 inline-flex items-center rounded-xl px-4 py-2 text-sm font-semibold text-white"
            style={{ backgroundColor: COLORS.dark }}
          >
            Back to elections
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-6 py-10 md:py-12" style={{ backgroundColor: COLORS.bg }}>
      <div className="mx-auto max-w-6xl">
        <section className="rounded-2xl border bg-white p-6 shadow-sm md:p-7" style={{ borderColor: COLORS.border }}>
          <p className="mb-2 inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider" style={{ backgroundColor: `${COLORS.gold}20`, color: COLORS.dark }}>
            <CalendarCheck2 size={13} />
            Official result
          </p>
          <h1 className="text-2xl font-black tracking-tight sm:text-3xl" style={{ color: COLORS.text }}>
            {data.title || "Election result"}
          </h1>
          <p className="mt-1 text-sm sm:text-base" style={{ color: COLORS.muted }}>
            Society: <span className="font-semibold" style={{ color: COLORS.text }}>{data.societyName || "—"}</span>
          </p>
        </section>

        {winnersByRole.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed bg-white p-10 text-center text-sm" style={{ borderColor: COLORS.border, color: COLORS.muted }}>
            No winners have been finalized yet.
          </div>
        ) : (
          <section className="mt-8 grid gap-6 md:grid-cols-2">
            {winnersByRole.map(({ role, winners, maxVotes }) => (
              <article
                key={role}
                className="rounded-2xl border bg-white p-5 shadow-sm md:p-6"
                style={{ borderColor: COLORS.border }}
              >
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h2 className="flex items-center gap-2 text-lg font-black" style={{ color: COLORS.text }}>
                    <Medal size={18} style={{ color: COLORS.gold }} />
                    {role}
                  </h2>
                  <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide" style={{ backgroundColor: `${COLORS.dark}12`, color: COLORS.dark }}>
                    <Trophy size={12} />
                    Winner
                  </span>
                </div>

                <div className="space-y-4">
                  {winners.map((winner, idx) => (
                    <div
                      key={winner.candidateId || `${role}-${idx}`}
                      className="flex items-center gap-4 rounded-xl border p-3.5"
                      style={{ borderColor: COLORS.border, backgroundColor: "#FCFFFD" }}
                    >
                      <img
                        src={uploadFileUrl(winner.image) || AVATAR_FALLBACK}
                        alt={winner.fullname || "Winner"}
                        className="h-16 w-16 rounded-xl object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-base font-bold" style={{ color: COLORS.text }}>
                          {winner.fullname || "Unnamed winner"}
                        </p>
                        <p className="mt-0.5 text-sm" style={{ color: COLORS.muted }}>
                          {winner.Department || "Department not provided"}
                        </p>
                        <p className="text-xs" style={{ color: COLORS.muted }}>
                          {winner.semester ? `Semester ${winner.semester}` : "Semester not provided"}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: COLORS.muted }}>
                          Votes
                        </p>
                        <p className="text-lg font-black" style={{ color: COLORS.dark }}>
                          {maxVotes}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {winners.length > 1 ? (
                  <p className="mt-3 inline-flex items-center gap-1 text-xs font-semibold" style={{ color: COLORS.muted }}>
                    <Users size={12} />
                    Tie: {winners.length} winners with equal votes.
                  </p>
                ) : null}
              </article>
            ))}
          </section>
        )}
      </div>
    </div>
  );
}
