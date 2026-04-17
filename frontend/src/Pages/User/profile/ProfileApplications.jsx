// src/pages/student/profile/sections/ProfileApplications.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../../context/AuthContext";
import API_BASE_URL from "../../../config/api.config";
import { 
  FileText, Calendar, Clock, ExternalLink, Building2, CheckCircle, 
  XCircle, Loader2, AlertCircle, RefreshCw, Trash2, Eye, UserCheck,
  BadgeCheck, Hourglass, Sparkles, ArrowRight
} from "lucide-react";

export default function ProfileApplications() {
  const { user } = useAuth();
  
  const [applications, setApplications] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all"); // all, pending, approved, rejected, member

  useEffect(() => {
    if (user === undefined) return;
    if (!user?._id) {
      if (user === null) setError("Please log in to view your applications.");
      setLoading(false);
      return;
    }
    
    const fetchApplications = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await axios.get(`${API_BASE_URL}/memberShip/my-applications`, {
          withCredentials: true, // ✅ Send cookies
        });

        if (res.data?.success) {
          setApplications(res.data.data || []);
          setSummary(res.data.summary || null);
        } else {
          setError(res.data?.message || "Failed to load applications");
        }
      } catch (err) {
        console.error("Failed to fetch applications:", err);
        setError(err.response?.data?.message || "Something went wrong. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [user]);

  // ✅ Helper: Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric", month: "short", day: "numeric"
    });
  };

  // ✅ Helper: Format date with time
  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
    });
  };

  // ✅ Helper: Get status badge styling
  const getStatusBadge = (status) => {
    const styles = {
      Pending: "bg-yellow-50 text-yellow-700 border-yellow-200 animate-pulse",
      Approved: "bg-green-50 text-green-700 border-green-200",
      Rejected: "bg-red-50 text-red-700 border-red-200",
      Member: "bg-blue-50 text-[#1e3a8a] border-blue-200",
      "Not Applied": "bg-gray-50 text-gray-600 border-gray-200",
    };
    return styles[status] || styles["Not Applied"];
  };

  // ✅ Helper: Get status icon
  const getStatusIcon = (status) => {
    const icons = {
      Pending: Hourglass,
      Approved: CheckCircle,
      Rejected: XCircle,
      Member: UserCheck,
      "Not Applied": FileText,
    };
    return icons[status] || FileText;
  };

  // ✅ Helper: Filter applications
  const filteredApps = applications.filter(app => {
    if (filter === "all") return true;
    if (filter === "pending") return app.application?.status === "Pending";
    if (filter === "approved") return app.application?.status === "Approved";
    if (filter === "rejected") return app.application?.status === "Rejected";
    if (filter === "member") return app.membershipStatus?.isMember;
    return true;
  });

  // ✅ Handler: Withdraw pending application
  const handleWithdraw = async (societyId, societyName) => {
    if (!window.confirm(`Withdraw your application to "${societyName}"?`)) return;

    try {
      const res = await axios.delete(`${API_BASE_URL}/societies/${societyId}/withdraw-application`, {
        withCredentials: true,
      });

      if (res.data?.success) {
        // Optimistic update
        setApplications(prev => 
          prev.map(app => 
            app.society._id === societyId 
              ? { ...app, application: null, displayStatus: "Not Applied" }
              : app
          )
        );
        // Update summary
        if (summary) {
          setSummary(prev => ({
            ...prev,
            pending: Math.max(0, (prev.pending || 0) - 1),
            total: Math.max(0, (prev.total || 0) - 1),
          }));
        }
      } else {
        alert(res.data?.message || "Failed to withdraw application");
      }
    } catch (err) {
      console.error("Withdraw error:", err);
      alert(err.response?.data?.message || "Error withdrawing application");
    }
  };

  // ✅ Handler: Reapply to rejected society
  const handleReapply = (societyId) => {
    window.location.href = `/societies/${societyId}/apply`;
  };

  // ✅ Handler: View society
  const handleViewSociety = (societyId) => {
    window.location.href = `/societies/${societyId}`;
  };

  // ✅ Handler: Refresh data
  const handleRefresh = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/societies/my-applications`, {
        withCredentials: true,
      });
      if (res.data?.success) {
        setApplications(res.data.data || []);
        setSummary(res.data.summary || null);
      }
    } catch (err) {
      console.error("Refresh error:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Loading State
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader2 className="animate-spin h-8 w-8 text-[#1e3a8a] mb-3" />
        <p className="text-sm text-gray-500">Loading your applications...</p>
      </div>
    );
  }

  // ✅ Error State
  if (error) {
    return (
      <div className="text-center py-12 bg-red-50 rounded-2xl border border-red-100">
        <AlertCircle className="w-10 h-10 mx-auto text-red-400 mb-3" />
        <p className="text-red-600 font-medium mb-2">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="text-sm text-red-700 hover:text-red-900 underline"
        >
          Retry
        </button>
      </div>
    );
  }

  // ✅ Empty State
  if (applications.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-[2rem] border border-gray-100">
        <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
        <h3 className="text-lg font-bold text-gray-900 mb-2">No Applications Yet</h3>
        <p className="text-gray-500 mb-6 max-w-sm mx-auto">
          You haven't applied to any societies yet. Browse societies and start applying!
        </p>
        <a href="/societies" className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1e3a8a] text-white rounded-xl font-medium shadow-md hover:brightness-110 transition">
          Browse Societies <ExternalLink size={16} />
        </a>
      </div>
    );
  }

  // ✅ Application Card Component
  const ApplicationCard = ({ app }) => {
    const { society, application, membershipStatus, displayStatus } = app;
    const StatusIcon = getStatusIcon(displayStatus);
    const isPending = application?.status === "Pending";
    const isRejected = application?.status === "Rejected";
    const isMember = membershipStatus?.isMember;
    const canWithdraw = application?.canWithdraw;
    const canReapply = application?.canReapply;

    return (
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl transition">
        
        {/* 🎨 Header Banner */}
        <div className="px-5 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-[#eff6ff] to-gray-50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50">
              <Building2 size={22} className="text-[#1e3a8a]" />
            </div>
            <div>
              <h3 
                className="font-bold text-gray-900 text-lg leading-tight cursor-pointer hover:text-[#1e3a8a] transition"
                onClick={() => handleViewSociety(society._id)}
              >
                {society.name}
              </h3>
              <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                <Building2 size={14} className="text-gray-400" />
                {society.department} • {society.joinPolicy === "DEPARTMENT_ONLY" ? "Dept. Only" : "Open"}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            {/* Status Badge */}
            <span className={`px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-1 ${getStatusBadge(displayStatus)}`}>
              {isPending && <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-pulse" />}
              <StatusIcon size={12} />
              {displayStatus.replace("_", " ")}
            </span>
          </div>
        </div>

        {/* 📋 Content */}
        <div className="p-5 space-y-5">
          
          {/* 🔹 Application Details Preview */}
          {application && (
            <div className="p-4 bg-gray-50 rounded-xl space-y-3">
              <div className="flex items-start gap-3">
                <FileText size={18} className="text-gray-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Application Reason</p>
                  <p className="text-sm text-gray-800 mt-1 line-clamp-2">{application.reason}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 border-t border-gray-200">
                <DetailItem label="Skills" value={application.skills} />
                <DetailItem label="Experience" value={application.experience} />
                <DetailItem label="Availability" value={application.availability} />
              </div>
              
              <div className="flex items-center gap-2 text-xs text-gray-500 pt-2 border-t border-gray-200">
                <Calendar size={14} />
                <span>Applied: {formatDateTime(application.requestedAt)}</span>
              </div>
            </div>
          )}

          {/* 🔹 Member Badge (if already a member) */}
          {isMember && (
            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-xl border border-blue-200">
              <BadgeCheck size={18} className="text-[#1d4ed8]" />
              <span className="text-sm font-medium text-[#1e3a8a]">
                You're a member of this society! 🎉
              </span>
            </div>
          )}

          {/* 🔹 Action Hints */}
          {!isMember && application && (
            <div className="flex flex-wrap gap-2">
              {canWithdraw && (
                <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-yellow-50 text-yellow-700 text-xs font-medium">
                  <Clock size={14} /> Can withdraw while pending
                </span>
              )}
              {canReapply && (
                <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 text-[#1e3a8a] border border-[rgba(30,64,175,0.14)] text-xs font-medium">
                  <RefreshCw size={14} /> Can reapply now
                </span>
              )}
            </div>
          )}
        </div>

        {/* 🔹 Footer Actions */}
        <div className="px-5 py-4 bg-gray-50 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs text-gray-500 font-mono">
            ID: {society._id?.slice(-8)}
          </span>
          
          <div className="flex items-center gap-2">
            {/* View Society Button */}
            <button 
              onClick={() => handleViewSociety(society._id)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition"
            >
              <Eye size={14} /> View
            </button>

            {/* Withdraw Button */}
            {canWithdraw && (
              <button 
                onClick={() => handleWithdraw(society._id, society.name)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition"
              >
                <Trash2 size={14} /> Withdraw
              </button>
            )}

            {/* Reapply Button */}
            {canReapply && (
              <button 
                onClick={() => handleReapply(society._id)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-[#1e3a8a] rounded-lg hover:brightness-110 transition"
              >
                <RefreshCw size={14} /> Reapply
              </button>
            )}

            {/* Go to Society (for members) */}
            {isMember && (
              <a 
                href={`/societies/${society._id}`}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition"
              >
                Go to Society <ArrowRight size={14} />
              </a>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ✅ Detail Item Sub-component
  const DetailItem = ({ label, value }) => (
    <div>
      <span className="text-gray-500 block text-xs uppercase tracking-wide">{label}</span>
      <p className="text-sm font-medium text-gray-800 mt-0.5">{value || "—"}</p>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900">My Applications</h2>
          <p className="text-sm text-gray-500 mt-1">
            {applications.length} application{applications.length !== 1 ? 's' : ''} in your history
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Refresh Button */}
          <button 
            onClick={handleRefresh}
            disabled={loading}
            className="p-2 text-gray-500 hover:text-[#1e3a8a] hover:bg-[#eff6ff] rounded-lg transition disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          </button>
          
          {/* Browse Button */}
          <a 
            href="/societies" 
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#1e3a8a] bg-[#eff6ff] rounded-xl border border-[rgba(30,64,175,0.14)] hover:brightness-95 transition"
          >
            <Building2 size={16} /> Browse All
          </a>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <SummaryCard label="Total" value={summary.total} color="gray" />
          <SummaryCard label="Pending" value={summary.pending} color="yellow" />
          <SummaryCard label="Approved" value={summary.approved} color="green" />
          <SummaryCard label="Rejected" value={summary.rejected} color="red" />
          <SummaryCard 
            label="Member" 
            value={applications.filter(a => a.membershipStatus?.isMember).length} 
            color="blue" 
          />
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {["all", "pending", "approved", "rejected", "member"].map((f) => {
          const count = summary?.[f === "member" ? "approved" : f] || 0;
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filter === f 
                  ? "bg-[#1e3a8a] text-white shadow-sm" 
                  : "bg-white text-gray-700 hover:bg-[#eff6ff] border border-gray-200"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
              {f !== "all" && (
                <span className="ml-2 px-2 py-0.5 bg-white/30 rounded-full text-xs">
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
      
      {/* Applications List */}
      <div className="space-y-4">
        {filteredApps.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200">
            <Sparkles className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-600 font-medium">
              No {filter !== "all" ? filter : ""} applications found
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {filter === "all" ? "Start applying to societies!" : "Try changing your filter."}
            </p>
          </div>
        ) : (
          filteredApps.map(app => (
            <ApplicationCard key={app.society._id} app={app} />
          ))
        )}
      </div>
    </div>
  );
}

// 🔹 Summary Card Sub-component
const SummaryCard = ({ label, value, color }) => {
  const colors = {
    gray: "bg-gray-100 text-gray-800",
    yellow: "bg-yellow-100 text-yellow-800",
    green: "bg-green-100 text-green-800",
    red: "bg-red-100 text-red-800",
    blue: "bg-blue-50 text-[#1e3a8a]"
  };

  return (
    <div className={`p-3 rounded-xl ${colors[color]} text-center`}>
      <div className="text-xl font-bold">{value}</div>
      <div className="text-xs opacity-80">{label}</div>
    </div>
  );
};