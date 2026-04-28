import React, { useEffect } from "react";
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
  Loader2,
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
  const totalUsers = d.totalUsers ?? 0;
  const students = d.students ?? 0;
  const managers = d.managers ?? 0;
  const admins = d.admins ?? 0;
  const societies = d.societies ?? 0;
  const activeSocieties = d.activeSocieties ?? 0;
  const events = d.events ?? 0;
  const elections = d.elections ?? 0;
  const pendingJoinRequests = d.pendingJoinRequests ?? 0;

  return (
    <div className={a.page}>
      <header className={a.headerRow}>
        <div className="min-w-0">
          <h1 className={a.h1}>Admin Dashboard</h1>
          <p className={a.lead}>Clean overview of real platform data.</p>
        </div>
      </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-20 text-slate-500">
          <Loader2 className="h-9 w-9 animate-spin text-indigo-600" strokeWidth={1.5} />
          <p className="mt-3 text-sm font-medium">Loading dashboard...</p>
        </div>
      ) : (
        <>
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <AdminKpiCard
              icon={Users}
              label="Total users"
              value={totalUsers.toLocaleString()}
              hint={`${students.toLocaleString()} students · ${managers.toLocaleString()} managers · ${admins.toLocaleString()} admins`}
              iconClassName="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-indigo-100 bg-indigo-50 text-indigo-700"
            />
            <AdminKpiCard
              icon={Building2}
              label="Societies"
              value={societies.toLocaleString()}
              hint={`${activeSocieties.toLocaleString()} active`}
              iconClassName="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-sky-100 bg-sky-50 text-sky-700"
            />
            <AdminKpiCard
              icon={CalendarDays}
              label="Events"
              value={events.toLocaleString()}
              hint="Across all societies"
              iconClassName="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-violet-100 bg-violet-50 text-violet-700"
            />
            <AdminKpiCard
              icon={Vote}
              label="Elections"
              value={elections.toLocaleString()}
              hint="All election records"
              iconClassName="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50 text-emerald-700"
            />
            <AdminKpiCard
              icon={Inbox}
              label="Pending join requests"
              value={pendingJoinRequests.toLocaleString()}
              hint="Awaiting manager review"
              iconClassName="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-amber-100 bg-amber-50 text-amber-800"
            />
          </section>

          <section>
            <div className={a.cardPadded}>
              <h2 className="mb-3 text-sm font-semibold tracking-tight text-slate-900">Quick actions</h2>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                <Link to="/admin/users" className={a.linkRow}>
                  <div>
                    <p className={a.linkRowTitle}>Users</p>
                    <p className={a.linkRowDesc}>Manage accounts and roles</p>
                  </div>
                </Link>
                <Link to="/admin/societies" className={a.linkRow}>
                  <div>
                    <p className={a.linkRowTitle}>Societies</p>
                    <p className={a.linkRowDesc}>Review society records</p>
                  </div>
                </Link>
                <Link to="/admin/events" className={a.linkRow}>
                  <div>
                    <p className={a.linkRowTitle}>Events</p>
                    <p className={a.linkRowDesc}>Check event listings</p>
                  </div>
                </Link>
                <Link to="/admin/elections" className={a.linkRow}>
                  <div>
                    <p className={a.linkRowTitle}>Elections</p>
                    <p className={a.linkRowDesc}>Monitor election records</p>
                  </div>
                </Link>
                <Link to="/admin/managers" className={a.linkRow}>
                  <div>
                    <p className={a.linkRowTitle}>Managers</p>
                    <p className={a.linkRowDesc}>Maintain manager list</p>
                  </div>
                </Link>
                <Link to="/admin/societyRequests" className={a.linkRow}>
                  <div>
                    <p className={a.linkRowTitle}>Society requests</p>
                    <p className={a.linkRowDesc}>Approve or reject requests</p>
                  </div>
                </Link>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
