import React, { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  Users,
  UserCog,
  Shield,
  GraduationCap,
  Building2,
  CalendarDays,
  Vote,
  Inbox,
  ChevronRight,
  Loader2,
  ArrowRight,
  TrendingUp,
  Flame,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../../context/AuthContext";
import { adminUi as a } from "../components/adminUi";
import { fetchAdminStats } from "../api/adminApi";
import { adminKeys } from "../api/adminQueryKeys";
import AdminKpiCard from "../components/AdminKpiCard";

export default function AdminDashboard() {
  const { user } = useAuth();
  const {
    data: stats,
    isPending: loading,
    isError,
    error,
  } = useQuery({
    queryKey: adminKeys.stats(),
    queryFn: fetchAdminStats,
    staleTime: 2 * 60 * 1000,
  });

  useEffect(() => {
    if (isError) {
      toast.error(error?.response?.data?.message || "Could not load dashboard stats");
    }
  }, [isError, error]);

  const d = stats || {};
  const societyTotal = d.societies ?? 0;
  const activeShare =
    societyTotal > 0 && d.activeSocieties != null
      ? Math.round((d.activeSocieties / societyTotal) * 100)
      : null;

  const first = user?.fullname?.split?.(" ")?.[0];

  const activity = useMemo(() => {
    const items = [];
    if (d.totalUsers != null) {
      items.push({
        title: "Directory",
        sub: `${d.totalUsers.toLocaleString()} accounts on record`,
        tone: "indigo",
      });
    }
    if (d.pendingJoinRequests != null && d.pendingJoinRequests > 0) {
      items.push({
        title: "Join requests",
        sub: `${d.pendingJoinRequests} pending across societies`,
        tone: "amber",
      });
    }
    if (d.activeSocieties != null && d.societies != null) {
      items.push({
        title: "Society registry",
        sub: `${d.activeSocieties} active · ${d.societies} total`,
        tone: "sky",
      });
    }
    if (d.events != null) {
      items.push({
        title: "Events",
        sub: `${d.events} scheduled programmes`,
        tone: "violet",
      });
    }
    while (items.length < 4) {
      items.push({
        title: "Platform sync",
        sub: "Figures refresh when you open this page.",
        tone: "slate",
      });
    }
    return items.slice(0, 5);
  }, [d]);

  const badgeGreen = (text) => (
    <span className="inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-800 ring-1 ring-emerald-100">
      {text}
    </span>
  );
  const badgeAmber = (text) => (
    <span className="inline-flex rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-900 ring-1 ring-amber-100">
      {text}
    </span>
  );

  const quick = [
    { to: "/admin/users", label: "User directory", desc: "Roles, invites, and exports" },
    { to: "/admin/societies", label: "Society registry", desc: "Leads, status, and records" },
    { to: "/admin/events", label: "Events", desc: "Venues and schedules" },
    { to: "/admin/societyRequests", label: "Activation queue", desc: "Inactive societies" },
  ];

  return (
    <div className={a.page}>
      <header className="max-w-3xl">
        <p className={a.eyebrow}>Live snapshot</p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Platform overview</h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-500">
          {first ? `${first}, ` : ""}
          high-level engagement and registry health across users, societies, and programmes. Numbers update each time
          you visit this screen.
        </p>
      </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-24 text-slate-500">
          <Loader2 className="h-9 w-9 animate-spin text-indigo-600" strokeWidth={1.5} />
          <p className="mt-3 text-sm font-medium">Loading overview…</p>
        </div>
      ) : (
        <>
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <AdminKpiCard
              icon={Users}
              label="Total active users"
              value={d.totalUsers?.toLocaleString()}
              hint="All roles combined"
              badge={badgeGreen("Live")}
              iconClassName="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-indigo-100 bg-indigo-50 text-indigo-700"
            />
            <AdminKpiCard
              icon={Building2}
              label="Societies registered"
              value={d.societies?.toLocaleString()}
              hint={`${d.activeSocieties ?? "—"} marked active`}
              badge={activeShare != null ? badgeGreen(`${activeShare}%`) : badgeGreen("Stable")}
              iconClassName="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-sky-100 bg-sky-50 text-sky-700"
            />
            <AdminKpiCard
              icon={CalendarDays}
              label="Events"
              value={d.events?.toLocaleString()}
              hint="Across all societies"
              badge={badgeGreen("Programmes")}
              iconClassName="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-violet-100 bg-violet-50 text-violet-700"
            />
            <AdminKpiCard
              icon={Inbox}
              label="Pending join requests"
              value={d.pendingJoinRequests?.toLocaleString() ?? "0"}
              hint="Awaiting manager review"
              badge={
                (d.pendingJoinRequests ?? 0) > 5 ? badgeAmber("High activity") : badgeGreen("Healthy")
              }
              iconClassName="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-amber-100 bg-amber-50 text-amber-800"
            />
          </section>

          <section className="grid grid-cols-1 gap-6">
            <div className={a.cardPadded}>
              <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-4">
                <h2 className="text-sm font-semibold tracking-tight text-slate-900">Recent activity</h2>
                <Link to="/admin/users" className={a.linkSubtle}>
                  View all
                </Link>
              </div>
              <ul className="mt-4 space-y-4">
                {activity.map((row, i) => (
                  <li key={i} className="flex gap-3">
                    <div
                      className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white shadow-sm ${
                        row.tone === "amber"
                          ? "bg-gradient-to-br from-amber-500 to-orange-600"
                          : row.tone === "sky"
                            ? "bg-gradient-to-br from-sky-500 to-indigo-600"
                            : row.tone === "violet"
                              ? "bg-gradient-to-br from-violet-500 to-purple-700"
                              : row.tone === "slate"
                                ? "bg-gradient-to-br from-slate-400 to-slate-600"
                                : "bg-gradient-to-br from-indigo-600 to-violet-600"
                      }`}
                      aria-hidden
                    >
                      {String(i + 1)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900">{row.title}</p>
                      <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{row.sub}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section className="grid grid-cols-1 gap-6 lg:grid-cols-5">
            <div className={`${a.insightCard} lg:col-span-3`}>
              <span className={a.insightBadge}>Management insight</span>
              <h2 className={`${a.insightTitle} mt-2`}>Empowering your leads for better engagement.</h2>
              <p className={a.insightLead}>
                Keep society presidents and managers aligned with clear queues for requests, elections, and events —
                the same structure your reference console uses for day-to-day oversight.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  to="/admin/managers"
                  className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white ring-1 ring-white/25 transition hover:bg-white/15"
                >
                  <UserCog size={16} />
                  Manager roster
                </Link>
                <Link
                  to="/admin/elections"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-indigo-900 shadow-sm transition hover:bg-indigo-50"
                >
                  <Vote size={16} />
                  Elections
                </Link>
              </div>
            </div>

            <div className={`${a.cardPadded} lg:col-span-2`}>
              <div className="mb-4 flex items-center gap-2 text-slate-900">
                <Flame size={18} className="text-indigo-600" strokeWidth={1.75} />
                <h2 className="text-sm font-semibold tracking-tight">Quick actions</h2>
              </div>
              <ul className="space-y-1">
                {quick.map((item) => (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      className="flex items-center justify-between gap-3 rounded-xl px-3 py-3 text-sm transition hover:bg-slate-50"
                    >
                      <span className="min-w-0">
                        <span className="block font-medium text-slate-900">{item.label}</span>
                        <span className="mt-0.5 block text-xs text-slate-500">{item.desc}</span>
                      </span>
                      <ArrowRight size={16} className="shrink-0 text-slate-300" />
                    </Link>
                  </li>
                ))}
              </ul>
              <Link
                to="/admin/managers"
                className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-indigo-700 hover:text-indigo-900"
              >
                <TrendingUp size={14} />
                Manager coverage
              </Link>
            </div>
          </section>

          <section>
            <div className={a.sectionHead}>
              <h3 className={a.sectionHeading}>Role mix</h3>
              <p className={a.sectionSub}>Headcount by account type</p>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className={a.statTile}>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-indigo-100 bg-indigo-50 text-indigo-700">
                  <Users size={18} strokeWidth={1.75} />
                </div>
                <p className={a.statLabel}>Total users</p>
                <p className={a.statValue}>{d.totalUsers?.toLocaleString()}</p>
              </div>
              <div className={a.statTile}>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-sky-100 bg-sky-50 text-sky-700">
                  <GraduationCap size={18} strokeWidth={1.75} />
                </div>
                <p className={a.statLabel}>Students</p>
                <p className={a.statValue}>{d.students?.toLocaleString()}</p>
              </div>
              <div className={a.statTile}>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-violet-100 bg-violet-50 text-violet-700">
                  <UserCog size={18} strokeWidth={1.75} />
                </div>
                <p className={a.statLabel}>Managers</p>
                <p className={a.statValue}>{d.managers?.toLocaleString()}</p>
              </div>
              <div className={a.statTile}>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-amber-100 bg-amber-50 text-amber-800">
                  <Shield size={18} strokeWidth={1.75} />
                </div>
                <p className={a.statLabel}>Admins</p>
                <p className={a.statValue}>{d.admins?.toLocaleString()}</p>
              </div>
            </div>
          </section>

          <section>
            <div className={a.sectionHead}>
              <h3 className={a.sectionHeading}>Shortcuts</h3>
              <p className={a.sectionSub}>Jump to a workspace</p>
            </div>
            <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { to: "/admin/users", label: "User accounts", desc: "Roles and directory" },
                { to: "/admin/societies", label: "Societies", desc: "Records and exports" },
                { to: "/admin/events", label: "Events", desc: "Scheduled activities" },
                { to: "/admin/elections", label: "Elections", desc: "Votes and candidates" },
                { to: "/admin/societyRequests", label: "Society requests", desc: "Activation queue" },
              ].map((item) => (
                <li key={item.to}>
                  <Link to={item.to} className={a.linkRow}>
                    <div className="min-w-0">
                      <p className={a.linkRowTitle}>{item.label}</p>
                      <p className={a.linkRowDesc}>{item.desc}</p>
                    </div>
                    <ChevronRight size={16} className="shrink-0 text-slate-300" strokeWidth={2} />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </div>
  );
}
