import React, { useEffect, useState } from "react";
import axios from "axios";
import API_BASE_URL from "../../../config/api.config";
import { toast } from "react-hot-toast";
import {
  Calendar,
  ChevronDown,
  Play,
  Clock,
  Building2,
  AlertCircle,
  Mail,
  Fingerprint,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function ScheduleVoting() {
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedElection, setSelectedElection] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchElections = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/election/my-drafts`, {
        withCredentials: true,
      });

      const finalized = res.data.data.filter(
        (election) => election.status === "CANDIDATES_FINALIZED"
      );

      setElections(finalized);
    } catch (err) {
      toast.error("Failed to fetch elections");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchElections();
  }, []);

  const makeElectionLive = async (electionId) => {
    if (!startDate || !endDate) {
      toast.error("Start & End date required");
      return;
    }

    try {
      setActionLoading(true);

      await axios.patch(
        `${API_BASE_URL}/election/ScheduleElection/${electionId}`,
        { startDate, endDate },
        { withCredentials: true }
      );

      toast.success("Election is now LIVE");
      fetchElections();
      setSelectedElection(null);
      setStartDate("");
      setEndDate("");
    } catch (err) {
      toast.error("Failed to start election");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-[#3699FF] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 text-gray-900">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold tracking-tight text-[#3699FF]">
              Election Deployment Center
            </h1>
            <p className="text-xs text-[#4B5563] uppercase tracking-widest">
              Schedule & Activate Voting
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 mt-10 space-y-6">
        {!elections.length ? (
          <div className="bg-white border border-gray-200 rounded-xl p-12 text-center shadow-sm">
            <AlertCircle className="mx-auto text-gray-300 mb-4" size={36} />
            <p className="text-[#4B5563] text-sm">
              No finalized elections available
            </p>
          </div>
        ) : (
          elections.map((election) => {
            const isOpen = selectedElection === election._id;

            return (
              <div
                key={election._id}
                className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden"
              >
                {/* Summary */}
                <div
                  onClick={() =>
                    setSelectedElection(isOpen ? null : election._id)
                  }
                  className="p-6 flex items-center justify-between cursor-pointer hover:bg-gray-100 transition"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-slate-100 border border-gray-200 flex items-center justify-center text-[#3699FF]">
                      <Building2 size={20} />
                    </div>
                    <div>
                      <h2 className="font-bold text-lg">
                        {election.title}
                      </h2>
                      <p className="text-xs uppercase tracking-widest text-[#4B5563]">
                        {election.societyId?.name || "Unknown Society"}
                      </p>
                    </div>
                  </div>

                  <ChevronDown
                    className={`transition-transform ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </div>

                {/* Expand */}
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: "auto" }}
                      exit={{ height: 0 }}
                    >
                      <div className="p-6 border-t border-gray-200 space-y-8">

                        {/* Candidate List */}
                        <div className="space-y-3">
                          <h3 className="text-xs font-bold uppercase tracking-widest text-[#3699FF]">
                            Verified Candidates
                          </h3>

                          {election.candidates.map((c) => (
                            <div
                              key={c._id}
                              className="flex items-center justify-between bg-slate-100/90 border border-gray-100 p-4 rounded-lg"
                            >
                              <div className="flex items-center gap-3">
                                <img
                                  src={`${API_BASE_URL.replace("/api", "")}/uploads/${c.image}`}
                                  className="w-10 h-10 rounded-md object-cover"
                                  alt=""
                                />
                                <div>
                                  <p className="font-semibold text-sm">
                                    {c.user?.fullname}
                                  </p>
                                  <p className="text-xs text-slate-500 flex items-center gap-2">
                                    <Mail size={12} />
                                    {c.user?.email}
                                  </p>
                                </div>
                              </div>

                              <span className="text-[10px] font-bold uppercase px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full border border-emerald-200">
                                {c.status}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Scheduling Section */}
                        <div className="bg-gradient-to-r from-[#3699FF] via-[#4dabf7] to-[#7ec8fc] rounded-xl p-6 text-white shadow-md">
                          <h3 className="text-sm font-bold mb-6">
                            Configure Voting Window
                          </h3>

                          <div className="grid md:grid-cols-3 gap-4 items-end">
                            <div>
                              <label className="text-xs uppercase text-white/70">
                                Start Date
                              </label>
                              <input
                                type="datetime-local"
                                value={startDate}
                                onChange={(e) =>
                                  setStartDate(e.target.value)
                                }
                                className="w-full mt-2 bg-white/10 border border-white/25 rounded-md px-3 py-2 text-sm text-white placeholder-white/50"
                              />
                            </div>

                            <div>
                              <label className="text-xs uppercase text-white/70">
                                End Date
                              </label>
                              <input
                                type="datetime-local"
                                value={endDate}
                                onChange={(e) =>
                                  setEndDate(e.target.value)
                                }
                                className="w-full mt-2 bg-white/10 border border-white/25 rounded-md px-3 py-2 text-sm text-white placeholder-white/50"
                              />
                            </div>

                            <button
                              onClick={() =>
                                makeElectionLive(election._id)
                              }
                              disabled={actionLoading}
                              className="bg-white text-[#3699FF] hover:bg-white/90 transition px-6 py-3 rounded-md font-bold text-sm flex items-center justify-center gap-2 shadow-lg"
                            >
                              {actionLoading ? (
                                "Deploying..."
                              ) : (
                                <>
                                  Deploy <Play size={14} />
                                </>
                              )}
                            </button>
                          </div>
                        </div>

                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })
        )}
      </main>
    </div>
  );
}

export default ScheduleVoting;
