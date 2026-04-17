import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../../context/AuthContext";
import API_BASE_URL from "../../../config/api.config";
import {
  Users, Calendar, Vote, FileText, Clock, TrendingUp,
  ChevronRight, Plus, Eye, Settings, Bell, CheckCircle2,
  AlertCircle, Loader2
} from "lucide-react";

// 🔹 Sober Color Tokens
const COLORS = {
  primary: "#3699FF",
  primaryHover: "#2B8ACF",
  accent: "#3699FF",
  bg: "#f4f7f6",
  surface: "#FFFFFF",
  text: "#111827",
  textMuted: "#4B5563",
  border: "rgba(229, 231, 235, 1)",
  borderLight: "rgba(54, 153, 255, 0.08)",
  success: "#10B981",
  warning: "#F59E0B",
  danger: "#DC2626",
};

// 🔹 Stat Card Component
const StatCard = ({ icon: Icon, label, value, trend, color, onClick }) => (
  <button
    onClick={onClick}
    className="w-full text-left p-5 rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-200 hover:shadow-md"
    style={{ backgroundColor: COLORS.surface }}
  >
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide mb-1" style={{ color: COLORS.textMuted }}>
          {label}
        </p>
        <p className="text-2xl font-bold" style={{ color: COLORS.text }}>{value}</p>
        {trend && (
          <p className="text-xs mt-1 flex items-center gap-1" style={{ color: trend > 0 ? COLORS.success : COLORS.danger }}>
            <TrendingUp size={12} className={trend < 0 ? "rotate-180" : ""} />
            {Math.abs(trend)}% this month
          </p>
        )}
      </div>
      <div 
        className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: `${color}15` }}
      >
        <Icon size={20} style={{ color }} />
      </div>
    </div>
  </button>
);

