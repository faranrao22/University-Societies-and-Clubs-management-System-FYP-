import React, { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import API_BASE_URL, { uploadFileUrl } from "../../../config/api.config";
import { Trophy, Medal, Loader2, CalendarCheck2, Building2, ArrowLeft } from "lucide-react";

const COLORS = {
  bg: "#e2e8f0",
  surface: "#FFFFFF",
  dark: "#1e3a8a",
  gold: "#38bdf8",
  text: "#111827",
  muted: "#4B5563",
  border: "rgba(30, 64, 175, 0.16)",
};

export default function ElectionResultsPage() {
  const { id } = useParams();
  const { data, isPending: loading } = useQuery({
    queryKey: ["public", "election-results", id],
    queryFn: async () => {
      const res = await axios.get(`${API_BASE_URL}/election/finalResults/${id}`, { withCredentials: true });
      return res.data || null;
    },
    enabled: Boolean(id),
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    retry: 1,
  });

  const winnersByRole = useMemo(() => {
    if (!data) return [];

    const official = Array.isArray(data.officialWinners) ? data.officialWinners : [];
    const roleMap = data.results || {};
    if (data.rolesAssigned && official.length > 0) {
      return official.map((w) => {
        const roleCandidates = Array.isArray(roleMap[w.role]) ? roleMap[w.role] : [];
        const officialId = String(w.candidateId || "");
        const fromResults =
          roleCandidates.find((c) => {
            const cid = String(c.candidateId || c._id || c.userId || "");
            return officialId && cid === officialId;
          }) ||
          roleCandidates.find((c) => String(c.fullname || "").trim().toLowerCase() === String(w.fullname || "").trim().toLowerCase()) ||
          null;
        const resolvedImage =
          (typeof w.image === "string" && w.image.trim()) ||
          (typeof fromResults?.image === "string" && fromResults.image.trim()) ||
          null;
        return {
          role: w.role,
          winner: {
            candidateId: w.candidateId,
            fullname: w.fullname || fromResults?.fullname,
            email: w.email,
            image: resolvedImage,
            Department: w.Department || fromResults?.Department,
            semester: w.semester || fromResults?.semester,
          },
          maxVotes: Number(w.votes) || 0,
          isOfficial: true,
        };
      });
    }

    return Object.entries(roleMap)
      .map(([role, candidates]) => {
        const list = Array.isArray(candidates) ? candidates : [];
        if (list.length === 0) return null;
        const sorted = [...list].sort((a, b) => {
          const vb = Number(b.votes) || 0;
          const va = Number(a.votes) || 0;
          if (vb !== va) return vb - va;
          return (a.candidateId || "").localeCompare(b.candidateId || "", undefined, { sensitivity: "base" });
        });
        const topVotes = Number(sorted[0].votes) || 0;
        if (topVotes === 0) return { role, winner: null, maxVotes: 0, isOfficial: false };
        return { role, winner: sorted[0], maxVotes: topVotes, isOfficial: false };
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
        <section
          className="rounded-md border bg-white p-5 shadow-sm sm:p-6"
          style={{ borderColor: COLORS.border, boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04)" }}
        >
          <Link
            to="/applyForElections"
            className="mb-4 inline-flex items-center gap-1.5 rounded-md border bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition hover:bg-slate-50"
            style={{ borderColor: COLORS.border, color: COLORS.dark }}
          >
            <ArrowLeft size={14} strokeWidth={2.5} />
            Elections
          </Link>
          <p className="mb-2 inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider" style={{ backgroundColor: `${COLORS.gold}20`, color: COLORS.dark }}>
            <CalendarCheck2 size={13} />
            {data.rolesAssigned ? "Official result" : "Vote totals"}
          </p>
          {!data.rolesAssigned ? (
            <p className="mb-3 text-xs sm:text-sm" style={{ color: COLORS.muted }}>
              Society has not confirmed winners yet. Showing leading candidate per role (highest votes; ties broken by candidate ID).
            </p>
          ) : null}
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl" style={{ color: COLORS.text }}>
            {data.title || "Election result"}
          </h1>
          <div className="mt-2 inline-flex items-center gap-1.5 rounded-md border bg-white px-2.5 py-1 text-xs font-semibold" style={{ borderColor: COLORS.border, color: COLORS.muted }}>
            <Building2 size={13} style={{ color: COLORS.gold }} />
            Society: <span style={{ color: COLORS.text }}>{data.societyName || "—"}</span>
          </div>
        </section>

        {winnersByRole.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed bg-white p-10 text-center text-sm" style={{ borderColor: COLORS.border, color: COLORS.muted }}>
            No winners have been finalized yet.
          </div>
        ) : (
          <section className="mt-6 grid gap-4 md:grid-cols-2 lg:gap-5">
            {winnersByRole.map(({ role, winner, maxVotes, isOfficial }) => (
              <article
                key={role}
                className="overflow-hidden rounded-md border bg-white shadow-sm"
                style={{ borderColor: COLORS.border, boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04)" }}
              >
                <div className="flex items-center justify-between gap-3 border-b px-4 py-3.5 sm:px-5" style={{ borderColor: COLORS.border }}>
                  <h2 className="flex items-center gap-2 text-base font-bold tracking-tight" style={{ color: COLORS.text }}>
                    <Medal size={18} style={{ color: COLORS.gold }} />
                    {role}
                  </h2>
                  {winner ? (
                    <span className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide" style={{ backgroundColor: `${COLORS.dark}12`, color: COLORS.dark }}>
                      <Trophy size={12} />
                      {isOfficial ? "Winner" : "Leading"}
                    </span>
                  ) : null}
                </div>

                {!winner ? (
                  <p className="px-4 py-5 text-sm sm:px-5" style={{ color: COLORS.muted }}>
                    No votes were cast for this role.
                  </p>
                ) : (
                  <div className="p-4 sm:p-5">
                    {(() => {
                      const candidateImg =
                        uploadFileUrl(winner.image) ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(winner.fullname || "Candidate")}&background=1e3a8a&color=ffffff&size=512`;
                      return (
                        <img
                          src={candidateImg}
                          alt={winner.fullname || "Winner"}
                          className="mb-4 h-52 w-full rounded-md object-cover sm:h-56"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src =
                              "https://ui-avatars.com/api/?name=Candidate&background=1e3a8a&color=ffffff&size=512";
                          }}
                        />
                      );
                    })()}

                    <div className="min-w-0">
                      <p className="truncate text-lg font-bold" style={{ color: COLORS.text }}>{winner.fullname || "Unnamed winner"}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs font-semibold" style={{ color: COLORS.muted }}>
                        <span>{winner.Department || "Department not provided"}</span>
                        <span>•</span>
                        <span>{winner.semester ? `Semester ${winner.semester}` : "Semester not provided"}</span>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between border-t border-dashed pt-2.5" style={{ borderColor: COLORS.border }}>
                      <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: COLORS.muted }}>Votes</p>
                      <p className="text-xl font-bold" style={{ color: COLORS.dark }}>{maxVotes}</p>
                    </div>
                  </div>
                )}
              </article>
            ))}
          </section>
        )}
      </div>
    </div>
  );
}
