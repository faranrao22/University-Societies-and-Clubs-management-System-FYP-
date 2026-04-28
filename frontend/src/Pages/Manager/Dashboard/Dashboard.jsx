import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../../context/AuthContext";
import API_BASE_URL from "../../../config/api.config";
import {
  Users,
  Calendar,
  Vote,
  FileText,
  Clock,
  AlertCircle,
  Plus,
  Loader2,
} from "lucide-react";

// 🔹 Sober Color Tokens
const COLORS = {
  primary: "#3699FF",
  accent: "#0ea5e9",
  warning: "#f59e0b",
  bg: "#e9eef5",
  surface: "#FFFFFF",
  text: "#111827",
  textMuted: "#4B5563",
  border: "rgba(229, 231, 235, 1)",
};

const MANAGER_CARD_CLASS =
  "rounded-xl border border-slate-200 bg-white shadow-sm transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-0.5 hover:border-[#3699FF]/35 hover:shadow-md";

const StatCard = ({ icon: Icon, label, value, color, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full p-5 text-left ${MANAGER_CARD_CLASS}`}
    style={{ backgroundColor: COLORS.surface }}
  >
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide mb-1" style={{ color: COLORS.textMuted }}>
          {label}
        </p>
        <p className="text-2xl font-bold" style={{ color: COLORS.text }}>{value}</p>
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
        
        <header className="mb-8">
          <div>
            <h1 className="manager-page-title mb-1" style={{ color: COLORS.text }}>Manager Dashboard</h1>
            <p className="text-sm" style={{ color: COLORS.textMuted }}>
              Real-time summary of your societies, events, elections, and pending work.
            </p>
          </div>
        </header>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
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
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
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

        <div className={`${MANAGER_CARD_CLASS} p-6`}>
          <h2 className="manager-section-title mb-4" style={{ color: COLORS.text }}>
            Pending Work
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <button
              onClick={() => navigate("/manager/requests")}
              className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-left transition hover:border-[#3699FF]/40 hover:bg-white"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Join Requests</p>
              <p className="mt-1 text-xl font-bold text-slate-900">{stats.pendingRequests}</p>
            </button>
            <button
              onClick={() => navigate("/manager/volunteers")}
              className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-left transition hover:border-[#3699FF]/40 hover:bg-white"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Volunteer Requests</p>
              <p className="mt-1 text-xl font-bold text-slate-900">{stats.pendingVolunteers}</p>
            </button>
            <button
              onClick={() => navigate("/manager/applications")}
              className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-left transition hover:border-[#3699FF]/40 hover:bg-white"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Election Applications</p>
              <p className="mt-1 text-xl font-bold text-slate-900">{stats.pendingApplications}</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}