// 🔹 Activity Item Component
const ActivityItem = ({ icon: Icon, title, desc, time, status }) => (
  <div className="flex items-start gap-3 py-3 border-b last:border-b-0" style={{ borderColor: COLORS.borderLight }}>
    <div 
      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
      style={{ backgroundColor: `${COLORS.primary}10` }}
    >
      <Icon size={14} style={{ color: COLORS.primary }} />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium truncate" style={{ color: COLORS.text }}>{title}</p>
      <p className="text-xs truncate" style={{ color: COLORS.textMuted }}>{desc}</p>
    </div>
    <div className="text-right flex-shrink-0">
      <p className="text-[10px] font-medium" style={{ color: COLORS.textMuted }}>{time}</p>
      {status && (
        <span 
          className="inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded"
          style={{ 
            backgroundColor: status === "approved" ? "rgba(16, 185, 129, 0.1)" : 
                           status === "pending" ? "rgba(245, 158, 11, 0.1)" : 
                           "rgba(220, 38, 38, 0.1)",
            color: status === "approved" ? COLORS.success :
                   status === "pending" ? COLORS.warning : COLORS.danger
          }}
        >
          {status}
        </span>
      )}
    </div>
  </div>
);

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [stats, setStats] = useState({
    societies: 0,
    events: 0,
    elections: 0,
    pendingRequests: 0,
    pendingVolunteers: 0,
    pendingApplications: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [user?._id]);

  const fetchDashboardData = async () => {
    if (!user?._id) return;
    
    try {
      setLoading(true);
      const [societiesRes, eventsRes, electionsRes, requestsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/societies/Mysocieties/${user._id}`, { withCredentials: true }),
        axios.get(`${API_BASE_URL}/event/myevents`, { withCredentials: true }),
        axios.get(`${API_BASE_URL}/election/my-drafts`, { withCredentials: true }),
        axios.get(`${API_BASE_URL}/memberShip/requests`, { withCredentials: true }),
      ]);

      const societies = societiesRes.data.data || [];
      const events = eventsRes.data.data || [];
      const elections = electionsRes.data.data || [];
      const requests = requestsRes.data.data || [];

      // Calculate pending counts
      const pendingVolunteers = events.reduce((acc, e) => acc + (e.volunteerRequests?.filter(r => r.status === "pending").length || 0), 0);
      const pendingApplications = elections.reduce((acc, e) => acc + (e.applications?.filter(a => a.status === "pending").length || 0), 0);
      const pendingJoinRequests = requests.filter(r => r.status === "pending").length;

      setStats({
        societies: societies.length,
        events: events.length,
        elections: elections.length,
        pendingRequests: pendingJoinRequests,
        pendingVolunteers,
        pendingApplications,
      });

      // Build recent activity feed
      const activity = [];
      
      societies.slice(0, 3).forEach(s => {
        activity.push({
          icon: Users,
          title: `New society: ${s.name}`,
          desc: "Society created",
          time: new Date(s.createdAt).toLocaleDateString(),
        });
      });
      
      events.slice(0, 2).forEach(e => {
        activity.push({
          icon: Calendar,
          title: `Event: ${e.title}`,
          desc: e.status === "upcoming" ? "Upcoming" : "Completed",
          time: new Date(e.date).toLocaleDateString(),
          status: e.status,
        });
      });
      
      requests.slice(0, 3).forEach(r => {
        activity.push({
          icon: FileText,
          title: `Join request: ${r.user?.fullname || "User"}`,
          desc: `For ${r.society?.name || "Society"}`,
          time: new Date(r.createdAt).toLocaleDateString(),
          status: r.status,
        });
      });

      setRecentActivity(activity.sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 5));

    } catch (err) {
      console.error("Failed to fetch dashboard data", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: COLORS.bg }}>
        <div className="text-center">
          <Loader2 className="animate-spin mx-auto mb-4" size={32} style={{ color: COLORS.primary }} />
          <p className="text-sm" style={{ color: COLORS.textMuted }}>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-6" style={{ backgroundColor: COLORS.bg }}>
      <div className="max-w-6xl mx-auto">
        
        {/* 🔹 Header */}
        <header className="flex items-start justify-between mb-8">
          <div>
            <h1 className="manager-page-title mb-1" style={{ color: COLORS.text }}>
              Manager Dashboard
            </h1>
            <p className="text-sm" style={{ color: COLORS.textMuted }}>
              Welcome back, {user?.fullname || "Manager"} • {user?.Department}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              className="p-2.5 rounded-lg transition-colors"
              style={{ backgroundColor: COLORS.surface, border: `1px solid ${COLORS.border}` }}
              title="Notifications"
            >
              <Bell size={18} style={{ color: COLORS.textMuted }} />
            </button>
            <button 
              onClick={() => navigate("/profile")}
              className="p-2.5 rounded-lg transition-colors"
              style={{ backgroundColor: COLORS.surface, border: `1px solid ${COLORS.border}` }}
              title="Settings"
            >
              <Settings size={18} style={{ color: COLORS.textMuted }} />
            </button>
          </div>
        </header>

        {/* 🔹 Quick Actions */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          <button 
            onClick={() => navigate("/manager/societyform")}
            className="flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-colors"
            style={{ backgroundColor: COLORS.primary, color: "#fff" }}
          >
            <Plus size={16} /> New Society
          </button>
          <button 
            onClick={() => navigate("/manager/eventForm")}
            className="flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-colors border"
            style={{ backgroundColor: COLORS.surface, color: COLORS.text, borderColor: COLORS.border }}
          >
            <Calendar size={16} /> New Event
          </button>
          <button 
            onClick={() => navigate("/manager/election")}
            className="flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-colors border"
            style={{ backgroundColor: COLORS.surface, color: COLORS.text, borderColor: COLORS.border }}
          >
            <Vote size={16} /> New Election
          </button>
          <button 
            onClick={() => navigate("/manager/requests")}
            className="flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-colors border relative"
            style={{ backgroundColor: COLORS.surface, color: COLORS.text, borderColor: COLORS.border }}
          >
            <FileText size={16} /> Requests
            {stats.pendingRequests > 0 && (
              <span 
                className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center"
                style={{ backgroundColor: COLORS.danger, color: "#fff" }}
              >
                {stats.pendingRequests}
              </span>
            )}
          </button>
        </div>

        {/* 🔹 Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          <StatCard 
            icon={Users}
            label="Societies Managed"
            value={stats.societies}
            color={COLORS.primary}
            onClick={() => navigate("/manager/society")}
          />
          <StatCard 
            icon={Calendar}
            label="Events Created"
            value={stats.events}
            trend={12}
            color={COLORS.accent}
            onClick={() => navigate("/manager/events")}
          />
          <StatCard 
            icon={Vote}
            label="Elections Created"
            value={stats.elections}
            color={COLORS.primary}
            onClick={() => navigate("/manager/all-elections")}
          />
          <StatCard 
            icon={AlertCircle}
            label="Pending Join Requests"
            value={stats.pendingRequests}
            color={COLORS.warning}
            onClick={() => navigate("/manager/requests")}
          />
          <StatCard 
            icon={Clock}
            label="Pending Volunteers"
            value={stats.pendingVolunteers}
            color={COLORS.accent}
            onClick={() => navigate("/manager/volunteers")}
          />
          <StatCard 
            icon={FileText}
            label="Pending Applications"
            value={stats.pendingApplications}
            color={COLORS.primary}
            onClick={() => navigate("/manager/applications")}
          />
        </div>

        {/* 🔹 Two-Column Layout: Recent Activity + Quick Links */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <h2 className="manager-section-title" style={{ color: COLORS.text }}>
                  Recent Activity
                </h2>
                <button 
                  className="text-xs font-medium flex items-center gap-1"
                  style={{ color: COLORS.accent }}
                >
                  View All <ChevronRight size={12} />
                </button>
              </div>
              
              {recentActivity.length === 0 ? (
                <p className="text-sm text-center py-8" style={{ color: COLORS.textMuted }}>
                  No recent activity to display
                </p>
              ) : (
                <div>
                  {recentActivity.map((item, idx) => (
                    <ActivityItem key={idx} {...item} />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Links / Resources */}
          <div className="space-y-6">
            
            {/* Pending Actions */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="manager-section-title mb-4" style={{ color: COLORS.text }}>
                Pending Actions
              </h3>
              <div className="space-y-3">
                {stats.pendingRequests > 0 && (
                  <button 
                    onClick={() => navigate("/manager/requests")}
                    className="w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors"
                    style={{ backgroundColor: "rgba(245, 158, 11, 0.08)", border: `1px solid rgba(245, 158, 11, 0.2)` }}
                  >
                    <div className="flex items-center gap-3">
                      <AlertCircle size={16} style={{ color: COLORS.warning }} />
                      <span className="text-sm font-medium" style={{ color: COLORS.text }}>
                        {stats.pendingRequests} join requests
                      </span>
                    </div>
                    <ChevronRight size={16} style={{ color: COLORS.warning }} />
                  </button>
                )}
                {stats.pendingVolunteers > 0 && (
                  <button 
                    onClick={() => navigate("/manager/volunteers")}
                    className="w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors"
                    style={{ backgroundColor: "rgba(6, 182, 212, 0.08)", border: `1px solid rgba(6, 182, 212, 0.22)` }}
                  >
                    <div className="flex items-center gap-3">
                      <Clock size={16} style={{ color: COLORS.accent }} />
                      <span className="text-sm font-medium" style={{ color: COLORS.text }}>
                        {stats.pendingVolunteers} volunteer requests
                      </span>
                    </div>
                    <ChevronRight size={16} style={{ color: COLORS.accent }} />
                  </button>
                )}
                {stats.pendingApplications > 0 && (
                  <button 
                    onClick={() => navigate("/manager/applications")}
                    className="w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors"
                    style={{ backgroundColor: "rgba(54, 153, 255, 0.08)", border: `1px solid ${COLORS.border}` }}
                  >
                    <div className="flex items-center gap-3">
                      <FileText size={16} style={{ color: COLORS.primary }} />
                      <span className="text-sm font-medium" style={{ color: COLORS.text }}>
                        {stats.pendingApplications} election applications
                      </span>
                    </div>
                    <ChevronRight size={16} style={{ color: COLORS.primary }} />
                  </button>
                )}
                {stats.pendingRequests === 0 && stats.pendingVolunteers === 0 && stats.pendingApplications === 0 && (
                  <div className="flex items-center gap-2 text-sm py-2" style={{ color: COLORS.success }}>
                    <CheckCircle2 size={16} />
                    <span>All caught up! No pending actions.</span>
                  </div>
                )}
              </div>
            </div>

            {/* Resources */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="manager-section-title mb-4" style={{ color: COLORS.text }}>
                Resources
              </h3>
              <ul className="space-y-2">
                {[
                  { label: "Manager Guidelines", href: "#" },
                  { label: "Society Handbook", href: "#" },
                  { label: "Event Planning Tips", href: "#" },
                  { label: "Election Best Practices", href: "#" },
                  { label: "Contact Support", href: "/contact" },
                ].map((link, idx) => (
                  <li key={idx}>
                    <a 
                      href={link.href}
                      className="flex items-center gap-2 text-sm transition-colors hover:underline"
                      style={{ color: COLORS.textMuted }}
                    >
                      <ChevronRight size={14} style={{ color: COLORS.accent }} />
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}