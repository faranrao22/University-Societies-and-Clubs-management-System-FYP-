import React, { useEffect, useState } from "react";
import axios from "axios";
import API_BASE_URL from "../../../config/api.config";
import { useNavigate } from "react-router-dom";
import { ChevronRight, ChevronDown, Users, Mail, Award, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function ElectionApplications() {
  const navigate = useNavigate();
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedElection, setExpandedElection] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");

  const fetchElections = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/election/my-election-applications`, {
        withCredentials: true,
      });
      setElections(res.data.data || []);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch elections");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchElections();
  }, []);

  const updateStatus = async (electionId, candidateId, action, reason = "") => {
    try {
      await axios.put(
        `${API_BASE_URL}/election/${electionId}/candidate/${candidateId}/review`,
        { action, rejectionReason: reason },
        { withCredentials: true }
      );
      fetchElections();
    } catch (err) {
      console.error(err);
      alert("Failed to update status");
    }
  };

  const handleReject = (electionId, candidateId) => {
    const reason = prompt("Enter rejection reason (optional):");
    updateStatus(electionId, candidateId, "reject", reason || "");
  };

  // ✅ Finalize election function
  const finalizeElection = async (electionId) => {
    try {
      await axios.patch(
        `${API_BASE_URL}/election/finalized-candidates/${electionId}`,
        {},
        { withCredentials: true }
      );
      alert("Election finalized successfully");
      fetchElections();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to finalize election");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fcfcfd]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1 }}
          className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcfcfd] py-16 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-1">
            <Users className="text-indigo-600" size={20} />
            <span className="text-indigo-600 font-black uppercase tracking-[0.15em] text-[10px]">Review Panel</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight">Candidate Applications</h1>
        </div>

        {elections.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center shadow-md">
            <Info className="mx-auto text-gray-300 mb-4" size={48} />
            <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">No applications found</p>
          </div>
        ) : (
          <div className="space-y-5">
            {elections.map((election) => {
              const filteredCandidates = election.candidates.filter((c) => {
                if (filterStatus === "all") return true;
                return c.applicationStatus === filterStatus;
              });

              const isExpanded = expandedElection === election.electionId;

              // ✅ Check if there is at least one approved candidate

              return (
                <div key={election.electionId} className="bg-white rounded-lg border border-gray-200 shadow-md overflow-hidden hover:shadow-lg transition-all">

                  {/* Accordion Header */}
                  <button
                    className={`w-full px-6 py-5 flex justify-between items-center transition-all ${isExpanded ? "bg-indigo-50/20" : "hover:bg-gray-50"}`}
                    onClick={() => setExpandedElection(isExpanded ? null : election.electionId)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="hidden sm:flex w-10 h-10 bg-white rounded-lg items-center justify-center shadow border border-gray-100">
                        <Award className={isExpanded ? "text-indigo-600" : "text-gray-400"} size={20} />
                      </div>
                      <div className="text-left">
                        <h2 className="text-lg sm:text-xl font-bold text-gray-900">{election.electionTitle}</h2>
                        <div className="flex items-center gap-2 mt-0.5 text-xs">
                          <span className="font-bold uppercase text-indigo-600">{election.society}</span>
                          <span className="text-gray-300">•</span>
                          <span className="text-gray-500 uppercase">{election.electionStatus}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="hidden sm:block text-xs text-gray-400 uppercase tracking-widest">{election.candidates.length} Applicants</span>
                      {isExpanded ? <ChevronDown className="text-indigo-600" /> : <ChevronRight className="text-gray-400" />}
                    </div>
                  </button>

                  {/* Accordion Content */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="p-6 border-t border-gray-100">
                          {/* Finalize Election Button */}
                          <div className="mb-4 flex justify-end">
                            <button
                              onClick={() => finalizeElection(election.electionId)}
                              disabled={election.electionStatus !== "APPLICATIONS_CLOSED"} // ✅ disable if applications not closed
                              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest shadow 
                                  ${election.electionStatus === "APPLICATIONS_CLOSED"
                                  ? "bg-indigo-600 text-white hover:bg-indigo-700"
                                  : "bg-gray-300 text-gray-600 cursor-not-allowed"}`}
                            >
                              Finalize Candidates
                            </button>

                          </div>


                          {/* Filter Bar */}
                          <div className="flex flex-wrap gap-2 mb-4">
                            {["all", "approved", "pending", "rejected"].map((status) => {
                              const count = election.candidates.filter((c) => status === "all" ? true : c.applicationStatus === status).length;
                              const isActive = filterStatus === status;
                              return (
                                <button
                                  key={status}
                                  onClick={() => setFilterStatus(status)}
                                  className={`px-4 py-1 rounded-lg font-black text-[9px] uppercase tracking-widest transition-all ${isActive ? "bg-gray-900 text-white shadow" : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                                    }`}
                                >
                                  {status} ({count})
                                </button>
                              );
                            })}
                          </div>

                          {/* Candidates Table */}
                          {filteredCandidates.length === 0 ? (
                            <div className="py-10 text-center bg-gray-50 rounded-lg border border-dashed border-gray-200">
                              <p className="text-gray-400 font-black uppercase text-[10px] tracking-widest">No candidates found</p>
                            </div>
                          ) : (
                            <div className="overflow-x-auto">
                              <table className="w-full text-sm text-left">
                                <thead className="border-b border-gray-200">
                                  <tr>
                                    <th className="px-4 py-3 text-gray-500 uppercase tracking-wider">Candidate</th>
                                    <th className="px-4 py-3 text-gray-500 uppercase tracking-wider">Contact</th>
                                    <th className="px-4 py-3 text-gray-500 uppercase tracking-wider">Position</th>
                                    <th className="px-4 py-3 text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-4 py-3 text-gray-500 uppercase tracking-wider text-right">Actions</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                  {filteredCandidates.map((c) => (
                                    <tr key={c.candidateId} className="hover:bg-gray-50 transition-colors">
                                      <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                          <div className="w-7 h-7 rounded-md bg-indigo-100 flex items-center justify-center text-indigo-600 font-black text-xs">
                                            {c.fullname.charAt(0)}
                                          </div>
                                          <span className="font-semibold text-gray-900">{c.fullname}</span>
                                        </div>
                                      </td>
                                      <td className="px-4 py-3 text-gray-500 text-xs flex items-center gap-1">
                                        <Mail size={12} /> {c.email}
                                      </td>
                                      <td className="px-4 py-3">
                                        <span className="px-2 py-0.5 text-[8px] font-black bg-indigo-50 text-indigo-600 rounded-sm uppercase tracking-wider border border-indigo-100">
                                          {c.role}
                                        </span>
                                      </td>
                                      <td className="px-4 py-3">
                                        <span className={`flex items-center gap-1 text-[8px] font-black uppercase tracking-widest ${c.applicationStatus === "approved"
                                          ? "text-green-600"
                                          : c.applicationStatus === "pending"
                                            ? "text-amber-500"
                                            : "text-red-600"
                                          }`}>
                                          <div
                                            className={`w-1.5 h-1.5 rounded-full ${c.applicationStatus === "approved"
                                              ? "bg-green-500"
                                              : c.applicationStatus === "pending"
                                                ? "bg-amber-400"
                                                : "bg-red-500"
                                              }`}
                                          />
                                          {c.applicationStatus.charAt(0).toUpperCase() + c.applicationStatus.slice(1)}
                                        </span>
                                      </td>
                                      <td className="px-4 py-3 text-right flex justify-end gap-2 flex-wrap">
                                        <button
                                          onClick={() => navigate(`/manager/reviewCandidate/${election.electionId}/${c.candidateId}`)}
                                          className="px-3 py-1 bg-blue-600 text-white rounded-md text-[8px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all"
                                        >
                                          View Application
                                        </button>
                                        {c.applicationStatus !== "approved" && (
                                          <button
                                            onClick={() => updateStatus(election.electionId, c.candidateId, "approve")}
                                            className="px-3 py-1 bg-gray-900 text-white rounded-md text-[8px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all"
                                          >
                                            Approve
                                          </button>
                                        )}
                                        {c.applicationStatus !== "rejected" && (
                                          <button
                                            onClick={() => handleReject(election.electionId, c.candidateId)}
                                            className="px-3 py-1 bg-white text-red-600 border border-red-100 rounded-md text-[8px] font-black uppercase tracking-widest hover:bg-red-50 transition-all"
                                          >
                                            Reject
                                          </button>
                                        )}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default ElectionApplications;
