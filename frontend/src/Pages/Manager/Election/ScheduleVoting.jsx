import React, { useEffect, useState } from "react";
import axios from "axios";
import API_BASE_URL, { uploadFileUrl } from "../../../config/api.config";
import { toast } from "react-hot-toast";
import {
  ChevronDown,
  Play,
  Building2,
  AlertCircle,
  Mail,
  Loader2,
  CalendarClock,
  RefreshCw,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const MANAGER_CARD_CLASS =
  "overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-0.5 hover:border-[#3699FF]/35 hover:shadow-md";

function ScheduleVoting() {
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedElection, setSelectedElection] = useState(null);
  const [scheduleDrafts, setScheduleDrafts] = useState({});
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
      setScheduleDrafts((prev) => {
        const next = { ...prev };
        finalized.forEach((election) => {
          if (!next[election._id]) next[election._id] = { startDate: "", endDate: "" };
        });
        return next;
      });
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
    const draft = scheduleDrafts[electionId] || { startDate: "", endDate: "" };
    const { startDate, endDate } = draft;

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
      setScheduleDrafts((prev) => ({
        ...prev,
        [electionId]: { startDate: "", endDate: "" },
      }));
    } catch (err) {
      toast.error("Failed to start election");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-gray-500">
        <Loader2 className="h-8 w-8 animate-spin text-[#3699FF]" />
      </div>
    );
  }

  return (
    <div className="manager-page-shell">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="manager-page-header mb-0">
          <h1 className="manager-page-heading">Schedule voting</h1>
          <p className="manager-page-subtitle">
            Set voting window for finalized elections and move them live.
          </p>
        </div>
        <button
          type="button"
          onClick={fetchElections}
          className="inline-flex items-center justify-center gap-2 self-start rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      <main className="space-y-4">
        {!elections.length ? (
          <div className="rounded-xl border border-gray-200 bg-white p-12 text-center shadow-sm">
            <AlertCircle className="mx-auto text-gray-300 mb-4" size={36} />
            <p className="text-sm text-[#4B5563]">
              No finalized elections available
            </p>
          </div>
        ) : (
          elections.map((election) => {
            const isOpen = selectedElection === election._id;

            return (
              <div
                key={election._id}
                className={MANAGER_CARD_CLASS}
              >
                <div
                  onClick={() =>
                    setSelectedElection(isOpen ? null : election._id)
                  }
                  className="p-5 sm:p-6 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-slate-100 border border-gray-200 flex items-center justify-center text-[#3699FF]">
                      <Building2 size={20} />
                    </div>
                    <div>
                      <h2 className="font-bold text-base sm:text-lg text-[#111827]">
                        {election.title}
                      </h2>
                      <p className="mt-0.5 text-[11px] uppercase tracking-widest text-[#4B5563]">
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

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: "auto" }}
                      exit={{ height: 0 }}
                    >
                      <div className="p-5 sm:p-6 border-t border-gray-200 space-y-6">

                        <div className="space-y-3">
                          <h3 className="text-xs font-bold uppercase tracking-widest text-[#3699FF]">
                            Verified Candidates
                          </h3>

                          {election.candidates.map((c) => (
                            <div
                              key={c._id}
                              className="flex items-center justify-between bg-slate-50 border border-gray-200 p-3.5 rounded-lg"
                            >
                              <div className="flex items-center gap-3">
                                <img
                                  src={uploadFileUrl(c.image)}
                                  className="w-10 h-10 rounded-md object-cover"
                                  alt=""
                                  onError={(e) => {
                                    e.currentTarget.src =
                                      "https://ui-avatars.com/api/?name=Candidate&background=e2e8f0&color=334155";
                                  }}
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

                              <span className="text-[10px] font-bold uppercase px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded-full border border-emerald-200">
                                {c.status}
                              </span>
                            </div>
                          ))}
                        </div>

                        <div className="rounded-xl border border-gray-200 bg-slate-50 p-4 sm:p-5">
                          <div className="mb-4 flex items-center gap-2">
                            <CalendarClock size={16} className="text-[#3699FF]" />
                            <h3 className="text-sm font-bold text-[#111827]">
                              Configure voting window
                            </h3>
                          </div>

                          <div className="grid md:grid-cols-3 gap-4 items-end">
                            <div>
                              <label className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                                Start Date
                              </label>
                              <input
                                type="datetime-local"
                                value={scheduleDrafts[election._id]?.startDate || ""}
                                onChange={(e) =>
                                  setScheduleDrafts((prev) => ({
                                    ...prev,
                                    [election._id]: {
                                      ...(prev[election._id] || { startDate: "", endDate: "" }),
                                      startDate: e.target.value,
                                    },
                                  }))
                                }
                                className="w-full mt-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-[#3699FF] focus:outline-none focus:ring-2 focus:ring-[#3699FF]/25"
                              />
                            </div>

                            <div>
                              <label className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                                End Date
                              </label>
                              <input
                                type="datetime-local"
                                value={scheduleDrafts[election._id]?.endDate || ""}
                                onChange={(e) =>
                                  setScheduleDrafts((prev) => ({
                                    ...prev,
                                    [election._id]: {
                                      ...(prev[election._id] || { startDate: "", endDate: "" }),
                                      endDate: e.target.value,
                                    },
                                  }))
                                }
                                className="w-full mt-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-[#3699FF] focus:outline-none focus:ring-2 focus:ring-[#3699FF]/25"
                              />
                            </div>

                            <button
                              onClick={() =>
                                makeElectionLive(election._id)
                              }
                              disabled={actionLoading}
                              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#3699FF] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-105 disabled:opacity-60"
                            >
                              {actionLoading ? (
                                "Deploying..."
                              ) : (
                                <>
                                  Deploy voting <Play size={14} />
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
