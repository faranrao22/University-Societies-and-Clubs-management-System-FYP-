// src/pages/student/profile/sections/ProfileElections.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../../context/AuthContext";
import API_BASE_URL, { uploadFileUrl } from "../../../config/api.config";
import { 
  Vote, Calendar, Trophy, ExternalLink, Users, Clock, 
  Loader2, AlertCircle, Medal, CheckCircle, XCircle, Crown, Star, Building2
} from "lucide-react";

export default function ProfileElections() {
  const { user } = useAuth();
  
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user === undefined) return;
    if (!user?._id) {
      if (user === null) setError("Please log in to view your elections.");
      setLoading(false);
      return;
    }
    
    const fetchElections = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await axios.get(`${API_BASE_URL}/election/my-participation`, {
          withCredentials: true,
        });

        if (res.data?.success) {
          // ✅ Handle both "data" and "resultData" keys for flexibility
          const electionsData = res.data.data || res.data.resultData || [];
          setElections(electionsData);
        } else {
          setError(res.data?.message || "Failed to load elections");
        }
      } catch (err) {
        console.error("Failed to fetch elections:", err);
        setError(err.response?.data?.message || "Something went wrong. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchElections();
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
      COMPLETED: "bg-green-50 text-green-700 border-green-200",
      VOTING_LIVE: "bg-blue-50 text-[#1d4ed8] border-blue-200 animate-pulse",
      VOTING_SCHEDULED: "bg-yellow-50 text-yellow-700 border-yellow-200",
      APPLICATIONS_OPEN: "bg-[#eff6ff] text-[#1e3a8a] border-[rgba(30,64,175,0.2)]",
      CANDIDATES_FINALIZED: "bg-blue-50 text-[#1e3a8a] border-blue-200",
      APPLICATIONS_CLOSED: "bg-gray-50 text-gray-700 border-gray-200",
    };
    return styles[status] || "bg-gray-50 text-gray-700 border-gray-200";
  };

  // ✅ Helper: Get participation info
  const getParticipationInfo = (participatedAs, candidateStatus, roleApplied) => {
    if (participatedAs === "candidate") {
      const statusInfo = {
        approved: { icon: CheckCircle, color: "text-green-600", label: "Approved Candidate" },
        rejected: { icon: XCircle, color: "text-red-600", label: "Rejected" },
        pending: { icon: Clock, color: "text-yellow-600", label: "Pending" },
        inDispute: { icon: AlertCircle, color: "text-amber-600", label: "Under Review" },
      };
      const info = statusInfo[candidateStatus] || statusInfo.pending;
      return { icon: info.icon, color: info.color, label: `${roleApplied || "Candidate"} • ${info.label}` };
    }
    return { icon: Users, color: "text-[#1e3a8a]", label: "Voter" };
  };

  // ✅ Helper: Check if user won a role
  const didUserWin = (winners, roleApplied) => {
    if (!winners || !roleApplied) return false;
    const roleWinners = winners[roleApplied];
    return roleWinners?.some(w => w.isYou) || false;
  };

  // ✅ Helper: Check if winners object has any data
  const hasWinners = (winners) => {
    if (!winners) return false;
    return Object.keys(winners).some(role => winners[role]?.length > 0);
  };

  // ✅ Loading State
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader2 className="animate-spin h-8 w-8 text-[#1e3a8a] mb-3" />
        <p className="text-sm text-gray-500">Loading your elections...</p>
      </div>
    );
  }

  // ✅ Error State
  if (error) {
    return (
      <div className="text-center py-12 bg-red-50 rounded-2xl border border-red-100">
        <AlertCircle className="w-10 h-10 mx-auto text-red-400 mb-3" />
        <p className="text-red-600 font-medium mb-2">{error}</p>
        <button onClick={() => window.location.reload()} className="text-sm text-red-700 hover:text-red-900 underline">
          Retry
        </button>
      </div>
    );
  }

  // ✅ Empty State
  if (elections.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-[2rem] border border-gray-100">
        <Vote className="w-16 h-16 mx-auto text-gray-300 mb-4" />
        <h3 className="text-lg font-bold text-gray-900 mb-2">No Elections Participated</h3>
        <p className="text-gray-500 mb-6 max-w-sm mx-auto">
          Your election participation history will appear here. Join an election to get started!
        </p>
        <a href="/elections" className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1e3a8a] text-white rounded-xl font-medium shadow-md hover:brightness-110 transition">
          Browse Elections <ExternalLink size={16} />
        </a>
      </div>
    );
  }

  // ✅ Election Detail Card Component
  const ElectionCard = ({ election }) => {
    const { icon: PartIcon, color: partColor, label: partLabel } = getParticipationInfo(
      election.participatedAs, election.candidateStatus, election.roleApplied
    );
    
    const isCompleted = election.status === "COMPLETED";
    const isLive = election.status === "VOTING_LIVE";
    const userWon = election.participatedAs === "candidate" && didUserWin(election.winners, election.roleApplied);
    const showWinners = isCompleted && hasWinners(election.winners);

    return (
      <div className={`bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl transition ${isLive ? 'ring-2 ring-emerald-200' : ''}`}>
        
        {/* 🎨 Header Banner */}
        <div className={`px-5 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${isLive ? 'bg-gradient-to-r from-blue-50 to-[#eff6ff]' : 'bg-gradient-to-r from-gray-50 to-slate-50'}`}>
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${isLive ? 'bg-blue-100' : 'bg-[#eff6ff]'}`}>
              <Vote size={22} className={isLive ? 'text-[#1d4ed8]' : 'text-[#1e3a8a]'} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg leading-tight">{election.title}</h3>
              <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                <Building2 size={14} className="text-gray-400" />
                {election.society}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            {/* 🏆 Winner Badge */}
            {userWon && showWinners && (
              <span className="px-3 py-1 bg-gradient-to-r from-[#D4A017] to-[#b8890f] text-white rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
                <Crown size={12} /> Winner!
              </span>
            )}
            {/* Status Badge */}
              <span className={`px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-1 ${getStatusBadge(election.status)}`}>
              {isLive && <span className="w-1.5 h-1.5 bg-[#1d4ed8] rounded-full animate-pulse" />}
              {election.status.replace("_", " ")}
            </span>
          </div>
        </div>

        {/* 📋 Content */}
        <div className="p-5 space-y-5">
          
          {/* 🔹 Participation Badge */}
          <div className="flex flex-wrap items-center gap-3">
            <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 ${partColor}`}>
              <PartIcon size={14} />
              <strong className="text-sm">{partLabel}</strong>
            </span>
            {election.roleApplied && election.participatedAs === "candidate" && (
              <span className="px-3 py-1.5 rounded-lg bg-[#eff6ff] text-[#1e3a8a] border border-[rgba(30,64,175,0.14)] text-sm font-medium">
                Role: {election.roleApplied}
              </span>
            )}
          </div>

          {/* 🔹 Election Timeline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl">
            <div className="flex items-start gap-3">
              <Calendar size={18} className="text-gray-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Voting Period</p>
                <p className="text-sm font-medium text-gray-900 mt-0.5">
                  {formatDate(election.startDate)} → {formatDate(election.endDate)}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock size={18} className="text-gray-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Application Deadline</p>
                <p className="text-sm font-medium text-gray-900 mt-0.5">
                  {formatDateTime(election.applyDeadline)}
                </p>
              </div>
            </div>
          </div>

          {/* 🔹 🏆 WINNERS SECTION - Only show when winners exist */}
          {showWinners && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                <Trophy size={20} className="text-amber-500" />
                <h4 className="font-bold text-gray-900">🏆 Election Winners</h4>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.entries(election.winners)
                  .filter(([_, winners]) => winners?.length > 0) // Only roles with winners
                  .map(([role, winners]) => {
                    const userIsWinner = winners.some(w => w.isYou);
                    
                    return (
                      <div 
                        key={role} 
                        className={`p-4 rounded-xl border-2 transition ${
                          userIsWinner 
                            ? 'border-amber-300 bg-gradient-to-br from-amber-50 to-yellow-50 shadow-sm' 
                            : 'border-gray-200 bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <Crown size={16} className="text-amber-500" />
                          <span className="font-semibold text-gray-800">{role}</span>
                          {userIsWinner && (
                            <span className="ml-auto text-xs px-2 py-0.5 bg-amber-200 text-amber-800 rounded-full font-medium animate-pulse">
                              That's You! 🎉
                            </span>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          {winners.map((winner, idx) => (
                            <div 
                              key={winner.userId || idx}
                              className={`flex items-center gap-3 p-2.5 rounded-lg transition ${
                                winner.isYou 
                                  ? 'bg-white border-2 border-amber-300 shadow-sm' 
                                  : 'bg-white/70 hover:bg-white'
                              }`}
                            >
                              {/* Winner Avatar */}
                              <div className="relative flex-shrink-0">
                                <img 
                                  src={winner.profileImage 
                                    ? uploadFileUrl(winner.profileImage) 
                                    : `https://ui-avatars.com/api/?name=${encodeURIComponent(winner.name)}&background=random&color=fff`}
                                  alt={winner.name}
                                  className="w-10 h-10 rounded-full object-cover border-2 border-amber-200"
                                  onError={(e) => {
                                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(winner.name)}&background=random&color=fff`;
                                  }}
                                />
                                {idx === 0 && (
                                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center shadow">
                                    <Star size={10} className="text-white" />
                                  </span>
                                )}
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <p className={`font-medium truncate ${winner.isYou ? 'text-amber-900' : 'text-gray-900'}`}>
                                  {winner.name}
                                  {winner.isYou && <span className="ml-2 text-xs text-amber-700 font-semibold">(You)</span>}
                                </p>
                                {idx === 0 && (
                                  <p className="text-xs text-amber-600 flex items-center gap-1 font-medium">
                                    <Medal size={10} /> 1st Place
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* 🔹 No Winners Message (for completed elections) */}
          {isCompleted && !showWinners && election.participatedAs === "candidate" && (
            <div className="p-4 bg-gray-50 rounded-xl text-center border border-dashed border-gray-200">
              <Trophy size={24} className="mx-auto text-gray-300 mb-2" />
              <p className="text-sm text-gray-500">
                Winners for this election have not been announced yet.
              </p>
            </div>
          )}

          {/* 🔹 Upcoming/Pending Status Message */}
          {!isCompleted && !isLive && (
            <div className="p-4 bg-gray-50 rounded-xl text-center border border-gray-100">
              <Clock size={24} className="mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-600">
                {election.status === "VOTING_SCHEDULED" 
                  ? "Voting hasn't started yet. Check back on the start date!" 
                  : election.status === "APPLICATIONS_OPEN"
                    ? "Applications are open. You can still apply or update your candidacy."
                    : election.status === "CANDIDATES_FINALIZED"
                      ? "Candidates are finalized. Voting will begin soon!"
                      : "Results will be available once voting concludes."}
              </p>
            </div>
          )}
        </div>

        {/* 🔹 Footer Actions */}
        <div className="px-5 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
          <span className="text-xs text-gray-500 font-mono">
            ID: {election.electionId?.slice(-8)}
          </span>
          <a 
            href={`/elections/${election.electionId}`}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-[#1e3a8a] bg-[#eff6ff] rounded-xl border border-[rgba(30,64,175,0.14)] hover:brightness-95 transition"
          >
            View Full Election <ExternalLink size={14} />
          </a>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-gray-900">Elections Participated</h2>
          <p className="text-sm text-gray-500 mt-1">
            {elections.length} election{elections.length !== 1 ? 's' : ''} in your history
          </p>
        </div>
        <a href="/elections" className="hidden sm:inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#1e3a8a] bg-[#eff6ff] rounded-xl border border-[rgba(30,64,175,0.14)] hover:brightness-95 transition">
          <Vote size={16} /> Browse All
        </a>
      </div>
      
      {/* Elections List */}
      <div className="space-y-5">
        {elections.map(election => (
          <ElectionCard key={election.electionId} election={election} />
        ))}
      </div>
    </div>
  );
}