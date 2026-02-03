import React, { useEffect, useState } from "react";
import axios from "axios";
import API_BASE_URL from "../../../config/api.config";
import { toast } from "react-hot-toast";
import {
  Calendar,
  ChevronDown,
  ChevronUp,
  Play,
  Clock,
  Building2,
  AlertCircle,
  Mail,
  Fingerprint,
  User
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
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/election/my-drafts`, {
        withCredentials: true,
      });

      const finalized = res.data.data.filter(
        (election) => election.status === "CANDIDATES_FINALIZED"
      );

      setElections(finalized);
    } catch (err) {
      console.error(err);
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
      toast.error("Start date and End date are required");
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
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to start election");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-slate-500 font-bold text-xs uppercase tracking-widest">Loading Dashboard</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12 px-4 sm:px-8">
      <div className="max-w-6xl mx-auto">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse"></div>
              <span className="text-indigo-600 font-black uppercase tracking-[0.2em] text-[10px]">Scheduling Engine</span>
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Deployment Center</h1>
          </div>
          <p className="text-slate-500 text-sm font-medium max-w-xs md:text-right">
            Manage finalized candidates and configure voting timelines for live deployment.
          </p>
        </div>

        {!elections.length ? (
          <div className="bg-white rounded-3xl p-20 text-center border border-slate-200 shadow-sm">
            <AlertCircle size={48} className="mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-bold text-slate-800 uppercase tracking-tight">No Queued Elections</h3>
            <p className="text-slate-500 text-sm mt-1">Finalize your candidate reviews to see elections here.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {elections.map((election) => {
              const isOpen = selectedElection === election._id;

              return (
                <div key={election._id} className={`bg-white rounded-[2rem] border transition-all duration-500 overflow-hidden ${isOpen ? 'border-indigo-500 shadow-2xl ring-1 ring-indigo-500/20' : 'border-slate-200 shadow-sm hover:shadow-md'}`}>

                  {/* Summary Bar */}
                  <div
                    onClick={() => setSelectedElection(isOpen ? null : election._id)}
                    className="p-6 cursor-pointer flex flex-col lg:flex-row lg:items-center justify-between gap-6"
                  >
                    <div className="flex items-center gap-5">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${isOpen ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                        <Building2 size={24} />
                      </div>
                      <div>
                        <h2 className="text-xl font-black text-slate-900">{election.title}</h2>
                        <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">{election.societyId.name}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-8">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Candidates</span>
                        <span className="text-sm font-bold text-slate-800">{election.candidates.length} Verified</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">System Status</span>
                        <div className="flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                          <span className="text-sm font-bold text-emerald-600 italic">Finalized</span>
                        </div>
                      </div>
                      <div className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                        <ChevronDown size={24} className="text-slate-300" />
                      </div>
                    </div>
                  </div>

                  {/* Expandable Section */}
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: "auto" }}
                        exit={{ height: 0 }}
                      >
                        <div className="px-8 pb-8">

                          {/* Candidates Table */}
                          <div className="mt-4 mb-10 bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50">
                              <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.15em]">Candidate Roster</h3>
                            </div>
                            <div className="overflow-x-auto">
                              <table className="w-full text-left">
                                <thead className="bg-slate-100/50 border-b border-slate-200">
                                  <tr>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase">Profile</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase">Contact Info</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase">Identity</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase">Role</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase text-center">Status</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                  {election.candidates.map((c) => (
                                    <tr key={c._id} className="hover:bg-white transition-colors group">
                                      <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                          <img
                                            src={`${API_BASE_URL.replace("/api", "")}/uploads/${c.image}`}
                                            alt=""
                                            className="w-10 h-10 rounded-xl object-cover grayscale group-hover:grayscale-0 transition-all border border-slate-200 shadow-sm"
                                          />
                                          <span className="text-sm font-bold text-slate-800">{c.user.fullname}</span>
                                        </div>
                                      </td>
                                      <td className="px-6 py-4">
                                        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                                          <Mail size={12} /> {c.email || "N/A"}
                                        </div>
                                      </td>
                                      <td className="px-6 py-4">
                                        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                                          <Fingerprint size={12} /> {c.cnic}
                                        </div>
                                      </td>
                                      <td className="px-6 py-4">
                                        <span className="px-2 py-1 bg-indigo-50 text-indigo-600 text-[9px] font-black uppercase rounded tracking-wider border border-indigo-100">
                                          {c.role}
                                        </span>
                                      </td>
                                      <td className="px-6 py-4">
                                        <div className="flex justify-center">
                                          <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase rounded-full border border-emerald-100 shadow-sm">
                                            <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse"></div>
                                            {c.status}
                                          </span>
                                        </div>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>

                          {/* Scheduling Controls */}
                          <div className="grid lg:grid-cols-3 gap-6 items-end bg-white p-8 rounded-[2rem] border-2 border-slate-100 shadow-inner">
                            <div className="space-y-3">
                              <div className="flex items-center gap-2 ml-1">
                                <Clock size={14} className="text-indigo-600" />
                                <label className="text-xs font-black text-slate-800 uppercase tracking-widest">Start Time</label>
                              </div>
                              <input
                                type="datetime-local"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:ring-4 focus:ring-indigo-500/10 focus:bg-white outline-none transition-all"
                              />
                            </div>

                            <div className="space-y-3">
                              <div className="flex items-center gap-2 ml-1">
                                <Calendar size={14} className="text-rose-500" />
                                <label className="text-xs font-black text-slate-800 uppercase tracking-widest">End Time</label>
                              </div>
                              <input
                                type="datetime-local"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:ring-4 focus:ring-rose-500/10 focus:bg-white outline-none transition-all"
                              />
                            </div>

                            <button
                              onClick={() => makeElectionLive(election._id)}
                              disabled={actionLoading}
                              className="w-full flex items-center justify-center gap-3 px-8 py-3.5 bg-slate-900 text-white rounded-xl font-black uppercase text-[11px] tracking-[0.2em] hover:bg-indigo-600 shadow-xl shadow-slate-200 transition-all active:scale-[0.98] disabled:opacity-50"
                            >
                              {actionLoading ? (
                                "Initializing..."
                              ) : (
                                <>Deploy Live <Play size={14} fill="white" /></>
                              )}
                            </button>
                          </div>

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

export default ScheduleVoting;