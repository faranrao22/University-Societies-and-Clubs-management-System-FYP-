// src/pages/student/profile/sections/ProfileElectionStatus.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../../context/AuthContext";
import API_BASE_URL, { uploadFileUrl } from "../../../config/api.config";
import { 
  FileText, Clock, CheckCircle, XCircle, AlertTriangle, 
  Calendar, ExternalLink, Loader2, AlertCircle as AlertIcon,
  RefreshCw, Info
} from "lucide-react";

export default function ProfileElectionStatus() {
  const { user } = useAuth();
  
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

        const res = await axios.get(`${API_BASE_URL}/election/my-applications`, {
          withCredentials: true,
        });

        if (res.data?.success) {
          setApplications(res.data.data || []);
        } else {
          setError(res.data?.message || "Failed to load applications");
        }
      } catch (err) {
        console.error("Error fetching applications:", err);
        
        if (err.response?.status === 401) {
          setError("Session expired. Please log in again.");
        } else {
          setError(err.response?.data?.message || "Something went wrong. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [user]);

  // ✅ Helper: Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case "approved": 
        return <CheckCircle size={18} className="text-green-500 flex-shrink-0" />;
      case "rejected": 
        return <XCircle size={18} className="text-red-500 flex-shrink-0" />;
      case "inDispute": 
        return <AlertTriangle size={18} className="text-amber-500 flex-shrink-0" />;
      default: 
        return <Clock size={18} className="text-yellow-500 flex-shrink-0" />;
    }
  };

  // ✅ Helper: Get status badge styling
  const getStatusBadge = (status) => {
    const styles = {
      approved: "bg-green-50 text-green-700 border-green-200",
      rejected: "bg-red-50 text-red-700 border-red-200",
      inDispute: "bg-amber-50 text-amber-700 border-amber-200",
      pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
    };
    return styles[status] || styles.pending;
  };

  // ✅ Helper: Get human-readable status text
  const getStatusText = (status) => {
    const texts = {
      approved: "Approved ✓",
      rejected: "Rejected ✗",
      inDispute: "Under Review ⚠",
      pending: "Pending Review",
    };
    return texts[status] || "Pending";
  };

  // ✅ Helper: Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric", month: "short", day: "numeric"
    });
  };

  // ✅ Helper: Check if application deadline has passed
  const isDeadlinePassed = (applyDeadline) => {
    if (!applyDeadline) return false;
    return new Date() > new Date(applyDeadline);
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
        <AlertIcon className="w-10 h-10 mx-auto text-red-400 mb-3" />
        <p className="text-red-600 font-medium mb-2">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="text-sm text-red-700 hover:text-red-900 underline font-medium"
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
        <h3 className="text-lg font-bold text-gray-900 mb-2">No Election Applications</h3>
        <p className="text-gray-500 mb-6 max-w-sm mx-auto">
          You haven't applied for any elections yet. Browse open elections and submit your candidacy!
        </p>
        <a 
          href="/elections" 
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1e3a8a] text-white rounded-xl font-medium shadow-md hover:brightness-110 transition"
        >
          Browse Elections <ExternalLink size={16} />
        </a>
      </div>
    );
  }

  // ✅ Application Card Component
  const ApplicationCard = ({ app }) => {
    const isRejected = app.status === "rejected";
    const isInDispute = app.status === "inDispute";
    const isApproved = app.status === "approved";
    const deadlinePassed = isDeadlinePassed(app.election?.applyDeadline);
    
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-lg transition group">
        <div className="flex items-start gap-4">
          {/* Status Icon */}
          <div className="mt-1">{getStatusIcon(app.status)}</div>
          
          <div className="flex-1 min-w-0">
            {/* Header: Election Title + Status Badge */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div>
                <h3 className="font-bold text-gray-900 text-lg">{app.election?.title}</h3>
                {app.election?.society && (
                  <p className="text-sm text-gray-500 mt-0.5">
                    {app.election.society.name}
                    {app.election.society.shortName && ` • ${app.election.society.shortName}`}
                  </p>
                )}
              </div>
              <span className={`text-xs font-semibold px-3 py-1.5 rounded-full border flex items-center gap-1.5 w-fit
                ${getStatusBadge(app.status)}`}>
                {getStatusIcon(app.status)}
                {getStatusText(app.status)}
              </span>
            </div>
            
            {/* Role & Position */}
            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
              <span className="px-2.5 py-1 bg-[#eff6ff] text-[#1e3a8a] border border-[rgba(30,64,175,0.14)] rounded-lg font-medium">
                Applying for: <strong>{app.role}</strong>
              </span>
              {app.election?.startDate && (
                <span className="flex items-center gap-1.5 text-gray-600">
                  <Calendar size={14} className="text-gray-400" />
                  Voting: {formatDate(app.election.startDate)}
                </span>
              )}
            </div>
            
            {/* 🔥 REJECTED Message */}
            {isRejected && app.reason && (
              <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm">
                <div className="flex items-start gap-2">
                  <XCircle size={16} className="mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold">Rejection Reason:</p>
                    <p className="mt-1 leading-relaxed">{app.reason}</p>
                    <p className="mt-2 text-red-600 font-medium">
                      You can apply to other elections, but cannot re-apply to this one.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {/* 🔥 IN DISPUTE Message - NEW */}
            {isInDispute && (
              <div className="mt-4 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-sm">
                <div className="flex items-start gap-3">
                  <AlertTriangle size={18} className="mt-0.5 flex-shrink-0 text-amber-600" />
                  <div className="flex-1">
                    <p className="font-semibold text-amber-800">
                      ⚠ Application Under Review
                    </p>
                    <p className="mt-2 leading-relaxed">
                      Your application has been flagged for review. Please resolve the issue below and re-apply before the deadline.
                    </p>
                    
                    {/* Show reason if provided */}
                    {app.reason && (
                      <div className="mt-3 p-3 bg-white rounded-lg border border-amber-100">
                        <p className="font-medium text-amber-700 flex items-center gap-1">
                          <Info size={14} /> Issue Details:
                        </p>
                        <p className="mt-1 text-amber-900">{app.reason}</p>
                      </div>
                    )}
                    
                    {/* Deadline Warning */}
                    <div className={`mt-3 p-3 rounded-lg flex items-start gap-2 ${
                      deadlinePassed 
                        ? "bg-red-100 border border-red-200 text-red-800" 
                        : "bg-amber-100 border border-amber-200 text-amber-800"
                    }`}>
                      <Calendar size={16} className="mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">
                          {deadlinePassed ? "❌ Deadline Passed" : "⏰ Application Deadline"}
                        </p>
                        <p className="mt-0.5">
                          {app.election?.applyDeadline 
                            ? formatDate(app.election.applyDeadline) 
                            : "Not specified"}
                        </p>
                        {deadlinePassed && (
                          <p className="mt-1 text-red-700 font-medium">
                            Unfortunately, you can no longer re-apply for this election.
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="mt-4 flex flex-wrap gap-2">
                      {!deadlinePassed && (
                        <a 
                          href={`/elections/${app.election?._id}/apply?role=${encodeURIComponent(app.role)}`}
                          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-amber-800 bg-amber-100 rounded-lg hover:bg-amber-200 transition"
                        >
                          <RefreshCw size={14} /> Re-Apply Now
                        </a>
                      )}
                      <a 
                        href={`/elections/${app.election?._id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-amber-700 bg-white border border-amber-200 rounded-lg hover:bg-amber-50 transition"
                      >
                        View Election Details <ExternalLink size={12} />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* ✅ APPROVED Success Message */}
            {isApproved && (
              <div className="mt-4 p-3 rounded-xl bg-green-50 border border-green-200 text-green-800 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} />
                  <span className="font-medium">Congratulations! Your application has been approved.</span>
                </div>
                <p className="mt-1 text-green-700">
                  You are now an official candidate. Voting will begin on {formatDate(app.election?.startDate)}.
                </p>
              </div>
            )}
            
            {/* ⏳ PENDING Message */}
            {app.status === "pending" && (
              <div className="mt-4 p-3 rounded-xl bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm">
                <div className="flex items-center gap-2">
                  <Clock size={16} />
                  <span className="font-medium">Your application is being reviewed.</span>
                </div>
                <p className="mt-1 text-yellow-700">
                  You'll be notified once a decision is made. Check back later for updates.
                </p>
              </div>
            )}
            
            {/* Timeline Info */}
            <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Calendar size={12} /> Applied: {formatDate(app.appliedAt)}
              </span>
              {app.updatedAt && app.status !== "pending" && (
                <span className="flex items-center gap-1">
                  <Clock size={12} /> Updated: {formatDate(app.updatedAt)}
                </span>
              )}
              <span className={`flex items-center gap-1 ${
                app.election?.status === "VOTING_LIVE" ? "text-green-600 font-medium" : ""
              }`}>
                Election: {app.election?.status?.replace("_", " ")}
              </span>
            </div>
          </div>
        </div>
        
        {/* Footer Actions */}
        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {app.image && (
              <img 
               src={uploadFileUrl(app.image)} 
                alt="Application"
                className="w-8 h-8 rounded-lg object-cover border"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            )}
            <span className="text-xs text-gray-400">CNIC: {app.cnic}</span>
          </div>
          
          <a 
            href={`/elections/${app.election?._id}`}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-[#1e3a8a] bg-[#eff6ff] rounded-xl border border-[rgba(30,64,175,0.14)] hover:brightness-95 transition"
          >
            View Election <ExternalLink size={14} />
          </a>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-2xl font-black text-gray-900">My Election Applications</h2>
        <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
          {applications.length} application{applications.length !== 1 ? 's' : ''}
        </span>
      </div>
      
      {/* Applications List */}
      <div className="space-y-4">
        {applications.map(app => (
          <ApplicationCard key={app._id} app={app} />
        ))}
      </div>
    </div>
  );
}